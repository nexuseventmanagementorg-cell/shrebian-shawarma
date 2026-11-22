import { NextResponse } from 'next/server';
import { hasValidAdminSession } from '@/lib/adminSession';
import { getAuthorizedPosUser } from '@/lib/posAuth';
import { loadDatabase } from '@/lib/db';

export async function GET(request: Request) {
  if (await hasValidAdminSession(request)) {
    const owner = loadDatabase().users.find(user => user.role === 'owner' && user.employmentStatus === 'active');
    if (!owner) {
      return NextResponse.json({ success: false, error: 'Owner is not authorized to operate POS. Contact the system administrator.' }, { status: 403 });
    }
    return NextResponse.json({
      success: true,
      kind: 'owner',
      employee: { id: owner.id, fullName: owner.fullName, role: owner.role, assignedSellingPointId: owner.assignedSellingPointId, assignedShiftId: owner.assignedShiftId }
    });
  }

  const authorized = await getAuthorizedPosUser(request);
  if (!authorized || authorized.kind !== 'employee') {
    return NextResponse.json({
      success: false,
      error: 'POS access denied. Employees must sign in with their own POS PIN; the owner must sign in through the secure admin login.'
    }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    kind: 'employee',
    employee: {
      id: authorized.user.id,
      fullName: authorized.user.fullName,
      role: authorized.user.role,
      assignedSellingPointId: authorized.user.assignedSellingPointId,
      assignedShiftId: authorized.user.assignedShiftId
    }
  });
}
