import { NextRequest, NextResponse } from 'next/server'
import { applyRateLimit, enhancedRateLimit, createRateLimitHeaders, getRateLimitInfo } from '@/lib/rate-limit'
import { validateRequestBody, createSuccessResponse, createErrorResponse } from '@infinitas/shared/utils'
import { schemas } from '@infinitas/shared'

const { CreateContactSchema } = schemas

/**
 * Example GET endpoint with basic rate limiting
 */
export async function GET(request: NextRequest) {
  // Apply rate limiting for search endpoints
  const rateLimitResult = await applyRateLimit(request, 'search')
  if (rateLimitResult) return rateLimitResult

  try {
    // Your API logic here
    const data = {
      message: 'This endpoint is rate limited for searches',
      timestamp: new Date().toISOString(),
    }

    // Get rate limit info to add headers
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitInfo = getRateLimitInfo(ip, 'search')
    const headers = createRateLimitHeaders(rateLimitInfo)

    return NextResponse.json(
      createSuccessResponse(data, 'Search completed successfully'),
      { headers }
    )
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

/**
 * Example POST endpoint with enhanced rate limiting (IP + User based)
 */
export async function POST(request: NextRequest) {
  try {
    // Get user ID from request headers (set by middleware)
    const userId = request.headers.get('x-user-id')

    // Apply enhanced rate limiting (both IP and user-based)
    const rateLimitResult = await enhancedRateLimit(request, 'create', userId || undefined)
    if (rateLimitResult) return rateLimitResult

    // Parse and validate request body
    const body = await request.json()
    const validationResult = validateRequestBody(CreateContactSchema, body)

    // Your API logic here (create contact, etc.)
    const data = {
      message: 'Contact created successfully',
      contact: validationResult,
      timestamp: new Date().toISOString(),
    }

    // Add rate limit headers to response
    const ip = request.headers.get('x-forwarded-for') || 'anonymous'
    const rateLimitInfo = getRateLimitInfo(ip, 'create')
    const headers = createRateLimitHeaders(rateLimitInfo)

    return NextResponse.json(
      createSuccessResponse(data, 'Contact created'),
      { 
        status: 201,
        headers 
      }
    )
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        createErrorResponse(error.message),
        { status: 400 }
      )
    }

    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}

/**
 * Example PUT endpoint with admin rate limiting
 */
export async function PUT(request: NextRequest) {
  try {
    // Get user ID from headers
    const userId = request.headers.get('x-user-id')
    if (!userId) {
      return NextResponse.json(
        createErrorResponse('Unauthorized'),
        { status: 401 }
      )
    }

    // Apply admin-level rate limiting
    const rateLimitResult = await enhancedRateLimit(request, 'admin', userId)
    if (rateLimitResult) return rateLimitResult

    // Your admin API logic here
    const data = {
      message: 'Admin operation completed',
      timestamp: new Date().toISOString(),
    }

    return NextResponse.json(
      createSuccessResponse(data, 'Admin operation successful')
    )
  } catch (error) {
    return NextResponse.json(
      createErrorResponse('Internal server error'),
      { status: 500 }
    )
  }
}