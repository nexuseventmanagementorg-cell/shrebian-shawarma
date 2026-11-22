import { NextResponse } from 'next/server';
import { getDailyFinancialReport, getAllTimeAnalytics, loadDatabase } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'all_time';
    const date = searchParams.get('date');

    if (type === 'daily') {
      const targetDate = date || new Date().toISOString().split('T')[0];
      const dailyReport = getDailyFinancialReport(targetDate);
      return NextResponse.json({ success: true, report: dailyReport });
    }

    if (type === 'all_time') {
      const analytics = getAllTimeAnalytics();
      return NextResponse.json({ success: true, analytics });
    }

    if (type === 'audit_logs') {
      const state = loadDatabase();
      return NextResponse.json({ success: true, auditLogs: state.auditLogs.slice(0, 100) });
    }

    if (type === 'whatsapp_logs') {
      const state = loadDatabase();
      return NextResponse.json({ success: true, whatsappLogs: state.whatsappLogs.slice(0, 100) });
    }

    return NextResponse.json({ success: false, error: "Invalid report type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
