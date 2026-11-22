import { NextResponse } from 'next/server';
import { loadDatabase, recordExpense } from '@/lib/db';

export async function GET() {
  try {
    const state = loadDatabase();
    return NextResponse.json({ success: true, expenses: state.expenses });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { category, description, amount, paymentMethod, shiftSessionId, sellingPointId, enteredBy } = body;

    if (!category || !description || !amount) {
      return NextResponse.json({ success: false, error: "Category, Description, and Amount are required" }, { status: 400 });
    }

    const record = recordExpense({
      expenseDate: new Date().toISOString().split('T')[0],
      category,
      description,
      amount: Number(amount),
      paymentMethod: paymentMethod || 'cash',
      shiftSessionId,
      sellingPointId,
      enteredBy: enteredBy || 'Kaleem Durrani'
    });

    return NextResponse.json({ success: true, expense: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
