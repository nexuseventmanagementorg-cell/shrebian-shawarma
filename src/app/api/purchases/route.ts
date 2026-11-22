import { NextResponse } from 'next/server';
import { loadDatabase, recordPurchase } from '@/lib/db';

export async function GET() {
  try {
    const state = loadDatabase();
    return NextResponse.json({ success: true, purchases: state.purchases });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { supplierName, supplierContact, category, items, totalAmount, paymentMethod, paymentStatus, notes, enteredBy } = body;

    if (!supplierName || !category || !items || !totalAmount) {
      return NextResponse.json({ success: false, error: "Supplier, Category, Items, and Total Amount are required" }, { status: 400 });
    }

    const now = new Date();
    const record = recordPurchase({
      purchaseDate: now.toISOString().split('T')[0],
      purchaseTime: now.toLocaleTimeString(),
      supplierName,
      supplierContact: supplierContact || '',
      category,
      items,
      totalAmount: Number(totalAmount),
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: paymentStatus || 'paid',
      notes,
      enteredBy: enteredBy || 'Kaleem Durrani'
    });

    return NextResponse.json({ success: true, purchase: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
