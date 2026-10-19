/**
 * /api/profile/experience
 * POST: Adds an experience record for the authenticated user.
 * DELETE: Deletes an experience record enforcing user ownership.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { addExperience, deleteExperience } from '@/lib/server/profile-service'
import { experienceSchema } from '@/lib/server/validation'
import { apiSuccess, apiError, handleApiError } from '@/lib/server/api-response'

export async function POST(req: NextRequest) {
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
    const validated = experienceSchema.parse(body)

    const experience = await addExperience(user.id, validated)
    return apiSuccess({ experience }, 201)
  } catch (err) {
    return handleApiError(err)
  }
}

export async function DELETE(req: NextRequest) {
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

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return apiError('Experience ID is required.', 400, 'MISSING_ID')
    }

    const deleted = await deleteExperience(user.id, id)
    if (!deleted) {
      return apiError('Experience entry not found or permission denied.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err)
  }
}
