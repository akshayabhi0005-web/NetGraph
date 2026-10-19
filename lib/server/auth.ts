/**
 * NETGRAPH Server-Side Authentication & Session Service
 *
 * Cryptographic implementation:
 * - Passwords are salted with 16 bytes of cryptographically secure random bytes
 * - Hashed with scrypt (N=16384, r=8, p=1, keylen=64)
 * - Compared using timingSafeEqual to defeat timing attacks
 * - Sessions are issued with 32-byte secure random tokens
 * - Stored in HTTP-only, SameSite, Secure cookies
 */

import crypto from 'node:crypto'
import { cookies } from 'next/headers'
import { prisma, isDatabaseConfigured } from './prisma'
import { assertProductionEnvironment } from './env'
import { User, UserProfile, UserSettings, Education, Skill, Project, Experience, Certification } from '@prisma/client'

export const SESSION_COOKIE_NAME = 'netgraph_session'
export const SESSION_EXPIRY_DAYS = 7

// ─────────────────────────────────────────────────────────────────────────────
// 1. Password Hashing & Verification
// ─────────────────────────────────────────────────────────────────────────────

export function generateSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

export function hashPassword(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (err, derivedKey) => {
      if (err) return reject(err)
      resolve(derivedKey.toString('hex'))
    })
  })
}

export async function verifyPassword(password: string, salt: string, expectedHash: string): Promise<boolean> {
  try {
    const derivedHash = await hashPassword(password, salt)
    const bufA = Buffer.from(derivedHash, 'hex')
    const bufB = Buffer.from(expectedHash, 'hex')
    if (bufA.length !== bufB.length) return false
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Session Management
// ─────────────────────────────────────────────────────────────────────────────

export interface AuthenticatedUserSession {
  user: {
    id: string
    email: string
    createdAt: Date
    profile: UserProfile | null
    settings: UserSettings | null
    educations?: Education[]
    skills?: Skill[]
    projects?: Project[]
    experiences?: Experience[]
    certifications?: Certification[]
  }
  token: string
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Creates a database session record for the user and returns the token
 */
export async function createDatabaseSession(userId: string): Promise<string> {
  assertProductionEnvironment()
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000)

  await prisma.userSession.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  })

  return token
}

/**
 * Revokes a session token from the database
 */
export async function revokeDatabaseSession(token: string): Promise<void> {
  if (!isDatabaseConfigured()) return
  try {
    await prisma.userSession.deleteMany({
      where: { token },
    })
  } catch (err) {
    console.error('Error revoking session:', err)
  }
}

/**
 * Verifies that state-changing requests (POST, PUT, DELETE) originate from the
 * expected application origin when authenticated via ambient cookies.
 */
export function verifyCsrfOrigin(req: Request): boolean {
  const method = req.method.toUpperCase()
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    return true
  }

  // Authorization header authentication (Bearer) is not subject to ambient browser CSRF
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return true
  }

  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host')
  const referer = req.headers.get('referer')

  const isMatchingHost = (candidateUrlStr: string): boolean => {
    try {
      const candidateUrl = new URL(candidateUrlStr)
      if (host && candidateUrl.host.toLowerCase() === host.toLowerCase()) return true
      if (process.env.NEXT_PUBLIC_APP_URL) {
        const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL)
        if (candidateUrl.host.toLowerCase() === appUrl.host.toLowerCase()) return true
      }
      return false
    } catch {
      return false
    }
  }

  if (origin) {
    return isMatchingHost(origin)
  }

  if (referer) {
    return isMatchingHost(referer)
  }

  // In production, browser cookie mutations without Origin or Referer are rejected
  if (process.env.NODE_ENV === 'production') {
    return false
  }

  // In development and test environments, allow requests without origin/referer
  return true
}

/**
 * Extracts and verifies the active user session from HTTP-only cookie or Authorization header.
 * Scopes all downstream actions strictly to the resolved user.
 */
export async function getAuthenticatedUser(req?: Request): Promise<AuthenticatedUserSession['user'] | null> {
  if (!isDatabaseConfigured()) {
    return null
  }

  let sessionToken: string | undefined
  let isBearerAuth = false

  // 1. Try reading token from Authorization header: Bearer <token>
  if (req) {
    const authHeader = req.headers.get('authorization')
    if (authHeader && authHeader.startsWith('Bearer ')) {
      sessionToken = authHeader.substring(7).trim()
      isBearerAuth = true
    }
  }

  // 2. Try reading from HTTP-only cookie
  if (!sessionToken) {
    try {
      const cookieStore = await cookies()
      sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value
    } catch {
      // cookies() might fail outside Next.js request context (e.g. testing)
    }
  }

  if (!sessionToken) {
    return null
  }

  // 3. For state-changing requests using cookie authentication, enforce CSRF Origin check
  if (!isBearerAuth && req && !verifyCsrfOrigin(req)) {
    return null
  }

  try {
    const sessionRecord = await prisma.userSession.findUnique({
      where: { token: sessionToken },
      include: {
        user: {
          include: {
            profile: true,
            settings: true,
            educations: { orderBy: { startYear: 'desc' } },
            skills: { orderBy: { name: 'asc' } },
            projects: { orderBy: { createdAt: 'desc' } },
            experiences: { orderBy: { startDate: 'desc' } },
            certifications: { orderBy: { createdAt: 'desc' } },
          },
        },
      },
    })

    if (!sessionRecord) {
      return null
    }

    // Check expiration
    if (sessionRecord.expiresAt.getTime() < Date.now()) {
      await revokeDatabaseSession(sessionToken)
      return null
    }

    const { passwordHash: _hash, salt: _salt, ...safeUser } = sessionRecord.user
    return safeUser
  } catch (err) {
    console.error('Error validating session:', err)
    return null
  }
}
