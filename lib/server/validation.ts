/**
 * NETGRAPH Server-Side Request Validation Schemas
 * Powered by Zod for strongly-typed, schema-driven API boundary validation.
 */

import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters long').max(100),
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const profileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  headline: z.string().max(200).optional(),
  location: z.string().max(100).optional(),
  summary: z.string().max(5000).optional(),
  careerGoal: z.string().max(2000).optional(),
  phone: z.string().max(30).optional(),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid GitHub URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid Portfolio URL').optional().or(z.literal('')),
  onboarded: z.boolean().optional(),
  onboardingStep: z.number().int().min(1).max(5).optional(),
})

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(150),
  degree: z.string().min(1, 'Degree is required').max(100),
  fieldOfStudy: z.string().min(1, 'Field of study is required').max(100),
  startYear: z.union([
    z.number().int().min(1950).max(2100),
    z.string().regex(/^\d+$/).transform(Number),
  ]),
  graduationYear: z.union([
    z.number().int().min(1950).max(2100),
    z.string().regex(/^\d+$/).transform(Number),
    z.literal('Present').transform(() => new Date().getFullYear()),
  ]),
  coursework: z.string().max(3000).optional(),
})

export type EducationInput = z.infer<typeof educationSchema>

export const skillSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Skill name is required').max(80),
  category: z.string().min(1).max(50).default('Programming Languages'),
  proficiency: z.enum(['Beginner', 'Intermediate', 'Advanced', 'Expert']).default('Intermediate'),
  yearsOfExperience: z.union([
    z.number().int().min(0).max(50),
    z.string().regex(/^\d+$/).transform(Number),
  ]).default(1),
})

export type SkillInput = z.infer<typeof skillSchema>

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Project title is required').max(150),
  description: z.string().min(1, 'Description is required').max(5000),
  technologies: z.union([
    z.array(z.string()).min(1, 'At least one technology is required'),
    z
      .string()
      .transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean))
      .refine((arr) => arr.length > 0, 'At least one technology is required'),
  ]),
  projectUrl: z.string().url('Invalid project URL').optional().or(z.literal('')),
  githubUrl: z.string().url('Invalid repository URL').optional().or(z.literal('')),
})

export type ProjectInput = z.infer<typeof projectSchema>

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required').max(150),
  jobTitle: z.string().min(1, 'Job title is required').max(150),
  employmentType: z.string().max(50).default('Full-time'),
  startDate: z.string().min(1, 'Start date is required').max(50),
  endDate: z.string().max(50).optional(),
  isCurrent: z.boolean().default(false),
  description: z.string().min(1, 'Description is required').max(5000),
  technologies: z.union([
    z.array(z.string()),
    z.string().transform((s) => s.split(',').map((t) => t.trim()).filter(Boolean)),
  ]).default([]),
})

export type ExperienceInput = z.infer<typeof experienceSchema>

export const certificationSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Certification name is required').max(150),
  issuer: z.string().min(1, 'Issuer is required').max(150),
  issueDate: z.string().max(50).optional(),
  credentialUrl: z.string().url('Invalid credential URL').optional().or(z.literal('')),
})

export type CertificationInput = z.infer<typeof certificationSchema>

export const settingsUpdateSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  demoAnalysisMode: z.boolean().optional(),
  emailSummaries: z.boolean().optional(),
  shareAnalytics: z.boolean().optional(),
  defaultGraphLayout: z.string().max(50).optional(),
})

export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>

export const associationsQuerySchema = z.object({
  minSupport: z.coerce.number().min(0.01).max(1.0).optional().default(0.1),
  minConfidence: z.coerce.number().min(0.01).max(1.0).optional().default(0.25),
  limit: z.coerce.number().int().min(1).max(100).optional().default(40),
})

export type AssociationsQueryInput = z.infer<typeof associationsQuerySchema>

export const careersQuerySchema = z.object({
  category: z.string().max(100).optional(),
  minScore: z.coerce.number().min(0).max(100).optional().default(0),
  limit: z.coerce.number().int().min(1).max(50).optional().default(20),
})

export type CareersQueryInput = z.infer<typeof careersQuerySchema>

export const graphQuerySchema = z.object({
  nodeType: z.enum(['all', 'skill', 'project', 'experience', 'education', 'certification', 'career_role']).optional().default('all'),
  limit: z.coerce.number().int().min(1).max(200).optional().default(100),
})

export type GraphQueryInput = z.infer<typeof graphQuerySchema>
