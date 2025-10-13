/**
 * Enhanced rate limiter for Next.js API routes with LRU cache
 * Supports multiple rate limit tiers and configurations
 * 
 * Usage in API routes:
 * ```ts
 * import { rateLimit } from '@/lib/rate-limit'
 * 
 * export async function POST(request: Request) {
 *   const rateLimitResult = await rateLimit(request, 'create')
 *   if (rateLimitResult) return rateLimitResult // Returns 429 response
 *   
 *   // Your API logic here
 * }
 * ```
 */

import { LRUCache } from 'lru-cache'

interface RateLimitStore {
  count: number
  resetTime: number
}

// Enhanced store with LRU cache for better memory management
const cache = new LRUCache<string, RateLimitStore>({
  max: 10000, // Maximum entries
  ttl: 60 * 60 * 1000, // 1 hour TTL
})

// Rate limit configurations for different endpoint types
export const RATE_LIMITS = {
  api: { windowMs: 60 * 1000, maxRequests: 60 }, // 60 requests per minute
  auth: { windowMs: 15 * 60 * 1000, maxRequests: 5 }, // 5 attempts per 15 minutes
  create: { windowMs: 60 * 1000, maxRequests: 10 }, // 10 creates per minute
  search: { windowMs: 60 * 1000, maxRequests: 100 }, // 100 searches per minute
  admin: { windowMs: 60 * 1000, maxRequests: 30 }, // 30 admin requests per minute
  upload: { windowMs: 60 * 1000, maxRequests: 5 }, // 5 uploads per minute
} as const

type RateLimitType = keyof typeof RATE_LIMITS

/**
 * Enhanced rate limiting with different configurations
 * @param identifier - Unique identifier (IP address, user ID, etc.)
 * @param type - Rate limit type configuration to use
 * @returns { allowed: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  identifier: string,
  type: RateLimitType = 'api'
): { allowed: boolean; remaining: number; resetTime: number; limit: number } {
  const config = RATE_LIMITS[type]
  const now = Date.now()
  const record = cache.get(identifier)

  if (!record || now > record.resetTime) {
    // Create new rate limit window
    const newRecord = {
      count: 1,
      resetTime: now + config.windowMs,
    }
    cache.set(identifier, newRecord)
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: newRecord.resetTime,
      limit: config.maxRequests,
    }
  }

  const allowed = record.count < config.maxRequests
  if (allowed) {
    record.count++
  }

  return {
    allowed,
    remaining: Math.max(0, config.maxRequests - record.count),
    resetTime: record.resetTime,
    limit: config.maxRequests,
  }
}

/**
 * Backward compatible rate limit function
 * @param identifier - Unique identifier
 * @param limit - Maximum requests allowed
 * @param windowMs - Time window in milliseconds
 * @returns true if request is allowed, false if rate limited
 */
export function rateLimit(
  identifier: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): boolean {
  const result = checkRateLimit(identifier, 'api')
  return result.allowed
}

/**
 * Get rate limit info for an identifier
 * @param identifier - Unique identifier
 * @param type - Rate limit type
 * @returns Rate limit information
 */
export function getRateLimitInfo(identifier: string, type: RateLimitType = 'api') {
  const result = checkRateLimit(identifier, type)
  // Don't consume a token, just get status
  const record = cache.get(identifier)
  if (record && result.allowed) {
    record.count-- // Undo the increment from checkRateLimit
  }
  return {
    remaining: result.remaining,
    reset: result.resetTime,
    limit: result.limit,
  }
}

/**
 * Create rate limit headers for API responses
 */
export function createRateLimitHeaders(info: {
  remaining: number
  reset: number
  limit: number
}): Record<string, string> {
  return {
    'X-RateLimit-Limit': info.limit.toString(),
    'X-RateLimit-Remaining': info.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(info.reset / 1000).toString(),
  }
}

/**
 * Apply rate limiting to API routes
 * Returns null if allowed, Response object if rate limited
 * @param request - The incoming request
 * @param type - Rate limit type
 * @param customIdentifier - Custom identifier (optional)
 */
export async function applyRateLimit(
  request: Request,
  type: RateLimitType = 'api',
  customIdentifier?: string
): Promise<Response | null> {
  const identifier = customIdentifier || getClientIdentifier(request)
  const result = checkRateLimit(identifier, type)
  const headers = createRateLimitHeaders({
    remaining: result.remaining,
    reset: result.resetTime,
    limit: result.limit,
  })

  if (!result.allowed) {
    const resetDate = new Date(result.resetTime)
    return new Response(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: `Too many requests. Try again at ${resetDate.toISOString()}`,
        data: null,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
          ...headers,
        },
      }
    )
  }

  return null // Request is allowed
}

/**
 * Enhanced rate limiting with both IP and user-based limits
 * @param request - The incoming request
 * @param type - Rate limit type
 * @param userId - User ID for user-based rate limiting
 */
export async function enhancedRateLimit(
  request: Request,
  type: RateLimitType = 'api',
  userId?: string
): Promise<Response | null> {
  const ip = getClientIdentifier(request)
  
  // Check IP-based rate limit
  const ipResult = await applyRateLimit(request, type, `ip:${ip}`)
  if (ipResult) return ipResult

  // If user is authenticated, also check user-based rate limit
  if (userId) {
    const userResult = await applyRateLimit(request, type, `user:${userId}`)
    if (userResult) {
      // Customize the error message for user-based limits
      const errorResponse = await userResult.json()
      return new Response(
        JSON.stringify({
          ...errorResponse,
          error: 'User rate limit exceeded',
          message: 'You have made too many requests. Please try again later.',
        }),
        {
          status: 429,
          headers: userResult.headers,
        }
      )
    }
  }

  return null // All rate limits passed
}

/**
 * Reset rate limit for an identifier (useful for testing)
 * @param identifier - Unique identifier
 * @param type - Rate limit type (optional)
 */
export function resetRateLimit(identifier: string, type?: RateLimitType): void {
  if (type) {
    // Reset specific type for identifier
    cache.delete(`${type}:${identifier}`)
  } else {
    // Reset all types for identifier
    for (const rateLimitType of Object.keys(RATE_LIMITS)) {
      cache.delete(`${rateLimitType}:${identifier}`)
    }
    // Also reset the plain identifier
    cache.delete(identifier)
  }
}

/**
 * Clear all rate limit entries (admin function)
 */
export function clearAllRateLimits(): void {
  cache.clear()
}

/**
 * Get rate limit statistics
 */
export function getRateLimitStats(): {
  totalEntries: number
  cacheSize: number
  maxSize: number
} {
  return {
    totalEntries: cache.size,
    cacheSize: cache.calculatedSize || 0,
    maxSize: cache.max,
  }
}

/**
 * Helper to get client identifier from request
 * @param request - Next.js request object
 * @returns Client identifier (IP or 'anonymous')
 */
export function getClientIdentifier(request: Request): string {
  // Try to get real IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')
  const cfConnecting = request.headers.get('cf-connecting-ip')
  
  return (
    cfConnecting ||
    realIp ||
    forwarded?.split(',')[0].trim() ||
    'anonymous'
  )
}
