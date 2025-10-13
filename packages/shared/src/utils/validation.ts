import { z } from 'zod'
import type { APIResponse } from '../schemas'

/**
 * Validate request body with Zod schema
 * Returns validated data or throws error with details
 */
export function validateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): T {
  try {
    return schema.parse(body)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      throw new Error(`Validation error: ${errorMessages}`)
    }
    throw error
  }
}

/**
 * Safely validate request body and return result object
 * Returns success/error status with data or error details
 */
export function safeValidateRequestBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): { success: true; data: T } | { success: false; error: string } {
  try {
    const data = schema.parse(body)
    return { success: true, data }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      return { success: false, error: `Validation error: ${errorMessages}` }
    }
    return { success: false, error: 'Unknown validation error' }
  }
}

/**
 * Validate query parameters with Zod schema
 * Handles URL search params conversion
 */
export function validateQueryParams<T>(
  schema: z.ZodSchema<T>,
  searchParams: URLSearchParams | Record<string, string | string[]>
): T {
  // Convert URLSearchParams or object to plain object
  let params: Record<string, any> = {}
  
  if (searchParams instanceof URLSearchParams) {
    searchParams.forEach((value, key) => {
      // Handle array parameters (e.g., tags[]=tag1&tags[]=tag2)
      if (key.endsWith('[]')) {
        const cleanKey = key.slice(0, -2)
        if (!params[cleanKey]) params[cleanKey] = []
        params[cleanKey].push(value)
      } else if (params[key]) {
        // Convert to array if multiple values for same key
        if (!Array.isArray(params[key])) {
          params[key] = [params[key]]
        }
        params[key].push(value)
      } else {
        params[key] = value
      }
    })
  } else {
    params = { ...searchParams }
  }
  
  try {
    return schema.parse(params)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      throw new Error(`Query parameter validation error: ${errorMessages}`)
    }
    throw error
  }
}

/**
 * Create a standardized API response
 */
export function createAPIResponse<T>(
  data: T | null,
  error: string | null = null,
  message?: string,
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
): APIResponse<T> {
  return {
    data,
    error,
    message,
    meta,
  }
}

/**
 * Create success API response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
): APIResponse<T> {
  return createAPIResponse(data, null, message, meta)
}

/**
 * Create error API response
 */
export function createErrorResponse(
  error: string,
  message?: string
): APIResponse<null> {
  return createAPIResponse(null, error, message)
}

/**
 * Calculate pagination metadata
 */
export function calculatePaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit)
  return {
    page,
    limit,
    total,
    totalPages,
  }
}

/**
 * Sanitize string input (basic XSS prevention)
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate UUID format
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(uuid)
}

/**
 * Validate email format (more comprehensive than basic regex)
 */
export function isValidEmail(email: string): boolean {
  try {
    const emailSchema = z.string().email()
    emailSchema.parse(email)
    return true
  } catch {
    return false
  }
}

/**
 * Parse and validate JSON string
 */
export function safeParseJSON<T>(
  jsonString: string,
  schema?: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: string } {
  try {
    const parsed = JSON.parse(jsonString)
    
    if (schema) {
      const validated = schema.parse(parsed)
      return { success: true, data: validated }
    }
    
    return { success: true, data: parsed }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(
        (err) => `${err.path.join('.')}: ${err.message}`
      ).join(', ')
      return { success: false, error: `JSON validation error: ${errorMessages}` }
    }
    if (error instanceof SyntaxError) {
      return { success: false, error: 'Invalid JSON format' }
    }
    return { success: false, error: 'JSON parsing failed' }
  }
}

/**
 * Convert Zod schema to JSON Schema (for API documentation)
 */
export function zodToJsonSchema(schema: z.ZodSchema): any {
  // This is a simplified version - you might want to use zod-to-json-schema library
  // for more comprehensive conversion
  try {
    const zodToJsonSchema = require('zod-to-json-schema')
    return zodToJsonSchema(schema)
  } catch (error) {
    console.warn('zod-to-json-schema not available:', error)
    return { type: 'object', description: 'Schema conversion not available' }
  }
}