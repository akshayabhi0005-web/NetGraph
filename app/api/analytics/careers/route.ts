/**
 * GET /api/analytics/careers
 * Retrieves career role alignments, match scores, and prioritized skill gaps.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { getUserCareersAnalytics } from '@/lib/server/mining-service'
import { careersQuerySchema } from '@/lib/server/validation'
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
      return apiError('Authentication required to access career analytics.', 401, 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(req.url)
    const queryInput = careersQuerySchema.parse({
      category: searchParams.get('category') || undefined,
      minScore: searchParams.get('minScore') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    const careerAnalytics = await getUserCareersAnalytics(user.id, queryInput)
    if (!careerAnalytics) {
      return apiError('User profile not found.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ careerAnalytics })
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
