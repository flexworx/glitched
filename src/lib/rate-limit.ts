/**
 * RADF v3 — In-Memory Rate Limiter
 * Lightweight rate limiting using a sliding window algorithm.
 * For production scale, replace with Redis-backed implementation.
 *
 * Usage:
 *   const limiter = new RateLimiter({ windowMs: 60_000, max: 30 });
 *   const result = limiter.check(ip);
 *   if (!result.success) return err('Too many requests', 429);
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

interface RateLimitOptions {
  /** Window size in milliseconds */
  windowMs: number;
  /** Max requests per window */
  max: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

export class RateLimiter {
  private store = new Map<string, RateLimitEntry>();
  private readonly windowMs: number;
  private readonly max: number;

  constructor(options: RateLimitOptions) {
    this.windowMs = options.windowMs;
    this.max = options.max;

    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.cleanup(), 5 * 60 * 1000);
    }
  }

  check(key: string): RateLimitResult {
    const now = Date.now();
    const entry = this.store.get(key);

    if (!entry || now > entry.resetAt) {
      // New window
      const resetAt = now + this.windowMs;
      this.store.set(key, { count: 1, resetAt });
      return { success: true, remaining: this.max - 1, resetAt };
    }

    if (entry.count >= this.max) {
      return {
        success: false,
        remaining: 0,
        resetAt: entry.resetAt,
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      };
    }

    entry.count++;
    return {
      success: true,
      remaining: this.max - entry.count,
      resetAt: entry.resetAt,
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(key);
      }
    }
  }
}

// ─── Pre-configured limiters for different route types ───────────────────────

/** General API: 60 requests per minute */
export const apiLimiter = new RateLimiter({ windowMs: 60_000, max: 60 });

/** Auth endpoints: 10 requests per minute (prevent brute force) */
export const authLimiter = new RateLimiter({ windowMs: 60_000, max: 10 });

/** Prediction bets: 30 per minute */
export const betLimiter = new RateLimiter({ windowMs: 60_000, max: 30 });

/** Admin endpoints: 120 per minute */
export const adminLimiter = new RateLimiter({ windowMs: 60_000, max: 120 });

/** Engine/cron: 10 per minute (internal only) */
export const cronLimiter = new RateLimiter({ windowMs: 60_000, max: 10 });

/**
 * Get the client IP from a Next.js request.
 * Handles Nginx reverse proxy headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
