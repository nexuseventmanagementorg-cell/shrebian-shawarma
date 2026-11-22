import { NextResponse } from 'next/server';
import { loadDatabase, saveDatabase } from '@/lib/db';

export async function GET() {
  try {
    const state = loadDatabase();
    return NextResponse.json({
      success: true,
      customers: state.customers,
      leads: state.leads
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, name, mobile, location, source, interestedProduct, followUpDate, status, notes, id } = body;

    const state = loadDatabase();

    if (action === 'create_lead') {
      if (!name || !mobile) {
        return NextResponse.json({ success: false, error: "Name and Mobile are required for a lead." }, { status: 400 });
      }
      const newLead = {
        id: `lead_${Date.now()}`,
        name,
        mobile,
        location: location || 'Lahore',
        source: source || 'Direct Inquiry',
        dateAdded: new Date().toISOString().split('T')[0],
        interestedProduct: interestedProduct || 'Shrebian Shawarma',
        followUpDate,
        status: status || 'new',
        notes
      };
      state.leads.unshift(newLead);
      saveDatabase(state);
      return NextResponse.json({ success: true, lead: newLead });
    }

    if (action === 'update_lead_status') {
      const lead = state.leads.find(l => l.id === id);
      if (!lead) return NextResponse.json({ success: false, error: "Lead not found" }, { status: 404 });
      lead.status = status;
      if (notes) lead.notes = `${lead.notes || ''} | ${notes}`;
      saveDatabase(state);
      return NextResponse.json({ success: true, lead });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
