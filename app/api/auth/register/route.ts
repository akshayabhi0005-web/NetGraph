/**
 * POST /api/auth/register
 * Registers a new user account with secure scrypt salted password hashing.
 */

import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma, isDatabaseConfigured } from '@/lib/server/prisma'
import { registerSchema } from '@/lib/server/validation'
import {
  generateSalt,
  hashPassword,
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
    const rateLimit = checkRateLimit(`register:${ip}`, 10, 60 * 1000)
    if (!rateLimit.allowed) {
      return apiError('Too many registration attempts. Please wait a minute before trying again.', 429, 'RATE_LIMIT_EXCEEDED')
    }

    if (!isDatabaseConfigured()) {
      return apiError(
        'Database connection is not configured. Please configure DATABASE_URL in your environment.',
        503,
        'DATABASE_NOT_CONFIGURED'
      )
    }

    const body = await req.json()
    const validated = registerSchema.parse(body)

    const normalizedEmail = validated.email.toLowerCase().trim()

    // Check if email already registered
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existing) {
      return apiError('An account with this email address already exists.', 409, 'EMAIL_EXISTS')
    }

    const salt = generateSalt()
    const passwordHash = await hashPassword(validated.password, salt)

    // Create user and associated initial profile in a transaction
    const newUser = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        salt,
        profile: {
          create: {
            name: validated.name.trim(),
            onboarded: false,
            onboardingStep: 1,
          },
        },
        settings: {
          create: {
            theme: 'system',
            demoAnalysisMode: false,
            emailSummaries: false,
            shareAnalytics: false,
            defaultGraphLayout: 'force-directed',
          },
        },
      },
      include: {
        profile: true,
        settings: true,
      },
    })

    const token = await createDatabaseSession(newUser.id)

    // Set secure HTTP-only cookie
    const cookieStore = await cookies()
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_EXPIRY_DAYS * 24 * 60 * 60,
    })

    const { passwordHash: _hash, salt: _salt, ...safeUser } = newUser

    return apiSuccess({ user: safeUser }, 201)
  } catch (err) {
    return handleApiError(err)
  }
}
