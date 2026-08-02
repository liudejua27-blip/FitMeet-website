import { NextRequest, NextResponse } from 'next/server';
import {
  FITMEET_LEGACY_REFRESH_COOKIE,
  FITMEET_WEB_REFRESH_COOKIE,
  fitMeetServerApiBase,
  fitMeetWebClientHeaders,
  refreshCookieOptions,
  upstreamMessage,
} from '@/lib/fitmeet-web-auth-server';
import { validateFitMeetWebOrigin } from '@/lib/fitmeet-web-origin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function clearedSessionResponse() {
  const result = NextResponse.json(
    { status: 'logged_out' },
    { headers: { 'Cache-Control': 'no-store' } },
  );
  result.cookies.set(FITMEET_WEB_REFRESH_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
  result.cookies.set(FITMEET_LEGACY_REFRESH_COOKIE, '', { ...refreshCookieOptions, maxAge: 0 });
  return result;
}

export async function POST(request: NextRequest) {
  const origin = validateFitMeetWebOrigin(request);
  if (!origin.ok)
    return NextResponse.json(origin, { status: 403, headers: { 'Cache-Control': 'no-store, private' } });
  const refreshToken = request.cookies.get(FITMEET_WEB_REFRESH_COOKIE)?.value;
  if (!refreshToken) return clearedSessionResponse();

  try {
    const response = await fetch(`${fitMeetServerApiBase()}/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...fitMeetWebClientHeaders() },
      body: JSON.stringify({ refreshToken }),
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (response.ok || response.status === 401) {
      return clearedSessionResponse();
    }
    return NextResponse.json(
      { message: upstreamMessage(payload, '退出暂未完成，请稍后重试。') },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
    );
  } catch {
    return NextResponse.json(
      { message: '暂时无法连接 FitMeet 服务，登录状态尚未安全撤销。' },
      { status: 503, headers: { 'Cache-Control': 'no-store, private' } },
    );
  }
}
