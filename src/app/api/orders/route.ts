import { NextResponse } from 'next/server';
import { getOrders, createOrder, getActiveShiftSessionForEmployee, loadDatabase, saveDatabase } from '@/lib/db';
import { OrderStatus } from '@/types';
import { getAuthorizedPosUser } from '@/lib/posAuth';
import { hasValidAdminSession } from '@/lib/adminSession';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');
    const employeeId = searchParams.get('employeeId');
    const sellingPointId = searchParams.get('sellingPointId');
    const status = searchParams.get('status');

    let orders = getOrders();
    if (date) {
      orders = orders.filter(o => o.businessDate === date);
    }
    if (employeeId) {
      orders = orders.filter(o => o.employeeId === employeeId);
    }
    if (sellingPointId) {
      orders = orders.filter(o => o.sellingPointId === sellingPointId);
    }
    if (status) {
      orders = orders.filter(o => o.status === status);
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    let orderData = body;
    if (body.channel === 'pos') {
      const authorization = await getAuthorizedPosUser(request);
      if (!authorization) {
        if (await hasValidAdminSession(request)) {
          return NextResponse.json({ success: false, error: 'Owner POS access denied. The owner account is inactive or unauthorized.' }, { status: 403 });
        }
        return NextResponse.json({
          success: false,
          error: 'POS order denied. Owner must sign in through secure admin login; employees must sign in with their own POS PIN.'
        }, { status: 401 });
      }
      if (typeof body.employeeId === 'string' && body.employeeId !== authorization.user.id) {
        return NextResponse.json({ success: false, error: 'You are not authorized to create POS orders for another account.' }, { status: 403 });
      }
      const activeShift = getActiveShiftSessionForEmployee(authorization.user.id);
      if (!activeShift || activeShift.sellingPointId !== body.sellingPointId) {
        return NextResponse.json({ success: false, error: 'POS order denied. Check in and start your shift at this selling point first.' }, { status: 403 });
      }
      orderData = { ...body, employeeId: authorization.user.id };
    } else {
      orderData = { ...body, employeeId: undefined };
    }

    const result = createOrder(orderData);
    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }
    return NextResponse.json({ success: true, order: result.order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { orderId, status, notes, adminUser } = body;
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: "orderId and status are required" }, { status: 400 });
    }

    const state = loadDatabase();
    const order = state.orders.find(o => o.id === orderId || o.orderNumber === orderId);
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }

    const oldStatus = order.status;
    order.status = status as OrderStatus;
    if (notes) order.notes = `${order.notes || ''} | ${notes}`;

    // Handle cancellation / refund without deleting history
    if (status === 'cancelled' || status === 'refunded') {
      order.paymentStatus = 'refunded';
      // Return stock in ledger
      order.items.forEach(item => {
        state.inventoryLedger.push({
          id: `ledg_refund_${Date.now()}_${item.productId}`,
          timestamp: new Date().toISOString(),
          businessDate: order.businessDate,
          productId: item.productId,
          productName: item.productName,
          movementType: "return",
          quantity: item.quantity,
          unitCost: item.unitCost,
          totalCost: item.unitCost * item.quantity,
          sourceLocation: "customer",
          destinationLocation: "employee_cold_box",
          responsibleEmployeeId: order.employeeId,
          responsibleEmployeeName: order.employeeName,
          shiftSessionId: order.shiftSessionId,
          sellingPointId: order.sellingPointId,
          orderId: order.id,
          reason: `Order ${order.orderNumber} ${status}`,
          authorizedBy: adminUser || "Kaleem Durrani"
        });
      });
    }

    state.auditLogs.unshift({
      id: `audit_${Date.now()}`,
      timestamp: new Date().toISOString(),
      userId: "usr_kaleem",
      userName: adminUser || "Kaleem Durrani",
      action: "UPDATE_ORDER_STATUS",
      entityType: "ORDER",
      entityId: order.id,
      previousValue: oldStatus,
      newValue: status,
      reason: notes
    });

    saveDatabase(state);
    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
