/**
 * POST /api/auth/login
 * Authenticates user credentials and issues an HTTP-only session cookie.
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma, isDatabaseConfigured } from '@/lib/server/prisma'
import { loginSchema } from '@/lib/server/validation'
import {
  verifyPassword,
  createDatabaseSession,
  verifyCsrfOrigin,
  SESSION_COOKIE_NAME,
  SESSION_EXPIRY_DAYS,
} from '@/lib/server/auth'
import { checkRateLimit } from '@/lib/server/rate-limit'
import { apiSuccess, apiError, handleApiError } from '@/lib/server/api-response'

export async function POST(req: NextRequest) {
  try {
    // 1. CSRF Origin Verification
    if (!verifyCsrfOrigin(req)) {
      return apiError('Cross-origin request forbidden.', 403, 'CSRF_FORBIDDEN')
    }

    // 2. IP Rate Limiting (10 requests per minute)
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1'
    const rateLimit = checkRateLimit(`login:${ip}`, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      return apiError('Too many login attempts. Please wait a minute before trying again.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    if (!isDatabaseConfigured()) {
      return apiError(
        'Database connection is not configured. Please configure DATABASE_URL in your environment.',
        503,
        'DATABASE_NOT_CONFIGURED'
      )
    }

    const body = await req.json()
    const validated = loginSchema.parse(body)

    const normalizedEmail = validated.email.toLowerCase().trim()

    // 3. Account-level Rate Limiting (5 attempts per minute per email)
    const emailRateLimit = checkRateLimit(`login:email:${normalizedEmail}`, 5, 60 * 1000)
    if (!emailRateLimit.allowed) {
      return apiError('Too many failed login attempts for this account. Please wait a minute before trying again.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      include: {
        profile: true,
        settings: true,
        educations: { orderBy: { startYear: 'desc' } },
        skills: { orderBy: { name: 'asc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        experiences: { orderBy: { startDate: 'desc' } },
        certifications: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!user) {
      return apiError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    const isValid = await verifyPassword(validated.password, user.salt, user.passwordHash)
    if (!isValid) {
      return apiError('Invalid email or password.', 401, 'INVALID_CREDENTIALS')
    }

    const token = await createDatabaseSession(user.id)

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    })

    const { passwordHash: _hash, salt: _salt, ...safeUser } = user

    return apiSuccess({ user: safeUser })
  } catch (err) {
    return handleApiError(err)
  }
}
