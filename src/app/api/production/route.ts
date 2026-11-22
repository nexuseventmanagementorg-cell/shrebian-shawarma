import { NextResponse } from 'next/server';
import { getProductionBatches, createProductionBatch } from '@/lib/db';

export async function GET() {
  try {
    const batches = getProductionBatches();
    return NextResponse.json({ success: true, batches });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, quantityPrepared, ingredientsCost, packagingCost, wastageReserveCost, preparedBy, notes } = body;

    if (!productId || !quantityPrepared) {
      return NextResponse.json({ success: false, error: "productId and quantityPrepared are required" }, { status: 400 });
    }

    const batch = createProductionBatch({
      productId,
      quantityPrepared: Number(quantityPrepared),
      ingredientsCost: Number(ingredientsCost || 0),
      packagingCost: Number(packagingCost || 0),
      wastageReserveCost: Number(wastageReserveCost || 0),
      preparedBy: preparedBy || "Kaleem Durrani",
      notes
    });

    return NextResponse.json({ success: true, batch });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
