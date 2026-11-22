import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { User } from '@/types';
import { hasValidAdminSession } from '@/lib/adminSession';
import { loadDatabase } from '@/lib/db';

const scrypt = promisify(scryptCallback);

export const POS_SESSION_COOKIE = 'shrebian_pos_session';
const POS_SESSION_TTL_SECONDS = 60 * 60 * 12;

export async function hashPosPin(pin: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = (await scrypt(pin, salt, 64)) as Buffer;
  return `scrypt$${salt.toString('hex')}$${hash.toString('hex')}`;
}

export async function verifyPosPin(pin: string, storedHash: string): Promise<boolean> {
  const [algorithm, saltHex, hashHex, ...extra] = storedHash.split('$');
  if (
    algorithm !== 'scrypt' ||
    extra.length ||
    !/^[a-f0-9]{32}$/i.test(saltHex || '') ||
    !/^[a-f0-9]{128}$/i.test(hashHex || '')
  ) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const supplied = (await scrypt(pin, Buffer.from(saltHex, 'hex'), expected.length)) as Buffer;
  return expected.length === supplied.length && timingSafeEqual(expected, supplied);
}

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('POS session signing is not configured.');
  return secret;
}

function signPosSession(userId: string, version: number, expiresAt: number): string {
  return createHmac('sha256', sessionSecret())
    .update(`pos:${userId}:${version}:${expiresAt}`)
    .digest('hex');
}

export function createPosSessionToken(userId: string, version: number): { value: string; maxAge: number } {
  const maxAge = POS_SESSION_TTL_SECONDS;
  const expiresAt = Math.floor(Date.now() / 1000) + maxAge;
  return { value: `${userId}.${version}.${expiresAt}.${signPosSession(userId, version, expiresAt)}`, maxAge };
}

function getCookie(request: Request, name: string): string | undefined {
  return request.headers.get('cookie')
    ?.split(';')
    .map(cookie => cookie.trim())
    .find(cookie => cookie.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

async function getPosSessionUser(request: Request): Promise<User | undefined> {
  const token = getCookie(request, POS_SESSION_COOKIE);
  if (!token) return undefined;
  const [userId, versionValue, expiresAtValue, signature, ...extra] = token.split('.');
  const version = Number(versionValue);
  const expiresAt = Number(expiresAtValue);
  if (
    extra.length ||
    !userId ||
    !Number.isSafeInteger(version) ||
    !Number.isSafeInteger(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000) ||
    !/^[a-f0-9]{64}$/i.test(signature || '')
  ) return undefined;

  const expected = Buffer.from(signPosSession(userId, version, expiresAt), 'hex');
  const supplied = Buffer.from(signature, 'hex');
  if (expected.length !== supplied.length || !timingSafeEqual(expected, supplied)) return undefined;

  return loadDatabase().users.find(user =>
    user.id === userId &&
    (user.posSessionVersion || 0) === version &&
    user.role !== 'owner' &&
    user.employmentStatus === 'active' &&
    user.kycStatus === 'verified'
  );
}

export async function getAuthorizedPosUser(request: Request): Promise<{ kind: 'owner' | 'employee'; user: User } | null> {
  const state = loadDatabase();
  if (await hasValidAdminSession(request)) {
    const owner = state.users.find(user => user.role === 'owner' && user.employmentStatus === 'active');
    return owner ? { kind: 'owner', user: owner } : null;
  }

  const employee = await getPosSessionUser(request);
  return employee ? { kind: 'employee', user: employee } : null;
}

export function getPosSessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge
  };
}

export function getClearedPosSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0
  };
}
