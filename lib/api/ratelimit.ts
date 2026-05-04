import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// In-memory limiter for local dev when Upstash isn't configured.
// Per-process — fine for a single Next dev server, NOT for multi-instance prod.
class MemoryLimiter {
  private hits = new Map<string, number[]>();
  constructor(private readonly limit: number, private readonly windowMs: number) {}
  async check(key: string): Promise<{ success: boolean; remaining: number; reset: number }> {
    const now = Date.now();
    const arr = (this.hits.get(key) ?? []).filter((t) => now - t < this.windowMs);
    arr.push(now);
    this.hits.set(key, arr);
    return {
      success: arr.length <= this.limit,
      remaining: Math.max(0, this.limit - arr.length),
      reset: arr[0] !== undefined ? arr[0] + this.windowMs : now + this.windowMs,
    };
  }
}

const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

let upstashRedis: Redis | null = null;
if (upstashUrl && upstashToken) upstashRedis = new Redis({ url: upstashUrl, token: upstashToken });

export type Limiter = { check(key: string): Promise<{ success: boolean; remaining: number; reset: number }> };

function makeLimiter(limit: number, windowSec: number, prefix: string): Limiter {
  if (upstashRedis) {
    const rl = new Ratelimit({
      redis: upstashRedis,
      limiter: Ratelimit.slidingWindow(limit, `${windowSec} s`),
      prefix,
    });
    return {
      async check(key: string) {
        const r = await rl.limit(key);
        return { success: r.success, remaining: r.remaining, reset: r.reset };
      },
    };
  }
  return new MemoryLimiter(limit, windowSec * 1000);
}

export const analyzeAnonLimiter = makeLimiter(10, 60, "im:analyze:anon");
export const analyzeUserLimiter = makeLimiter(60, 60, "im:analyze:user");
export const searchLimiter = makeLimiter(120, 60, "im:search");

export function getClientKey(req: Request, userId?: string | null): string {
  if (userId) return `u:${userId}`;
  // Best-effort IP from common proxy headers
  const fwd = req.headers.get("x-forwarded-for");
  const ip = fwd?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "anon";
  return `ip:${ip}`;
}
