type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitOptions = {
  limit?: number;
  windowMs?: number;
};

const buckets = new Map<string, RateLimitBucket>();
const maxBuckets = 1_000;

function pruneExpiredBuckets(now: number) {
  if (buckets.size < maxBuckets) {
    return;
  }

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

function getClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const realIp = request.headers.get("x-real-ip");
  const visitor = forwardedFor?.split(",")[0]?.trim() || realIp || "unknown";

  return visitor.slice(0, 120);
}

export function checkLeadRateLimit(
  request: Request,
  scope: string,
  { limit = 8, windowMs = 60_000 }: RateLimitOptions = {}
) {
  const now = Date.now();
  pruneExpiredBuckets(now);

  const key = `${scope}:${getClientKey(request)}`;
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });

    return {
      ok: true,
      limit,
      remaining: limit - 1,
      retryAfter: 0,
    };
  }

  if (existing.count >= limit) {
    return {
      ok: false,
      limit,
      remaining: 0,
      retryAfter: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    ok: true,
    limit,
    remaining: Math.max(0, limit - existing.count),
    retryAfter: 0,
  };
}
