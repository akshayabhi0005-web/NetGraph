/**
 * NETGRAPH Standardized API Response & Error Handling Module
 * Guarantees uniform response structures across all route handlers
 * and prevents leaking internal database errors, connection strings, or stack traces.
 */

import { NextResponse } from 'next/server'
import { ZodError } from 'zod'

export interface ApiSuccessResponse<T> {
  success: true
  data: T
  meta?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: string
  code?: string
  details?: unknown
}

export function apiSuccess<T>(data: T, status = 200, meta?: Record<string, unknown>): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  )
}

export function apiError(
  error: string,
  status = 400,
  code?: string,
  details?: unknown
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error,
      code,
      details,
    },
    { status }
  )
}

export function handleApiError(err: unknown): NextResponse<ApiErrorResponse> {
  // 1. Zod validation error
  if (err instanceof ZodError) {
    const formattedIssues = err.issues.map((i) => ({
      field: i.path.join('.'),
      message: i.message,
    }))
    return apiError('Validation error. Please verify input fields.', 400, 'VALIDATION_ERROR', formattedIssues)
  }

  // 2. Custom application error with status
  if (typeof err === 'object' && err !== null && 'status' in err && 'message' in err) {
    const appErr = err as { status: number; message: string; code?: string }
    return apiError(appErr.message, appErr.status || 400, appErr.code)
  }

  // 3. Prisma unique constraint violation (e.g. email already exists)
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const prismaErr = err as { code: string; meta?: unknown }
    if (prismaErr.code === 'P2002') {
      return apiError('A record with this unique value already exists.', 409, 'UNIQUE_CONSTRAINT_VIOLATION')
    }
    if (prismaErr.code === 'P2025') {
      return apiError('The requested resource was not found.', 404, 'NOT_FOUND')
    }
  }

  // 4. Default generic error — log on server, return sanitized message to client
  console.error('Unhandled Server API Error:', err)
  return apiError('An unexpected server error occurred. Please try again later.', 500, 'INTERNAL_SERVER_ERROR')
}
