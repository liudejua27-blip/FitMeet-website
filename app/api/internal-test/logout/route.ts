import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST() {
  const result = NextResponse.json({ status: "logged_out" }, { headers: { "Cache-Control": "no-store" } });
  result.cookies.set("fitmeet_internal_refresh", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return result;
}
