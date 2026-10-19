/**
 * GET /api/auth/me
 * Restores and verifies active user session from HTTP-only cookie or bearer token.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { apiSuccess, apiError, handleApiError } from '@/lib/server/api-response'

export async function GET(req: NextRequest) {
  try {
    if (!isDatabaseConfigured()) {
      return apiError(
        'Database connection is not configured. Please configure DATABASE_URL in your environment.',
        503,
        'DATABASE_NOT_CONFIGURED'
      )
    }

    const user = await getAuthenticatedUser(req)

    if (!user) {
      return apiError('Authentication required. Please sign in.', 401, 'UNAUTHORIZED')
    }

    return apiSuccess({ user })
  } catch (err) {
    return handleApiError(err)
  }
}
