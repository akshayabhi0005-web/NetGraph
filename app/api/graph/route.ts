/**
 * GET /api/graph
 * Retrieves real multi-entity relationship graph nodes and weighted edges derived from user profile entities.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { getUserGraphAnalytics } from '@/lib/server/mining-service'
import { graphQuerySchema } from '@/lib/server/validation'
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
      return apiError('Authentication required to access relationship graph.', 401, 'UNAUTHORIZED')
    }

    const { searchParams } = new URL(req.url)
    const queryInput = graphQuerySchema.parse({
      nodeType: searchParams.get('nodeType') || undefined,
      limit: searchParams.get('limit') || undefined,
    })

    const graphAnalytics = await getUserGraphAnalytics(user.id, queryInput)
    if (!graphAnalytics) {
      return apiError('User profile not found.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ graph: graphAnalytics })
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
