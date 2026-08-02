import { NextRequest, NextResponse } from 'next/server';
import {
  FITMEET_WEB_REFRESH_COOKIE,
  fitMeetServerApiBase,
  fitMeetWebClientHeaders,
  refreshCookieOptions,
  refreshTokenFrom,
  withoutRefreshToken,
} from '@/lib/fitmeet-web-auth-server';
import { validateFitMeetWebOrigin } from '@/lib/fitmeet-web-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const origin = validateFitMeetWebOrigin(request);
  if (!origin.ok)
    return NextResponse.json(origin, { status: 403, headers: { 'Cache-Control': 'no-store, private' } });
  const refreshToken = request.cookies.get(FITMEET_WEB_REFRESH_COOKIE)?.value;
  if (!refreshToken) return NextResponse.json({ message: '登录已失效。' }, { status: 401 });

  try {
    const response = await fetch(`${fitMeetServerApiBase()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...fitMeetWebClientHeaders() },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      if (response.status === 401) {
        const result = NextResponse.json({ message: '登录已失效。' }, { status: 401 });
        result.cookies.set(FITMEET_WEB_REFRESH_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
        return result;
      }
      return NextResponse.json(
        { message: '暂时无法确认登录状态，请稍后重试。' },
        { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
      );
    }
    const rotated = refreshTokenFrom(payload);
    const result = NextResponse.json(withoutRefreshToken(payload), {
      headers: { 'Cache-Control': 'no-store, private' },
    });
    if (rotated) result.cookies.set(FITMEET_WEB_REFRESH_COOKIE, rotated, refreshCookieOptions);
    return result;
  } catch {
    return NextResponse.json({ message: '暂时无法连接 FitMeet 服务。' }, { status: 503 });
  }
}
