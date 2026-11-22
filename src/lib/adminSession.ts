import { createHmac, timingSafeEqual } from 'crypto';

export const ADMIN_SESSION_COOKIE = 'shrebian_admin_session';
export const ADMIN_SESSION_TTL_SECONDS = 60 * 60 * 8;

export function signAdminSession(expiresAt: number, secret: string): string {
  return createHmac('sha256', secret).update(`admin:${expiresAt}`).digest('hex');
}

export async function hasValidAdminSession(request: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  const token = request.headers.get('cookie')
    ?.split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!secret || !token) return false;

  const [expiresAtValue, signature, ...extra] = token.split('.');
  const expiresAt = Number(expiresAtValue);
  if (extra.length || !Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) {
    return false;
  }
  if (!/^[a-f0-9]{64}$/i.test(signature || '')) return false;

  const expected = Buffer.from(signAdminSession(expiresAt, secret), 'hex');
  const supplied = Buffer.from(signature, 'hex');
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}
