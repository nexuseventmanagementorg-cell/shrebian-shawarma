import { NextResponse } from 'next/server';
import { getProducts, updateProductPrice } from '@/lib/db';

export async function GET() {
  try {
    const products = getProducts();
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, sellingPrice, productionCost, adminUser } = body;
    if (!productId || sellingPrice === undefined || productionCost === undefined) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }
    const updated = updateProductPrice(productId, Number(sellingPrice), Number(productionCost), adminUser || 'Kaleem Durrani');
    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
