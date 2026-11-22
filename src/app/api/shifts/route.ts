import { NextResponse } from 'next/server';
import {
  getShiftSchedules,
  getShiftSessions,
  startEmployeeShift,
  closeEmployeeShift,
  transferInventoryBetweenShifts,
  loadDatabase,
  saveDatabase
} from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const employeeId = searchParams.get('employeeId');
    const status = searchParams.get('status');

    let sessions = getShiftSessions();
    if (employeeId) {
      sessions = sessions.filter(s => s.employeeId === employeeId);
    }
    if (status) {
      sessions = sessions.filter(s => s.status === status);
    }

    if (searchParams.get('view') === 'pos') {
      const schedules = getShiftSchedules().map(({ id, name, defaultStartTime, defaultEndTime, isOvernight, status }) => ({
        id,
        name,
        defaultStartTime,
        defaultEndTime,
        isOvernight,
        status
      }));
      return NextResponse.json({
        success: true,
        schedules,
        sessions: sessions
          .filter(session => session.status === 'active')
          .map(({ id, status: sessionStatus, employeeId, sellingPointId, shiftScheduleId, shiftName }) => ({
            id,
            status: sessionStatus,
            employeeId,
            sellingPointId,
            shiftScheduleId,
            shiftName
          }))
      });
    }

    return NextResponse.json({
      success: true,
      schedules: getShiftSchedules(),
      sessions
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'start') {
      const { employeeId, sellingPointId, shiftScheduleId, openingGps } = body;
      if (!employeeId || !sellingPointId) {
        return NextResponse.json({ success: false, error: "employeeId and sellingPointId are required" }, { status: 400 });
      }
      const session = startEmployeeShift(employeeId, sellingPointId, shiftScheduleId || 'shift_night', openingGps);
      return NextResponse.json({ success: true, session });
    }

    if (action === 'close') {
      const { sessionId, actualCashCounted, closingInventory, closingNotes } = body;
      if (!sessionId || actualCashCounted === undefined) {
        return NextResponse.json({ success: false, error: "sessionId and actualCashCounted are required" }, { status: 400 });
      }
      const session = closeEmployeeShift(sessionId, {
        actualCashCounted: Number(actualCashCounted),
        closingInventory: closingInventory || [],
        closingNotes
      });
      return NextResponse.json({ success: true, session });
    }

    if (action === 'transfer_inventory') {
      const { sourceShiftId, targetShiftId, items, authorizedBy } = body;
      if (!sourceShiftId || !targetShiftId || !items || !Array.isArray(items)) {
        return NextResponse.json({ success: false, error: "sourceShiftId, targetShiftId and items array are required" }, { status: 400 });
      }
      const success = transferInventoryBetweenShifts(sourceShiftId, targetShiftId, items, authorizedBy);
      return NextResponse.json({ success });
    }

    if (action === 'create_schedule') {
      const state = loadDatabase();
      const newSchedule = {
        id: `shift_${Date.now()}`,
        name: body.name || "Special Shift",
        defaultStartTime: body.defaultStartTime || "18:00",
        defaultEndTime: body.defaultEndTime || "23:00",
        isOvernight: !!body.isOvernight,
        status: 'active' as const,
        description: body.description || "Custom configured shift"
      };
      state.shiftSchedules.push(newSchedule);
      saveDatabase(state);
      return NextResponse.json({ success: true, schedule: newSchedule });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
