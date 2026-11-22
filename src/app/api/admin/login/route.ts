import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  signAdminSession
} from '@/lib/adminSession';

const scrypt = promisify(scryptCallback);

export async function POST(request: Request) {
  const username = process.env.ADMIN_USERNAME;
  const storedPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  if (!username || !storedPasswordHash || !sessionSecret) {
    return NextResponse.json({ error: 'Admin login is not configured.' }, { status: 503 });
  }

  let credentials: { username?: unknown; password?: unknown };
  try {
    credentials = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid login request.' }, { status: 400 });
  }

  if (
    typeof credentials.username !== 'string' ||
    typeof credentials.password !== 'string' ||
    credentials.username.length > 128 ||
    credentials.password.length > 1024
  ) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const [saltHex, hashHex, ...extra] = storedPasswordHash.split(':');
  if (
    extra.length ||
    !/^[a-f0-9]{32}$/i.test(saltHex || '') ||
    !/^[a-f0-9]{128}$/i.test(hashHex || '')
  ) {
    return NextResponse.json({ error: 'Admin login configuration is invalid.' }, { status: 500 });
  }

  const expectedUsername = Buffer.from(username);
  const suppliedUsername = Buffer.from(credentials.username);
  const usernameMatches =
    expectedUsername.length === suppliedUsername.length &&
    timingSafeEqual(expectedUsername, suppliedUsername);
  const expectedPassword = Buffer.from(hashHex, 'hex');
  const suppliedPassword = (await scrypt(credentials.password, Buffer.from(saltHex, 'hex'), 64)) as Buffer;
  const passwordMatches = timingSafeEqual(expectedPassword, suppliedPassword);

  if (!usernameMatches || !passwordMatches) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_TTL_SECONDS;
  const response = NextResponse.json({ success: true });
  response.cookies.set(
    ADMIN_SESSION_COOKIE,
    `${expiresAt}.${signAdminSession(expiresAt, sessionSecret)}`,
    {
      httpOnly: true,
      sameSite: 'strict',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_SESSION_TTL_SECONDS
    }
  );
  return response;
}
