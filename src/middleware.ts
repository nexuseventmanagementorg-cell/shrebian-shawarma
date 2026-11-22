import { NextRequest, NextResponse } from 'next/server';

const ADMIN_SESSION_COOKIE = 'shrebian_admin_session';

const publicGetRoutes = new Set([
  '/api/products',
  '/api/selling-points'
]);

async function hasValidAdminSession(request: NextRequest): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
  if (!secret || !token) return false;

  const [expiresAtValue, signature, ...extra] = token.split('.');
  const expiresAt = Number(expiresAtValue);
  if (extra.length || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  if (!/^[a-f0-9]{64}$/i.test(signature || '')) return false;

  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  const signatureBytes = new Uint8Array(
    (signature.match(/.{2}/g) || []).map(byte => Number.parseInt(byte, 16))
  );
  return crypto.subtle.verify(
    'HMAC',
    key,
    signatureBytes,
    new TextEncoder().encode(`admin:${expiresAt}`)
  );
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminLogin = pathname === '/admin/login';
  const isAdminAuthApi = pathname === '/api/admin/login' || pathname === '/api/admin/logout';
  const isPosAuthApi =
    (pathname === '/api/pos/login' && request.method === 'POST') ||
    (pathname === '/api/pos/session' && request.method === 'GET') ||
    (pathname === '/api/pos/logout' && request.method === 'POST');
  const isPublicDataRead = request.method === 'GET' && publicGetRoutes.has(pathname);
  const isPosDataRead =
    request.method === 'GET' &&
    request.nextUrl.searchParams.get('view') === 'pos' &&
    (pathname === '/api/employees' || pathname === '/api/shifts');
  const isPosShiftCheckIn = pathname === '/api/shift-check-in' && request.method === 'POST';
  const isPublicOrderCreate = pathname === '/api/orders' && request.method === 'POST';

  if (isAdminLogin || isAdminAuthApi || isPosAuthApi || isPublicDataRead || isPosDataRead || isPosShiftCheckIn || isPublicOrderCreate) {
    return NextResponse.next();
  }

  if (await hasValidAdminSession(request)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ success: false, error: 'Admin authentication required.' }, { status: 401 });
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = '/admin/login';
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*']
};
