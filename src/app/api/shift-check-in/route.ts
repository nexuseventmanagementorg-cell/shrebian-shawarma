import { NextResponse } from 'next/server';
import {
  getActiveShiftSessionForEmployee,
  getShiftSchedules,
  loadDatabase,
  startEmployeeShift,
  updateShiftOpeningLocation
} from '@/lib/db';
import { getAuthorizedPosUser } from '@/lib/posAuth';
import { hasValidAdminSession } from '@/lib/adminSession';

export async function POST(request: Request) {
  let body: {
    employeeId?: unknown;
    sellingPointId?: unknown;
    shiftScheduleId?: unknown;
    location?: { lat?: unknown; lng?: unknown; accuracyMeters?: unknown };
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid check-in request.' }, { status: 400 });
  }

  const { employeeId, sellingPointId, shiftScheduleId, location } = body;
  if (
    typeof sellingPointId !== 'string' ||
    typeof shiftScheduleId !== 'string' ||
    !location
  ) {
    return NextResponse.json({ success: false, error: 'Selling point, shift, and device location are required.' }, { status: 400 });
  }

  const lat = Number(location.lat);
  const lng = Number(location.lng);
  const accuracyMeters = Number(location.accuracyMeters);
  if (
    !Number.isFinite(lat) || lat < -90 || lat > 90 ||
    !Number.isFinite(lng) || lng < -180 || lng > 180 ||
    !Number.isFinite(accuracyMeters) || accuracyMeters < 0
  ) {
    return NextResponse.json({ success: false, error: 'The device returned invalid location coordinates.' }, { status: 400 });
  }

  const authorization = await getAuthorizedPosUser(request);
  if (!authorization) {
    if (await hasValidAdminSession(request)) {
      return NextResponse.json({ success: false, error: 'Owner check-in denied. The owner account is inactive or is not authorized for POS.' }, { status: 403 });
    }
    return NextResponse.json({
      success: false,
      error: 'Check-in not authorized. Owner: sign in through secure admin login. Employee: sign in to POS with your own PIN.'
    }, { status: 401 });
  }

  const state = loadDatabase();
  const employee = authorization.user;
  if (typeof employeeId === 'string' && employeeId !== employee.id) {
    return NextResponse.json({ success: false, error: 'You are not authorized to check in for another account.' }, { status: 403 });
  }

  const point = state.sellingPoints.find(candidate => candidate.id === sellingPointId && candidate.isActive);
  if (!point) {
    return NextResponse.json({ success: false, error: 'Choose an active selling point.' }, { status: 400 });
  }
  if (
    authorization.kind === 'employee' &&
    (!employee.assignedSellingPointId || employee.assignedSellingPointId !== point.id)
  ) {
    return NextResponse.json({ success: false, error: 'This employee is assigned to a different selling point.' }, { status: 403 });
  }

  const schedule = getShiftSchedules().find(candidate => candidate.id === shiftScheduleId && candidate.status === 'active');
  if (!schedule) {
    return NextResponse.json({ success: false, error: 'Choose an active shift schedule.' }, { status: 400 });
  }
  if (
    authorization.kind === 'employee' &&
    (!employee.assignedShiftId || employee.assignedShiftId !== schedule.id)
  ) {
    return NextResponse.json({ success: false, error: 'This employee is assigned to a different shift.' }, { status: 403 });
  }

  const currentLocation = { lat, lng, accuracyMeters };
  const existingSession = getActiveShiftSessionForEmployee(employee.id);
  if (existingSession) {
    if (existingSession.sellingPointId !== point.id || existingSession.shiftScheduleId !== schedule.id) {
      return NextResponse.json({
        success: false,
        error: 'This employee already has an active shift at another point or schedule. Close that shift before checking in here.'
      }, { status: 409 });
    }
    const updatedSession = updateShiftOpeningLocation(employee.id, existingSession.id, currentLocation);
    if (!updatedSession) {
      return NextResponse.json({ success: false, error: 'The active shift changed. Refresh and try again.' }, { status: 409 });
    }
    return NextResponse.json({
      success: true,
      session: { id: updatedSession.id, shiftName: updatedSession.shiftName, sellingPointName: updatedSession.sellingPointName }
    });
  }

  const session = startEmployeeShift(employee.id, point.id, schedule.id, currentLocation);
  return NextResponse.json({
    success: true,
    session: { id: session.id, shiftName: session.shiftName, sellingPointName: session.sellingPointName }
  });
}
