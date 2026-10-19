/**
 * POST /api/auth/logout
 * Terminates user session and removes the HTTP-only session cookie.
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import {
  revokeDatabaseSession,
  verifyCsrfOrigin,
  SESSION_COOKIE_NAME,
} from '@/lib/server/auth'
import { apiSuccess, apiError, handleApiError } from '@/lib/server/api-response'

export async function POST(req: NextRequest) {
  try {
    if (!verifyCsrfOrigin(req)) {
      return apiError('Cross-origin request forbidden.', 403, 'CSRF_FORBIDDEN')
    }

    const cookieStore = await cookies()
    const cookieToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

    // Also support revoking Bearer tokens
    const authHeader = req.headers.get('authorization')
    const bearerToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined

    const tokenToRevoke = cookieToken || bearerToken

    if (tokenToRevoke) {
      await revokeDatabaseSession(tokenToRevoke)
    }

    // Clear session cookie
    cookieStore.delete(SESSION_COOKIE_NAME)

    return apiSuccess({ loggedOut: true })
  } catch (err) {
    return handleApiError(err)
  }
}
