import { NextResponse } from 'next/server';
import {
  FITMEET_LEGACY_REFRESH_COOKIE,
  FITMEET_WEB_REFRESH_COOKIE,
  fitMeetServerApiBase,
  refreshCookieOptions,
  refreshTokenFrom,
  upstreamMessage,
  withoutRefreshToken,
} from '@/lib/fitmeet-web-auth-server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body: unknown = await request.json().catch(() => null);
  const phone = body && typeof body === 'object' ? (body as { phone?: unknown }).phone : null;
  const code = body && typeof body === 'object' ? (body as { code?: unknown }).code : null;
  if (typeof phone !== 'string' || !/^1\d{10}$/.test(phone.trim()))
    return NextResponse.json({ message: '请输入有效手机号。' }, { status: 400 });
  if (typeof code !== 'string' || code.trim().length < 4)
    return NextResponse.json({ message: '请输入短信验证码。' }, { status: 400 });

  try {
    const response = await fetch(`${fitMeetServerApiBase()}/auth/sms/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: phone.trim(), code: code.trim() }),
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok)
      return NextResponse.json(
        { message: upstreamMessage(payload, '手机号或验证码不正确。') },
        { status: response.status },
      );
    const refreshToken = refreshTokenFrom(payload);
    if (!refreshToken)
      return NextResponse.json({ message: '登录响应缺少刷新凭证。' }, { status: 502 });

    const result = NextResponse.json(withoutRefreshToken(payload), {
      headers: { 'Cache-Control': 'no-store, private' },
    });
    result.cookies.set(FITMEET_WEB_REFRESH_COOKIE, refreshToken, refreshCookieOptions);
    result.cookies.set(FITMEET_LEGACY_REFRESH_COOKIE, '', {
      ...refreshCookieOptions,
      maxAge: 0,
    });
    return result;
  } catch {
    return NextResponse.json({ message: '暂时无法连接 FitMeet 服务。' }, { status: 503 });
  }
}
