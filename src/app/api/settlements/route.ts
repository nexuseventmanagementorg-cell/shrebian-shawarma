import { NextResponse } from 'next/server';
import { getShiftSessions, submitEmployeeSettlement, verifyEmployeeSettlement } from '@/lib/db';

export async function GET() {
  try {
    const sessions = getShiftSessions();
    const settlements = sessions
      .filter(s => s.settlementStatus !== 'pending' || s.status === 'closed')
      .map(s => ({
        sessionId: s.id,
        shiftName: s.shiftName,
        businessDate: s.businessDate,
        employeeId: s.employeeId,
        employeeName: s.employeeName,
        sellingPointName: s.sellingPointName,
        expectedCashInHand: s.expectedCashInHand,
        actualCashCounted: s.actualCashCounted,
        cashSubmitted: s.cashSubmitted,
        remainingBalance: s.remainingBalance,
        settlementStatus: s.settlementStatus,
        settlementDetails: s.settlementDetails
      }));

    return NextResponse.json({ success: true, settlements });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shiftSessionId, amountTransferred, service, transactionId, proofUrl, notes } = body;

    if (!shiftSessionId || !amountTransferred || !service || !transactionId) {
      return NextResponse.json({
        success: false,
        error: "shiftSessionId, amountTransferred, service, and transactionId are required"
      }, { status: 400 });
    }

    const updated = submitEmployeeSettlement(shiftSessionId, {
      amountTransferred: Number(amountTransferred),
      service,
      transactionId,
      proofUrl,
      notes
    });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Shift session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { shiftSessionId, decision, notes, adminUser } = body;

    if (!shiftSessionId || !decision) {
      return NextResponse.json({ success: false, error: "shiftSessionId and decision are required" }, { status: 400 });
    }

    const updated = verifyEmployeeSettlement(
      shiftSessionId,
      decision,
      notes,
      adminUser || 'Kaleem Durrani'
    );

    if (!updated) {
      return NextResponse.json({ success: false, error: "Shift session not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, session: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
