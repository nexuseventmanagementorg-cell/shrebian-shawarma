import { NextResponse } from 'next/server';
import { getSellingPoints, toggleSellingPointStatus, loadDatabase, saveDatabase } from '@/lib/db';

export async function GET() {
  try {
    const sellingPoints = getSellingPoints();
    return NextResponse.json({ success: true, sellingPoints });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, id, isActive, radius, latitude, longitude, name, area, adminUser } = body;

    if (action === 'toggle') {
      const updated = toggleSellingPointStatus(id, isActive, adminUser || 'Kaleem Durrani');
      return NextResponse.json({ success: true, sellingPoint: updated });
    }

    if (action === 'update') {
      const state = loadDatabase();
      const idx = state.sellingPoints.findIndex(sp => sp.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, error: "Selling point not found" }, { status: 404 });
      }
      if (radius !== undefined) state.sellingPoints[idx].deliveryRadiusKm = Number(radius);
      if (latitude !== undefined) state.sellingPoints[idx].latitude = Number(latitude);
      if (longitude !== undefined) state.sellingPoints[idx].longitude = Number(longitude);
      if (name) state.sellingPoints[idx].name = name;
      if (area) state.sellingPoints[idx].area = area;
      saveDatabase(state);
      return NextResponse.json({ success: true, sellingPoint: state.sellingPoints[idx] });
    }

    if (action === 'create') {
      const { address, imageUrl, operatingHours } = body;
      if (
        typeof name !== 'string' || !name.trim() ||
        typeof area !== 'string' || !area.trim() ||
        typeof address !== 'string' || !address.trim() ||
        typeof operatingHours !== 'string' || !operatingHours.trim() ||
        !Number.isFinite(Number(radius)) || Number(radius) <= 0
      ) {
        return NextResponse.json({ success: false, error: 'Point name, area, full address, hours, and a valid radius are required.' }, { status: 400 });
      }
      if (imageUrl !== undefined && imageUrl !== '') {
        const validImage = typeof imageUrl === 'string' &&
          imageUrl.length <= 1_400_000 &&
          /^data:image\/(?:jpeg|png|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(imageUrl);
        if (!validImage) {
          return NextResponse.json({ success: false, error: 'Point photo must be a JPG, PNG, or WebP image up to 1 MB.' }, { status: 400 });
        }
      }

      const state = loadDatabase();
      const newSp = {
        id: `sp_${Date.now()}`,
        name: name.trim(),
        area: area.trim(),
        address: address.trim(),
        ...(imageUrl ? { imageUrl } : {}),
        deliveryRadiusKm: Number(radius) || 5,
        isActive: false,
        operatingHours: operatingHours.trim(),
        estimatedPrepTime: "10-15 mins",
        takeawayAvailable: true,
        deliveryAvailable: true
      };
      state.sellingPoints.push(newSp);
      saveDatabase(state);
      return NextResponse.json({ success: true, sellingPoint: newSp });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
