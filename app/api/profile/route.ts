/**
 * /api/profile
 * GET: Retrieves the authenticated user's complete profile and portfolio.
 * PUT: Updates top-level profile information (headline, summary, links, etc.).
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { getCompleteUserProfile, updateUserProfile } from '@/lib/server/profile-service'
import { profileUpdateSchema } from '@/lib/server/validation'
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
      return apiError('Authentication required.', 401, 'UNAUTHORIZED')
    }

    const fullProfile = await getCompleteUserProfile(user.id)
    if (!fullProfile) {
      return apiError('Profile record not found.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ profile: fullProfile })
  } catch (err) {
    return handleApiError(err)
  }
}

export async function PUT(req: NextRequest) {
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
      return apiError('Authentication required.', 401, 'UNAUTHORIZED')
    }

    const body = await req.json()
    const validated = profileUpdateSchema.parse(body)

    const updated = await updateUserProfile(user.id, validated)

    return apiSuccess({ profile: updated })
  } catch (err) {
    return handleApiError(err)
  }
}
