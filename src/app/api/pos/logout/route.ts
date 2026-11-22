import { NextResponse } from 'next/server';
import { getClearedPosSessionCookieOptions } from '@/lib/posAuth';

export async function POST() {
  const response = NextResponse.json({ success: true });
  response.cookies.set('shrebian_pos_session', '', getClearedPosSessionCookieOptions());
  return response;
}
