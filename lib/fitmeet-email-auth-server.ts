import 'server-only';

import { NextResponse } from 'next/server';
import {
  FITMEET_LEGACY_REFRESH_COOKIE,
  FITMEET_WEB_REFRESH_COOKIE,
  fitMeetServerApiBase,
  fitMeetWebClientHeaders,
  refreshCookieOptions,
  refreshTokenFrom,
  upstreamCode,
  upstreamMessage,
  withoutRefreshToken,
} from '@/lib/fitmeet-web-auth-server';
import type { FitMeetRegistrationConsent } from '@/lib/fitmeet-registration-consent';

type FitMeetEmailLoginBody = { email: string; password: string };
type FitMeetEmailRegistrationBody = FitMeetEmailLoginBody & {
  name: string;
  consents: FitMeetRegistrationConsent;
};

export async function forwardFitMeetEmailAuth({
  action,
  body,
  fallbackMessage,
}: {
  action: 'login' | 'register';
  body: FitMeetEmailLoginBody | FitMeetEmailRegistrationBody;
  fallbackMessage: string;
}) {
  try {
    const response = await fetch(`${fitMeetServerApiBase()}/auth/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...fitMeetWebClientHeaders() },
      body: JSON.stringify(body),
      cache: 'no-store',
      signal: AbortSignal.timeout(7000),
    });
    const payload: unknown = await response.json().catch(() => ({}));
    if (!response.ok) {
      const retryAfter = response.headers.get('retry-after');
      return NextResponse.json(
        {
          message: upstreamMessage(payload, fallbackMessage),
          ...(upstreamCode(payload) ? { code: upstreamCode(payload) } : {}),
        },
        {
          status: response.status,
          headers: {
            'Cache-Control': 'no-store, private',
            ...(retryAfter ? { 'Retry-After': retryAfter } : {}),
          },
        },
      );
    }

    if (action === 'register') {
      if (refreshTokenFrom(payload))
        return NextResponse.json(
          { message: '注册响应违反邮箱验证安全边界。' },
          { status: 502, headers: { 'Cache-Control': 'no-store, private' } },
        );
      return NextResponse.json(payload, {
        status: response.status,
        headers: { 'Cache-Control': 'no-store, private' },
      });
    }

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
