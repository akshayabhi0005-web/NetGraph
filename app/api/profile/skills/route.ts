/**
 * /api/profile/skills
 * POST: Adds or updates a skill entry for the authenticated user.
 * DELETE: Removes a skill entry enforcing ownership.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { addOrUpdateSkill, deleteSkill } from '@/lib/server/profile-service'
import { skillSchema } from '@/lib/server/validation'
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
    const validated = skillSchema.parse(body)

    const skill = await addOrUpdateSkill(user.id, validated)
    return apiSuccess({ skill }, 201)
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
      return apiError('Skill ID is required.', 400, 'MISSING_ID')
    }

    const deleted = await deleteSkill(user.id, id)
    if (!deleted) {
      return apiError('Skill not found or permission denied.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err)
  }
}
