/**
 * NETGRAPH Server-Side User Settings Service
 * Manages user preferences with user-scoped isolation.
 */

import { prisma } from './prisma'
import { SettingsUpdateInput } from './validation'

export async function getUserSettings(userId: string) {
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  })

  if (!settings) {
    // Create default settings if not already instantiated
    settings = await prisma.userSettings.create({
      data: {
        userId,
        theme: 'system',
        demoAnalysisMode: false,
        emailSummaries: false,
        shareAnalytics: false,
        defaultGraphLayout: 'force-directed',
      },
    })
  }

  return settings
}

export async function updateUserSettings(userId: string, input: SettingsUpdateInput) {
  return prisma.userSettings.upsert({
    where: { userId },
    create: {
      userId,
      theme: input.theme || 'system',
      demoAnalysisMode: input.demoAnalysisMode ?? false,
      emailSummaries: input.emailSummaries ?? false,
      shareAnalytics: input.shareAnalytics ?? false,
      defaultGraphLayout: input.defaultGraphLayout || 'force-directed',
    },
    update: {
      ...(input.theme !== undefined && { theme: input.theme }),
      ...(input.demoAnalysisMode !== undefined && { demoAnalysisMode: input.demoAnalysisMode }),
      ...(input.emailSummaries !== undefined && { emailSummaries: input.emailSummaries }),
      ...(input.shareAnalytics !== undefined && { shareAnalytics: input.shareAnalytics }),
      ...(input.defaultGraphLayout !== undefined && { defaultGraphLayout: input.defaultGraphLayout }),
    },
  })
}
