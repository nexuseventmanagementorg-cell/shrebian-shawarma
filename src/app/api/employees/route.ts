import { NextResponse } from 'next/server';
import { getUsers, createUser, updateUserKYC, loadDatabase, saveDatabase } from '@/lib/db';
import { hashPosPin } from '@/lib/posAuth';

function withoutPinSecrets<T extends { pin?: string; pinHash?: string }>(user: T) {
  const { pin: _pin, pinHash: _pinHash, posSessionVersion: _sessionVersion, ...safeUser } = user as T & { posSessionVersion?: number };
  return { ...safeUser, hasPosPin: Boolean(user.pinHash) };
}

export async function GET(request: Request) {
  try {
    const users = getUsers();
    if (new URL(request.url).searchParams.get('view') === 'pos') {
      const employees = users
        .filter(user => user.role !== 'owner' && user.employmentStatus === 'active' && user.kycStatus === 'verified' && Boolean(user.pinHash))
        .map(({ id, fullName, username, role, assignedSellingPointId, assignedShiftId }) => ({
        id,
        fullName,
        username,
        role,
        assignedSellingPointId,
        assignedShiftId
      }));
      return NextResponse.json({ success: true, employees });
    }
    return NextResponse.json({ success: true, employees: users.map(withoutPinSecrets) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, username, mobile, cnic, residentialAddress, emergencyContact, role, assignedSellingPointId, assignedShiftId, pin } = body;

    if (
      typeof fullName !== 'string' || !fullName.trim() ||
      typeof mobile !== 'string' || !mobile.trim() ||
      typeof cnic !== 'string' || !cnic.trim() ||
      typeof residentialAddress !== 'string' || !residentialAddress.trim() ||
      typeof emergencyContact !== 'string' || !emergencyContact.trim() ||
      typeof assignedSellingPointId !== 'string' || !assignedSellingPointId ||
      typeof assignedShiftId !== 'string' || !assignedShiftId ||
      typeof pin !== 'string' || !/^\d{6,8}$/.test(pin)
    ) {
      return NextResponse.json({
        success: false,
        error: "Name, mobile, CNIC, address, emergency contact, selling point, shift, and a 6-8 digit POS PIN are required."
      }, { status: 400 });
    }
    if (!['employee', 'supervisor'].includes(role)) {
      return NextResponse.json({ success: false, error: "Only employee and supervisor accounts can be registered here. Owner access uses secure admin login." }, { status: 400 });
    }

    const state = loadDatabase();
    if (!state.sellingPoints.some(point => point.id === assignedSellingPointId && point.isActive)) {
      return NextResponse.json({ success: false, error: "Choose an active selling point." }, { status: 400 });
    }
    if (!state.shiftSchedules.some(schedule => schedule.id === assignedShiftId && schedule.status === 'active')) {
      return NextResponse.json({ success: false, error: "Choose an active shift schedule." }, { status: 400 });
    }
    const employeeUsername = typeof username === 'string' && username.trim()
      ? username.trim()
      : mobile.replace(/\D/g, '').slice(-6);
    if (!employeeUsername) {
      return NextResponse.json({ success: false, error: "A username could not be generated from this mobile number." }, { status: 400 });
    }
    if (state.users.some(user => user.username.toLowerCase() === employeeUsername.toLowerCase())) {
      return NextResponse.json({ success: false, error: "That username is already in use." }, { status: 409 });
    }

    const pinHash = await hashPosPin(pin);
    const newEmployee = createUser({
      fullName: fullName.trim(),
      username: employeeUsername,
      role,
      mobile: mobile.trim(),
      cnic: cnic.trim(),
      residentialAddress: residentialAddress.trim(),
      emergencyContact: emergencyContact.trim(),
      joiningDate: new Date().toISOString().split('T')[0],
      assignedSellingPointId,
      assignedShiftId,
      kycStatus: 'under_review',
      employmentStatus: 'active',
      pinHash
    });

    return NextResponse.json({ success: true, employee: withoutPinSecrets(newEmployee) });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { action, userId, status, notes, assignedSellingPointId, assignedShiftId, adminUser, pin } = body;

    if (action === 'kyc') {
      const updated = updateUserKYC(userId, status, notes, adminUser || 'Kaleem Durrani');
      if (!updated) return NextResponse.json({ success: false, error: 'Employee account not found.' }, { status: 404 });
      return NextResponse.json({ success: true, employee: withoutPinSecrets(updated) });
    }

    if (action === 'pin_reset') {
      if (typeof userId !== 'string' || typeof pin !== 'string' || !/^\d{6,8}$/.test(pin)) {
        return NextResponse.json({ success: false, error: 'Enter a new 6-8 digit employee PIN.' }, { status: 400 });
      }
      const state = loadDatabase();
      const employee = state.users.find(user => user.id === userId && user.role !== 'owner');
      if (!employee) return NextResponse.json({ success: false, error: 'Employee account not found.' }, { status: 404 });
      employee.pinHash = await hashPosPin(pin);
      employee.posSessionVersion = (employee.posSessionVersion || 0) + 1;
      delete employee.pin;
      state.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'usr_kaleem',
        userName: adminUser || 'Kaleem Durrani',
        action: 'RESET_EMPLOYEE_POS_PIN',
        entityType: 'USER',
        entityId: employee.id,
        newValue: `POS PIN reset for ${employee.fullName}`
      });
      saveDatabase(state);
      return NextResponse.json({ success: true, employee: withoutPinSecrets(employee) });
    }

    if (action === 'deactivate') {
      if (typeof userId !== 'string') {
        return NextResponse.json({ success: false, error: 'Employee account is required.' }, { status: 400 });
      }
      const state = loadDatabase();
      const employee = state.users.find(user => user.id === userId && user.role !== 'owner');
      if (!employee) return NextResponse.json({ success: false, error: 'Employee account not found.' }, { status: 404 });
      employee.employmentStatus = 'inactive';
      employee.posSessionVersion = (employee.posSessionVersion || 0) + 1;
      state.auditLogs.unshift({
        id: `audit_${Date.now()}`,
        timestamp: new Date().toISOString(),
        userId: 'usr_kaleem',
        userName: adminUser || 'Kaleem Durrani',
        action: 'DEACTIVATE_EMPLOYEE',
        entityType: 'USER',
        entityId: employee.id,
        newValue: `Deactivated ${employee.fullName}`
      });
      saveDatabase(state);
      return NextResponse.json({ success: true, employee: withoutPinSecrets(employee) });
    }

    if (action === 'assign') {
      const state = loadDatabase();
      const user = state.users.find(u => u.id === userId);
      if (!user) return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });

      const assignmentChanged =
        (assignedSellingPointId !== undefined && assignedSellingPointId !== user.assignedSellingPointId) ||
        (assignedShiftId !== undefined && assignedShiftId !== user.assignedShiftId);
      if (assignedSellingPointId !== undefined) user.assignedSellingPointId = assignedSellingPointId;
      if (assignedShiftId !== undefined) user.assignedShiftId = assignedShiftId;
      if (assignmentChanged) user.posSessionVersion = (user.posSessionVersion || 0) + 1;

      saveDatabase(state);
      return NextResponse.json({ success: true, employee: withoutPinSecrets(user) });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
