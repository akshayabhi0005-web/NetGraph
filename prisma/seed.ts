/**
 * NETGRAPH Database Seed Script
 * Populates PostgreSQL with synthetic demonstration data for local development.
 *
 * Run via: npx tsx prisma/seed.ts
 */

import { PrismaClient } from '@prisma/client'
import crypto from 'node:crypto'

const prisma = new PrismaClient()

// Secure password hashing utility for seed
function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex')
}

async function main() {
  console.log('🌱 Starting NETGRAPH database seeding...')

  const demoEmail = 'alex.morgan@netgraph.edu'

  // Clean up existing demo seed user if already present
  const existing = await prisma.user.findUnique({
    where: { email: demoEmail },
  })

  if (existing) {
    console.log(`ℹ️  Existing demo user found (${demoEmail}). Deleting before reseeding...`)
    await prisma.user.delete({
      where: { id: existing.id },
    })
  }

  // Create demo salt and hashed password
  const salt = crypto.randomBytes(16).toString('hex')
  const passwordHash = hashPassword('Password123!', salt)

  const demoUser = await prisma.user.create({
    data: {
      email: demoEmail,
      passwordHash,
      salt,
      profile: {
        create: {
          name: 'Alex Morgan',
          headline: 'Product & Data Analyst exploring career pathways',
          location: 'Toronto, Canada',
          summary:
            'Analyst focused on turning complex relational data into clear product decisions and graph discoveries.',
          careerGoal: 'Transition into Senior Product Analytics & Data Science.',
          linkedinUrl: 'https://linkedin.com/in/alexmorgan-demo',
          githubUrl: 'https://github.com/alexmorgan-demo',
          portfolioUrl: 'https://net-graph.vercel.app',
          onboarded: true,
          onboardingStep: 4,
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
      educations: {
        create: [
          {
            institution: 'University of Toronto',
            degree: 'Bachelor of Science',
            fieldOfStudy: 'Computer Science & Statistics',
            startYear: 2020,
            graduationYear: 2024,
            coursework:
              'Data Structures, Database Management Systems, Machine Learning, Statistical Inference',
          },
        ],
      },
      skills: {
        create: [
          { name: 'Python', category: 'Programming Languages', proficiency: 'Advanced', yearsOfExperience: 3 },
          { name: 'SQL', category: 'Databases', proficiency: 'Advanced', yearsOfExperience: 4 },
          { name: 'React', category: 'Frameworks', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'Data Mining', category: 'Data Science', proficiency: 'Advanced', yearsOfExperience: 2 },
          { name: 'Machine Learning', category: 'Machine Learning', proficiency: 'Intermediate', yearsOfExperience: 2 },
          { name: 'Cloud Computing', category: 'Cloud Computing', proficiency: 'Intermediate', yearsOfExperience: 1 },
        ],
      },
      projects: {
        create: [
          {
            title: 'NetGraph Career Relationship Miner',
            description:
              'Interactive career network visualization and skill co-occurrence mining platform built with Three.js and Next.js.',
            technologies: ['Next.js', 'React', 'Three.js', 'TypeScript'],
            projectUrl: 'https://net-graph.vercel.app',
            githubUrl: 'https://github.com/akshayabhi0005-web/NetGraph',
          },
          {
            title: 'Market Trend Association Miner',
            description:
              'Apriori and association rule analysis pipeline exploring skill clusters across tech job descriptions.',
            technologies: ['Python', 'Pandas', 'Scikit-Learn', 'SQL'],
          },
        ],
      },
      experiences: {
        create: [
          {
            company: 'Metrix Labs',
            jobTitle: 'Data Analytics Intern',
            employmentType: 'Internship',
            startDate: '2023-05',
            endDate: '2023-08',
            isCurrent: false,
            description:
              'Constructed automated SQL dashboards and extracted customer churn patterns with Python models.',
            technologies: ['SQL', 'Python', 'Tableau'],
          },
          {
            company: 'Computational Intelligence Lab',
            jobTitle: 'Student Data Researcher',
            employmentType: 'Part-time',
            startDate: '2023-09',
            isCurrent: true,
            description:
              'Investigating graph neural networks and skill dependency graphs for personalized curriculum recommendation.',
            technologies: ['Python', 'PyTorch', 'NetworkX'],
          },
        ],
      },
      certifications: {
        create: [
          {
            name: 'AWS Certified Cloud Practitioner',
            issuer: 'Amazon Web Services',
            issueDate: '2023-11',
            credentialUrl: 'https://aws.amazon.com/verification',
          },
          {
            name: 'Google Data Analytics Professional Certificate',
            issuer: 'Google',
            issueDate: '2023-04',
            credentialUrl: 'https://coursera.org/verify/professional-cert/google-data',
          },
        ],
      },
    },
    include: {
      profile: true,
      skills: true,
      projects: true,
      experiences: true,
      educations: true,
      certifications: true,
      settings: true,
    },
  })

  console.log(`✅ Successfully seeded demo user: ${demoUser.email} (ID: ${demoUser.id})`)
  console.log(`   - Profile: ${demoUser.profile?.name}`)
  console.log(`   - Skills: ${demoUser.skills.length} seeded`)
  console.log(`   - Projects: ${demoUser.projects.length} seeded`)
  console.log(`   - Experiences: ${demoUser.experiences.length} seeded`)
  console.log(`   - Educations: ${demoUser.educations.length} seeded`)
  console.log(`   - Certifications: ${demoUser.certifications.length} seeded`)
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
