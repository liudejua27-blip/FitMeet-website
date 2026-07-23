import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const defaultApiBase = "https://api.ourfitmeet.cn/api";

function apiBase() {
  return (process.env.FITMEET_API_BASE_URL || process.env.NEXT_PUBLIC_FITMEET_API_BASE_URL || defaultApiBase).replace(/\/$/, "");
}

function verificationItems(payload: unknown) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  const root = payload as Record<string, unknown>;
  const source = root.data && typeof root.data === "object" && !Array.isArray(root.data)
    ? root.data as Record<string, unknown>
    : root;
  if (Array.isArray(source.items)) return source.items;
  if (Array.isArray(source.data)) return source.data;
  return [];
}

export async function GET(request: Request) {
  const authorization = request.headers.get("authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return NextResponse.json({ message: "登录已失效。" }, { status: 401 });
  }

  const response = await fetch(`${apiBase()}/users/me/verifications`, {
    method: "GET",
    cache: "no-store",
    headers: { Authorization: authorization, "Content-Type": "application/json" },
  }).catch(() => null);

  if (!response) {
    return NextResponse.json({
      data: { items: [], available: false, message: "认证服务暂时不可用，其他资料不受影响。" },
    }, { headers: { "Cache-Control": "no-store, private" } });
  }

  const payload: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    return NextResponse.json({
      data: { items: [], available: false, message: "认证服务正在维护，暂时不能读取或创建认证。" },
    }, { headers: { "Cache-Control": "no-store, private" } });
  }

  return NextResponse.json({
    data: { items: verificationItems(payload), available: true },
  }, { headers: { "Cache-Control": "no-store, private" } });
}
