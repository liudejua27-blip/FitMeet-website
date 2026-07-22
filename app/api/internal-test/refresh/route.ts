import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const refreshCookie = "fitmeet_internal_refresh";
const defaultApiBase = "https://api.ourfitmeet.cn/api";

function apiBase() {
  return (process.env.FITMEET_API_BASE_URL || process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL || defaultApiBase).replace(/\/$/, "");
}

function sourceRecord(payload: unknown) {
  if (!payload || typeof payload !== "object") return null;
  const root = payload as Record<string, unknown>;
  return root.data && typeof root.data === "object" ? root.data as Record<string, unknown> : root;
}

export async function POST(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const refreshToken = cookieHeader.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${refreshCookie}=`))?.slice(refreshCookie.length + 1);
  if (!refreshToken) return NextResponse.json({ message: "登录已失效。" }, { status: 401 });
  const response = await fetch(`${apiBase()}/auth/refresh`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refreshToken: decodeURIComponent(refreshToken) }), cache: "no-store" });
  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    const result = NextResponse.json({ message: "登录已失效。" }, { status: 401 });
    result.cookies.set(refreshCookie, "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return result;
  }
  const source = sourceRecord(payload);
  const rotated = source?.refreshToken ?? source?.refresh_token;
  if (source) {
    delete source.refreshToken;
    delete source.refresh_token;
  }
  const result = NextResponse.json(payload, { headers: { "Cache-Control": "no-store, private" } });
  if (typeof rotated === "string" && rotated) result.cookies.set(refreshCookie, rotated, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return result;
}
