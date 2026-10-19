/**
 * GET /api/analytics/associations
 * Mines and returns Apriori frequent itemsets and association rules (Support, Confidence, Lift).
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { getUserAssociationAnalytics } from '@/lib/server/mining-service'
import { associationsQuerySchema } from '@/lib/server/validation'
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
      return apiError('Authentication required to access association analytics.', 401, 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(req.url)
    const queryInput = associationsQuerySchema.parse({
      minSupport: searchParams.get('minSupport') || undefined,
      minConfidence: searchParams.get('minConfidence') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    const associationAnalytics = await getUserAssociationAnalytics(user.id, queryInput)
    if (!associationAnalytics) {
      return apiError('User profile not found.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ associationAnalytics })
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
