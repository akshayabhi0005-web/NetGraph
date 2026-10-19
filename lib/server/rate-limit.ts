/**
 * NETGRAPH In-Memory Sliding-Window Rate Limiter
 *
 * Protects public and sensitive API endpoints (e.g. login, register) from brute-force
 * and denial-of-service attacks.
 *
 * NOTE FOR DISTRIBUTED PRODUCTION DEPLOYMENTS:
 * This in-memory implementation operates per Node.js server instance.
 * In a multi-instance serverless or container cluster (e.g., AWS ECS, Vercel edge),
 * a shared store like Upstash Redis is recommended for global synchronization.
 */

interface RateLimitRecord {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitRecord>()

// Periodically purge expired rate limit keys to prevent unbounded memory growth
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000
let lastCleanup = Date.now()

export function checkRateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60 * 1000
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()

  // Evict expired entries during window checks
  if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
    for (const [key, record] of rateLimitStore.entries()) {
      if (record.resetTime < now) {
        rateLimitStore.delete(key)
      }
    }
    lastCleanup = now
  }

  const existing = rateLimitStore.get(identifier)

  if (!existing || existing.resetTime < now) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    })
    return { allowed: true, remaining: limit - 1, resetTime: now + windowMs }
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetTime: existing.resetTime }
  }

  existing.count += 1
  return { allowed: true, remaining: limit - existing.count, resetTime: existing.resetTime }
}

/**
 * Resets the rate limit for a specific identifier (useful in test suites)
 */
export function resetRateLimit(identifier?: string): void {
  if (identifier) {
    rateLimitStore.delete(identifier)
  } else {
    rateLimitStore.clear()
  }
}
