import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

// Keep tester credentials server-only and resolve them when the Node route is
// invoked. Next substitutes direct `process.env.FOO` reads during a build, but
// this deployment keeps the protected tester mapping in PM2's runtime env.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type InternalTester = {
  accessCode: string;
  phone: string;
  label?: string;
};

const defaultApiBase = "https://api.ourfitmeet.cn/api";
const refreshCookie = "fitmeet_internal_refresh";
const attemptWindowMs = 10 * 60 * 1000;
const maxAttempts = 8;
const attempts = new Map<string, { count: number; resetAt: number }>();

function runtimeEnvironmentValue(name: string) {
  return process.env[name];
}

function matches(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function internalTesters(): InternalTester[] {
  const raw = runtimeEnvironmentValue("FITMEET_INTERNAL_TESTER_ACCOUNTS");
  if (raw) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.filter((item): item is InternalTester => Boolean(
          item
          && typeof item === "object"
          && typeof (item as Partial<InternalTester>).accessCode === "string"
          && typeof (item as Partial<InternalTester>).phone === "string",
        ));
      }
    } catch {
      // A malformed deployment value must fail closed below.
    }
  }

  const accessCode = runtimeEnvironmentValue("FITMEET_INTERNAL_TEST_ACCESS_CODE");
  const phone = runtimeEnvironmentValue("FITMEET_INTERNAL_TEST_PHONE");
  return accessCode && phone ? [{ accessCode, phone }] : [];
}

function clientKey(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

function checkAttempts(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) return { allowed: true, retryAfter: 0 };
  return { allowed: current.count < maxAttempts, retryAfter: Math.max(1, Math.ceil((current.resetAt - now) / 1000)) };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const current = attempts.get(key);
  if (!current || current.resetAt <= now) attempts.set(key, { count: 1, resetAt: now + attemptWindowMs });
  else current.count += 1;
}

function refreshTokenFrom(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const source = "data" in payload && (payload as { data?: unknown }).data && typeof (payload as { data?: unknown }).data === "object"
    ? (payload as { data: Record<string, unknown> }).data
    : payload as Record<string, unknown>;
  const value = source.refreshToken ?? source.refresh_token;
  return typeof value === "string" && value ? value : null;
}

function withoutRefreshToken(payload: unknown) {
  if (!payload || typeof payload !== "object") return payload;
  const clone = structuredClone(payload) as Record<string, unknown>;
  const target = clone.data && typeof clone.data === "object" ? clone.data as Record<string, unknown> : clone;
  delete target.refreshToken;
  delete target.refresh_token;
  return clone;
}

export async function POST(request: Request) {
  const attemptKey = clientKey(request);
  const rate = checkAttempts(attemptKey);
  if (!rate.allowed) return NextResponse.json({ message: "尝试次数过多，请稍后再试。" }, { status: 429, headers: { "Retry-After": String(rate.retryAfter) } });
  const body: unknown = await request.json().catch(() => null);
  const accessCode = body && typeof body === "object" ? (body as { accessCode?: unknown }).accessCode : null;
  if (typeof accessCode !== "string" || !accessCode.trim()) {
    return NextResponse.json({ message: "请输入内测邀请码。" }, { status: 400 });
  }

  const tester = internalTesters().find((item) => matches(item.accessCode, accessCode.trim()));
  const verificationCode = runtimeEnvironmentValue("FITMEET_INTERNAL_SMS_TEST_CODE");
  if (!tester || !verificationCode) {
    recordFailedAttempt(attemptKey);
    return NextResponse.json({ message: "邀请码无效或内测服务尚未配置。" }, { status: 403 });
  }

  const apiBase = (runtimeEnvironmentValue("FITMEET_API_BASE_URL") || runtimeEnvironmentValue("NEXT_PUBLIC_FITMEET_API_BASE_URL") || defaultApiBase).replace(/\/$/, "");
  const response = await fetch(`${apiBase}/auth/sms/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: tester.phone, code: verificationCode }),
    cache: "no-store",
  });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({ message: "内测账号暂时不可用，请联系项目组。" }, { status: 502 });
  }

  const refreshToken = refreshTokenFrom(payload);
  if (!refreshToken) return NextResponse.json({ message: "内测账号暂时不可用，请联系项目组。" }, { status: 502 });
  const result = NextResponse.json(withoutRefreshToken(payload), {
    headers: {
      "Cache-Control": "no-store, private",
      // Header values must be ASCII. Tester labels are human-facing and may
      // contain Chinese, so keep this diagnostic header deliberately generic.
      "X-Internal-Tester": "enabled",
    },
  });
  attempts.delete(attemptKey);
  result.cookies.set(refreshCookie, refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return result;
}
