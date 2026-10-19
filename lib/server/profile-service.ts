/**
 * NETGRAPH Server-Side Profile Service
 *
 * Enforces strict user-ownership across all private relational entities:
 * Education, Skill, Project, Experience, and Certification.
 * All queries are strictly scoped to the authenticated user's ID.
 */

import { prisma } from './prisma'
import {
  ProfileUpdateInput,
  EducationInput,
  SkillInput,
  ProjectInput,
  ExperienceInput,
  CertificationInput,
} from './validation'
import { invalidateMiningCache } from './mining-cache'

// ─────────────────────────────────────────────────────────────────────────────
// 1. Profile Retrieval & Aggregation
// ─────────────────────────────────────────────────────────────────────────────

export async function getCompleteUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      profile: true,
      educations: { orderBy: { startYear: 'desc' } },
      skills: { orderBy: { name: 'asc' } },
      projects: { orderBy: { createdAt: 'desc' } },
      experiences: { orderBy: { startDate: 'desc' } },
      certifications: { orderBy: { createdAt: 'desc' } },
      settings: true,
    },
  })

  if (!user) return null

  const { passwordHash: _hash, salt: _salt, ...safeProfile } = user
  return safeProfile
}

export async function updateUserProfile(userId: string, input: ProfileUpdateInput) {
  // Upsert user profile record
  const profile = await prisma.userProfile.upsert({
    where: { userId },
    create: {
      userId,
      name: input.name || '',
      headline: input.headline,
      location: input.location,
      summary: input.summary,
      careerGoal: input.careerGoal,
      phone: input.phone,
      linkedinUrl: input.linkedinUrl,
      githubUrl: input.githubUrl,
      portfolioUrl: input.portfolioUrl,
      onboarded: input.onboarded ?? false,
      onboardingStep: input.onboardingStep ?? 1,
    },
    update: {
      ...(input.name !== undefined && { name: input.name }),
      ...(input.headline !== undefined && { headline: input.headline }),
      ...(input.location !== undefined && { location: input.location }),
      ...(input.summary !== undefined && { summary: input.summary }),
      ...(input.careerGoal !== undefined && { careerGoal: input.careerGoal }),
      ...(input.phone !== undefined && { phone: input.phone }),
      ...(input.linkedinUrl !== undefined && { linkedinUrl: input.linkedinUrl }),
      ...(input.githubUrl !== undefined && { githubUrl: input.githubUrl }),
      ...(input.portfolioUrl !== undefined && { portfolioUrl: input.portfolioUrl }),
      ...(input.onboarded !== undefined && { onboarded: input.onboarded }),
      ...(input.onboardingStep !== undefined && { onboardingStep: input.onboardingStep }),
    },
  })

  invalidateMiningCache(userId)
  return profile
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Education Operations (Scoped to userId)
// ─────────────────────────────────────────────────────────────────────────────

export async function addEducation(userId: string, input: EducationInput) {
  const res = await prisma.education.create({
    data: {
      userId,
      institution: input.institution,
      degree: input.degree,
      fieldOfStudy: input.fieldOfStudy,
      startYear: input.startYear,
      graduationYear: input.graduationYear,
      coursework: input.coursework,
    },
  })
  invalidateMiningCache(userId)
  return res
}

export async function deleteEducation(userId: string, educationId: string) {
  const result = await prisma.education.deleteMany({
    where: {
      id: educationId,
      userId, // Strictly verifies ownership
    },
  })
  invalidateMiningCache(userId)
  return result.count > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Skill Operations (Scoped to userId)
// ─────────────────────────────────────────────────────────────────────────────

export async function addOrUpdateSkill(userId: string, input: SkillInput) {
  const res = await prisma.skill.upsert({
    where: {
      userId_name: {
        userId,
        name: input.name.trim(),
      },
    },
    create: {
      userId,
      name: input.name.trim(),
      category: input.category,
      proficiency: input.proficiency,
      yearsOfExperience: input.yearsOfExperience || 1,
    },
    update: {
      category: input.category,
      proficiency: input.proficiency,
      yearsOfExperience: input.yearsOfExperience,
    },
  })
  invalidateMiningCache(userId)
  return res
}

export async function deleteSkill(userId: string, skillId: string) {
  const result = await prisma.skill.deleteMany({
    where: {
      id: skillId,
      userId,
    },
  })
  invalidateMiningCache(userId)
  return result.count > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. Project Operations (Scoped to userId)
// ─────────────────────────────────────────────────────────────────────────────

export async function addProject(userId: string, input: ProjectInput) {
  const res = await prisma.project.create({
    data: {
      userId,
      title: input.title.trim(),
      description: input.description.trim(),
      technologies: input.technologies,
      projectUrl: input.projectUrl,
      githubUrl: input.githubUrl,
    },
  })
  invalidateMiningCache(userId)
  return res
}

export async function deleteProject(userId: string, projectId: string) {
  const result = await prisma.project.deleteMany({
    where: {
      id: projectId,
      userId,
    },
  })
  invalidateMiningCache(userId)
  return result.count > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Experience Operations (Scoped to userId)
// ─────────────────────────────────────────────────────────────────────────────

export async function addExperience(userId: string, input: ExperienceInput) {
  const res = await prisma.experience.create({
    data: {
      userId,
      company: input.company.trim(),
      jobTitle: input.jobTitle.trim(),
      employmentType: input.employmentType || 'Full-time',
      startDate: input.startDate,
      endDate: input.endDate,
      isCurrent: input.isCurrent ?? false,
      description: input.description.trim(),
      technologies: input.technologies || [],
    },
  })
  invalidateMiningCache(userId)
  return res
}

export async function deleteExperience(userId: string, experienceId: string) {
  const result = await prisma.experience.deleteMany({
    where: {
      id: experienceId,
      userId,
    },
  })
  invalidateMiningCache(userId)
  return result.count > 0
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Certification Operations (Scoped to userId)
// ─────────────────────────────────────────────────────────────────────────────

export async function addCertification(userId: string, input: CertificationInput) {
  const res = await prisma.certification.create({
    data: {
      userId,
      name: input.name.trim(),
      issuer: input.issuer.trim(),
      issueDate: input.issueDate,
      credentialUrl: input.credentialUrl,
    },
  })
  invalidateMiningCache(userId)
  return res
}

export async function deleteCertification(userId: string, certificationId: string) {
  const result = await prisma.certification.deleteMany({
    where: {
      id: certificationId,
      userId,
    },
  })
  invalidateMiningCache(userId)
  return result.count > 0
}
