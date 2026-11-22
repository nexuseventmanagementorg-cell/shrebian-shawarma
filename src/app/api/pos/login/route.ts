import { NextResponse } from 'next/server';
import {
  createPosSessionToken,
  getPosSessionCookieOptions,
  verifyPosPin
} from '@/lib/posAuth';
import { loadDatabase } from '@/lib/db';

const failedAttempts = new Map<string, { count: number; resetAt: number }>();
const ATTEMPT_WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;

export async function POST(request: Request) {
  let body: { employeeId?: unknown; pin?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid POS sign-in request.' }, { status: 400 });
  }

  if (
    typeof body.employeeId !== 'string' ||
    body.employeeId.length > 128 ||
    typeof body.pin !== 'string' ||
    !/^\d{6,8}$/.test(body.pin)
  ) {
    return NextResponse.json({ success: false, error: 'Select your employee account and enter your 6-8 digit POS PIN.' }, { status: 400 });
  }

  const employee = loadDatabase().users.find(user =>
    user.id === body.employeeId &&
    user.role !== 'owner' &&
    user.employmentStatus === 'active' &&
    user.kycStatus === 'verified'
  );
  const attemptKey = employee?.id || 'unknown-employee';
  const now = Date.now();
  const attempt = failedAttempts.get(attemptKey);
  if (attempt && attempt.resetAt > now && attempt.count >= MAX_ATTEMPTS) {
    return NextResponse.json({ success: false, error: 'Too many failed sign-in attempts. Try again in 15 minutes.' }, { status: 429 });
  }
  if (!attempt || attempt.resetAt <= now) failedAttempts.delete(attemptKey);

  if (!employee || !employee.pinHash || !(await verifyPosPin(body.pin, employee.pinHash))) {
    const currentAttempt = failedAttempts.get(attemptKey);
    failedAttempts.set(attemptKey, {
      count: (currentAttempt?.count || 0) + 1,
      resetAt: currentAttempt?.resetAt && currentAttempt.resetAt > now ? currentAttempt.resetAt : now + ATTEMPT_WINDOW_MS
    });
    return NextResponse.json({
      success: false,
      error: 'Employee is not authorized for POS. Check your account and PIN, or ask the owner to activate your account and assign a PIN.'
    }, { status: 401 });
  }

  failedAttempts.delete(attemptKey);
  const session = createPosSessionToken(employee.id, employee.posSessionVersion || 0);
  const response = NextResponse.json({
    success: true,
    employee: { id: employee.id, fullName: employee.fullName, role: employee.role }
  });
  response.cookies.set('shrebian_pos_session', session.value, getPosSessionCookieOptions(session.maxAge));
  return response;
}
