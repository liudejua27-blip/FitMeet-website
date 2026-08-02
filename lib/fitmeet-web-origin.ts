export type FitMeetWebOriginDecision =
  | { ok: true }
  | { ok: false; code: "AUTH_ORIGIN_REQUIRED" | "AUTH_ORIGIN_FORBIDDEN"; message: string };

const productionOrigins = new Set([
  "https://fitmeet.cn",
  "https://www.fitmeet.cn",
]);

function normalizedOrigin(value: string | null) {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

function isLocalDevelopmentOrigin(origin: string, requestUrl: string) {
  try {
    const request = new URL(requestUrl);
    const candidate = new URL(origin);
    const localHosts = new Set(["localhost", "127.0.0.1", "[::1]"]);
    return localHosts.has(request.hostname)
      && localHosts.has(candidate.hostname)
      && request.protocol === candidate.protocol
      && request.port === candidate.port;
  } catch {
    return false;
  }
}

/**
 * Authentication mutations are browser-only, same-origin boundaries. The
 * canonical production hosts are intentionally allowlisted instead of trusting
 * a forwarded Host header that may be controlled before Nginx rejects it.
 */
export function validateFitMeetWebOrigin(
  request: Request,
  runtimeEnvironment = process.env.NODE_ENV,
): FitMeetWebOriginDecision {
  const origin = normalizedOrigin(request.headers.get("origin"));
  if (!origin) {
    return {
      ok: false,
      code: "AUTH_ORIGIN_REQUIRED",
      message: "无法确认登录请求来源，请刷新页面后重试。",
    };
  }

  const allowed = productionOrigins.has(origin)
    || (runtimeEnvironment !== "production" && isLocalDevelopmentOrigin(origin, request.url));
  if (!allowed) {
    return {
      ok: false,
      code: "AUTH_ORIGIN_FORBIDDEN",
      message: "登录请求来源不受信任。",
    };
  }

  const fetchSite = request.headers.get("sec-fetch-site");
  if (fetchSite && fetchSite !== "same-origin") {
    return {
      ok: false,
      code: "AUTH_ORIGIN_FORBIDDEN",
      message: "登录请求来源不受信任。",
    };
  }

  return { ok: true };
}
