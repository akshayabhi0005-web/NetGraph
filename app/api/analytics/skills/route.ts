/**
 * GET /api/analytics/skills
 * Retrieves normalized skill inventory, category breakdowns, and proficiency distributions.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { getUserSkillsAnalytics } from '@/lib/server/mining-service'
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
      return apiError('Authentication required to access skills analytics.', 401, 'UNAUTHORIZED')
    }

    const skillsAnalytics = await getUserSkillsAnalytics(user.id)
    if (!skillsAnalytics) {
      return apiError('User profile not found.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ skillsAnalytics })
  } catch (err) {
    if (err instanceof Error && err.message === 'DATABASE_NOT_CONFIGURED') {
      return apiError(
        'Database connection is not configured. Please configure DATABASE_URL in your environment.',
        503,
        'DATABASE_NOT_CONFIGURED'
      )
    }
    return handleApiError(err)
  }
}
