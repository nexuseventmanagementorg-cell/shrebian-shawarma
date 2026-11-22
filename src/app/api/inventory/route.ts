import { NextResponse } from 'next/server';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function GET() {
  try {
    const state = loadDatabase();

    // Calculate current stock levels by location & product
    const stockMap: Record<string, { product: any; centralKitchen: number; coldBoxes: number; sellingPoints: number; total: number }> = {};

    state.products.forEach(p => {
      stockMap[p.id] = {
        product: p,
        centralKitchen: 0,
        coldBoxes: 0,
        sellingPoints: 0,
        total: 0
      };
    });

    state.inventoryLedger.forEach(entry => {
      const item = stockMap[entry.productId];
      if (!item) return;

      if (entry.destinationLocation === 'central_kitchen') {
        item.centralKitchen += entry.quantity;
      } else if (entry.destinationLocation === 'employee_cold_box') {
        item.coldBoxes += entry.quantity;
      } else if (entry.destinationLocation === 'selling_point') {
        item.sellingPoints += entry.quantity;
      }

      if (entry.sourceLocation === 'central_kitchen' && entry.destinationLocation !== 'central_kitchen') {
        item.centralKitchen += entry.quantity; // entry.quantity is negative for deductions
      } else if (entry.sourceLocation === 'employee_cold_box' && entry.destinationLocation !== 'employee_cold_box') {
        item.coldBoxes += entry.quantity;
      } else if (entry.sourceLocation === 'selling_point' && entry.destinationLocation !== 'selling_point') {
        item.sellingPoints += entry.quantity;
      }

      item.total = Math.max(0, item.centralKitchen + item.coldBoxes + item.sellingPoints);
    });

    return NextResponse.json({
      success: true,
      stockSummary: Object.values(stockMap),
      ledger: state.inventoryLedger.slice(0, 50)
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, productId, quantity, sourceLocation, destinationLocation, responsibleEmployeeId, reason, authorizedBy } = body;

    const state = loadDatabase();
    const prod = state.products.find(p => p.id === productId);
    const employee = state.users.find(u => u.id === responsibleEmployeeId) || state.users[0];
    const now = new Date();

    if (action === 'dispatch') {
      // Dispatched from central kitchen to cold box / selling point
      state.inventoryLedger.push({
        id: `ledg_disp_${Date.now()}`,
        timestamp: now.toISOString(),
        businessDate: now.toISOString().split('T')[0],
        productId,
        productName: prod?.name || productId,
        movementType: "employee_issuance",
        quantity: Number(quantity),
        unitCost: prod?.productionCost || 0,
        totalCost: Number(quantity) * (prod?.productionCost || 0),
        sourceLocation: sourceLocation || "central_kitchen",
        destinationLocation: destinationLocation || "employee_cold_box",
        responsibleEmployeeId: employee.id,
        responsibleEmployeeName: employee.fullName,
        reason: reason || "Daily stock issuance to cold box",
        authorizedBy: authorizedBy || "Kaleem Durrani"
      });

      saveDatabase(state);
      return NextResponse.json({ success: true, message: "Stock dispatched successfully" });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
