/**
 * /api/profile/certifications
 * POST: Adds a certification record for the authenticated user.
 * DELETE: Deletes a certification record enforcing user ownership.
 */

import { NextRequest } from 'next/server'
import { getAuthenticatedUser } from '@/lib/server/auth'
import { isDatabaseConfigured } from '@/lib/server/prisma'
import { addCertification, deleteCertification } from '@/lib/server/profile-service'
import { certificationSchema } from '@/lib/server/validation'
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
    const validated = certificationSchema.parse(body)

    const certification = await addCertification(user.id, validated)
    return apiSuccess({ certification }, 201)
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
      return apiError('Certification ID is required.', 400, 'MISSING_ID')
    }

    const deleted = await deleteCertification(user.id, id)
    if (!deleted) {
      return apiError('Certification entry not found or permission denied.', 404, 'NOT_FOUND')
    }

    return apiSuccess({ deleted: true })
  } catch (err) {
    return handleApiError(err)
  }
}
