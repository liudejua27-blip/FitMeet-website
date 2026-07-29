import 'server-only';

export const FITMEET_WEB_REFRESH_COOKIE = 'fitmeet_refresh';
export const FITMEET_LEGACY_REFRESH_COOKIE = 'fitmeet_internal_refresh';

const defaultApiBase = 'https://api.fitmeet.cn/api';

export function fitMeetServerApiBase() {
  return (
    process.env.FITMEET_API_BASE_URL ||
    process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL ||
    defaultApiBase
  ).replace(/\/$/, '');
}

export function fitMeetWebClientHeaders() {
  const appVersion = (
    process.env.FITMEET_WEB_APP_VERSION ||
    process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 12) ||
    'web'
  ).trim();
  return {
    'X-FitMeet-Platform': 'web',
    'X-FitMeet-App-Version': appVersion || 'web',
  };
}

export function payloadRecord(payload: unknown) {
  if (!payload || typeof payload !== 'object') return null;
  const root = payload as Record<string, unknown>;
  return root.data && typeof root.data === 'object'
    ? (root.data as Record<string, unknown>)
    : root;
}

export function refreshTokenFrom(payload: unknown) {
  const source = payloadRecord(payload);
  const value = source?.refreshToken ?? source?.refresh_token;
  return typeof value === 'string' && value ? value : null;
}

export function withoutRefreshToken(payload: unknown) {
  if (!payload || typeof payload !== 'object') return payload;
  const clone = structuredClone(payload) as Record<string, unknown>;
  const source = payloadRecord(clone);
  if (source) {
    delete source.refreshToken;
    delete source.refresh_token;
  }
  return clone;
}

export function upstreamMessage(payload: unknown, fallback: string) {
  const source = payloadRecord(payload);
  const message = source?.message ?? source?.error ?? source?.code;
  return typeof message === 'string' && message.trim() ? message : fallback;
}

export function upstreamCode(payload: unknown) {
  const code = payloadRecord(payload)?.code;
  return typeof code === 'string' && code.trim() ? code : null;
}

export const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 30,
};
