import { prisma, isDatabaseConfigured } from '../../lib/server/prisma'

/**
 * Safely purges test accounts created during E2E runs
 * Never deletes or affects non-test accounts
 */
export async function cleanupTestUser(email: string): Promise<void> {
  if (!isDatabaseConfigured()) return
  if (!email.startsWith('test.e2e.')) {
    throw new Error(`Refusing to delete non-test account: ${email}`)
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (user) {
      await prisma.user.delete({
        where: { id: user.id },
      })
      console.log(`[E2E Cleanup] Purged test account: ${email}`)
    }
  } catch (err) {
    console.warn(`[E2E Cleanup] Warning during cleanup of ${email}:`, err)
  }
}

export async function cleanupAllE2ETestUsers(): Promise<void> {
  if (!isDatabaseConfigured()) return

  try {
    const testUsers = await prisma.user.findMany({
      where: {
        email: {
          startsWith: 'test.e2e.',
        },
      },
      select: { id: true, email: true },
    })

    for (const u of testUsers) {
      await prisma.user.delete({ where: { id: u.id } })
      console.log(`[E2E Cleanup] Purged test account: ${u.email}`)
    }
  } catch (err) {
    console.warn('[E2E Cleanup] Warning during bulk cleanup:', err)
  }
}
