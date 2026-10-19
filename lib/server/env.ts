/**
 * NETGRAPH Server Environment Validation Module
 *
 * Verifies that required production variables (DATABASE_URL, AUTH_SECRET, NODE_ENV)
 * are properly configured with sufficient entropy and without default placeholder values.
 *
 * Prevents runtime execution with insecure or missing secrets in production.
 */

export interface EnvValidationResult {
  valid: boolean
  errors: string[]
  isProduction: boolean
}

export function validateEnvironment(): EnvValidationResult {
  const errors: string[] = []
  const isProduction = process.env.NODE_ENV === 'production'

  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl || dbUrl.trim().length === 0) {
    errors.push('DATABASE_URL is not set or empty.')
  }

  const authSecret = process.env.AUTH_SECRET
  if (isProduction) {
    if (!authSecret || authSecret.trim().length === 0) {
      errors.push('AUTH_SECRET is required in production.')
    } else if (
      authSecret.includes('change-this') ||
      authSecret.includes('your-secure-random-secret') ||
      authSecret.includes('placeholder')
    ) {
      errors.push('AUTH_SECRET must be replaced with a cryptographically secure random value in production.')
    } else if (authSecret.length < 32) {
      errors.push('AUTH_SECRET must be at least 32 characters in production.')
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    isProduction,
  }
}

export function assertProductionEnvironment(): void {
  const result = validateEnvironment()
  if (!result.valid && result.isProduction) {
    // Fail safely without displaying sensitive values in error
    throw new Error(`CRITICAL CONFIGURATION ERROR: ${result.errors.join(' ')}`)
  }
}
