import { NextResponse } from 'next/server';
import {
  FITMEET_LEGACY_REFRESH_COOKIE,
  FITMEET_WEB_REFRESH_COOKIE,
  refreshCookieOptions,
} from '@/lib/fitmeet-web-auth-server';

export const runtime = 'nodejs';

export async function POST() {
  const result = NextResponse.json(
    { status: 'logged_out' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  result.cookies.set(FITMEET_WEB_REFRESH_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
  result.cookies.set(FITMEET_LEGACY_REFRESH_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
  return result;
}
