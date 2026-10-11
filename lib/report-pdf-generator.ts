/**
 * NETGRAPH Authentic PDF Report Generator
 * Builds high-fidelity, multi-page vector PDFs using standard jsPDF.
 * Output is fully compliant with standard PDF viewers (Acrobat, Chrome, Preview).
 */

import { jsPDF } from 'jspdf'
import { CareerIntelligenceReport } from './report-types'
import { getReportPdfFilename } from './report-generator'

const COLOR_PRIMARY: [number, number, number] = [79, 70, 229] // Indigo #4f46e5
const COLOR_DARK: [number, number, number] = [30, 41, 59] // Slate-800 #1e293b
const COLOR_MUTED: [number, number, number] = [100, 116, 139] // Slate-500 #64748b
const COLOR_BORDER: [number, number, number] = [226, 232, 240] // Slate-200 #e2e8f0
const COLOR_BG_LIGHT: [number, number, number] = [248, 250, 252] // Slate-50 #f8fafc
const COLOR_EMERALD: [number, number, number] = [16, 185, 129] // Emerald-500 #10b981
const COLOR_ROSE: [number, number, number] = [225, 29, 72] // Rose-600 #e11d48
const COLOR_ROSE_BG: [number, number, number] = [254, 242, 242]
const COLOR_ROSE_BORDER: [number, number, number] = [254, 202, 202]

export function createReportPdfDocument(report: CareerIntelligenceReport): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true,
  })

  const pageWidth = 210
  const pageHeight = 297
  const marginX = 16
  const contentWidth = pageWidth - marginX * 2
  let cursorY = 18

  // Helper for page break
  function checkPageBreak(neededHeight: number): boolean {
    if (cursorY + neededHeight > pageHeight - 20) {
      doc.addPage()
      cursorY = 22
      drawRunningHeader()
      return true
    }
    return false
  }

  function drawRunningHeader() {
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('NETGRAPH — Career Intelligence & Relationship Mining Report', marginX, 12)
    doc.text(report.metadata.dateFormatted, pageWidth - marginX, 12, { align: 'right' })
    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.3)
    doc.line(marginX, 15, pageWidth - marginX, 15)
  }

  function drawSectionHeader(title: string, subtitle?: string) {
    checkPageBreak(subtitle ? 24 : 18)
    cursorY += 4

    // Section bar indicator
    doc.setFillColor(...COLOR_PRIMARY)
    doc.rect(marginX, cursorY - 3.8, 3, 5, 'F')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(12)
    doc.setTextColor(...COLOR_DARK)
    doc.text(title, marginX + 6, cursorY)

    cursorY += 2
    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.2)
    doc.line(marginX, cursorY, pageWidth - marginX, cursorY)
    cursorY += 4

    if (subtitle) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_MUTED)
      const subLines = doc.splitTextToSize(subtitle, contentWidth)
      doc.text(subLines, marginX, cursorY)
      cursorY += subLines.length * 4 + 2
    }
  }

  // ==========================================
  // 1. COVER / HEADER BANNER
  // ==========================================
  doc.setFillColor(...COLOR_PRIMARY)
  doc.roundedRect(marginX, cursorY, contentWidth, 38, 3, 3, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(255, 255, 255)
  doc.text('NETGRAPH', marginX + 8, cursorY + 12)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(224, 231, 255)
  doc.text('Career Intelligence & Relationship Mining Report', marginX + 8, cursorY + 18)

  doc.setFontSize(8)
  doc.setTextColor(199, 210, 254)
  doc.text(`Report ID: ${report.metadata.reportId}`, marginX + 8, cursorY + 28)
  doc.text(`Generated: ${report.metadata.dateFormatted}`, marginX + 8, cursorY + 33)

  // Candidate Badge card inside banner
  const rightBadgeX = pageWidth - marginX - 60
  doc.setFillColor(255, 255, 255)
  doc.roundedRect(rightBadgeX, cursorY + 6, 54, 26, 2, 2, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...COLOR_DARK)
  const nameText = doc.splitTextToSize(report.metadata.userName, 48)[0] || 'Candidate'
  doc.text(nameText, rightBadgeX + 5, cursorY + 13)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLOR_MUTED)
  doc.text(
    `Completeness: ${report.metadata.profileCompletenessScore}%`,
    rightBadgeX + 5,
    cursorY + 19
  )
  doc.text(
    `Data Confidence: ${report.metadata.confidenceLevel.toUpperCase()}`,
    rightBadgeX + 5,
    cursorY + 24
  )

  cursorY += 46

  // ==========================================
  // 2. PROFESSIONAL PROFILE SECTION
  // ==========================================
  drawSectionHeader(
    '1. Professional Profile',
    'Current experience, projects, education, and credentials extracted from your verified profile.'
  )

  // Headline & Summary Box
  if (report.profile.headline || report.profile.summary) {
    checkPageBreak(24)
    doc.setFillColor(...COLOR_BG_LIGHT)
    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.3)
    doc.roundedRect(marginX, cursorY, contentWidth, 20, 2, 2, 'FD')

    let boxY = cursorY + 5
    if (report.profile.headline) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...COLOR_DARK)
      doc.text(report.profile.headline, marginX + 5, boxY)
      boxY += 5
    }

    if (report.profile.summary) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...COLOR_MUTED)
      const sumLines = doc.splitTextToSize(report.profile.summary, contentWidth - 10)
      doc.text(sumLines.slice(0, 2), marginX + 5, boxY)
    }

    cursorY += 24
  }

  // Location & Contact Details
  const contactDetails = [
    report.profile.location ? `Location: ${report.profile.location}` : null,
    report.metadata.userEmail ? `Email: ${report.metadata.userEmail}` : null,
    report.profile.linkedinUrl ? `LinkedIn: ${report.profile.linkedinUrl}` : null,
    report.profile.githubUrl ? `GitHub: ${report.profile.githubUrl}` : null,
  ].filter(Boolean) as string[]

  if (contactDetails.length > 0) {
    checkPageBreak(10)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(contactDetails.join('  •  '), marginX, cursorY)
    cursorY += 6
  }

  // Work Experience Sub-block
  if (report.profile.experience && report.profile.experience.length > 0) {
    checkPageBreak(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text('Work Experience', marginX, cursorY)
    cursorY += 4

    for (const exp of report.profile.experience) {
      checkPageBreak(14)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_DARK)
      doc.text(`${exp.jobTitle} — ${exp.company}`, marginX + 2, cursorY)

      const durationStr = `${exp.startDate} - ${exp.isCurrent ? 'Present' : exp.endDate || 'Present'}`
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...COLOR_MUTED)
      doc.text(durationStr, pageWidth - marginX, cursorY, { align: 'right' })
      cursorY += 3.5

      if (exp.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...COLOR_MUTED)
        const expLines = doc.splitTextToSize(exp.description, contentWidth - 4)
        doc.text(expLines.slice(0, 2), marginX + 2, cursorY)
        cursorY += expLines.slice(0, 2).length * 3.5 + 2
      }
    }
  }

  // Projects Sub-block
  if (report.profile.projects && report.profile.projects.length > 0) {
    checkPageBreak(15)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text('Projects & Technical Implementations', marginX, cursorY)
    cursorY += 4

    for (const proj of report.profile.projects) {
      checkPageBreak(14)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_DARK)
      doc.text(proj.title, marginX + 2, cursorY)
      cursorY += 3.5

      if (proj.description) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...COLOR_MUTED)
        const projLines = doc.splitTextToSize(proj.description, contentWidth - 4)
        doc.text(projLines.slice(0, 2), marginX + 2, cursorY)
        cursorY += projLines.slice(0, 2).length * 3.5
      }

      if (proj.technologies && proj.technologies.length > 0) {
        doc.setFont('helvetica', 'italic')
        doc.setFontSize(7)
        doc.setTextColor(...COLOR_PRIMARY)
        doc.text(`Technologies: ${proj.technologies.join(', ')}`, marginX + 2, cursorY)
        cursorY += 4
      }
      cursorY += 1
    }
  }

  // Education & Certifications
  if (report.profile.education.length > 0 || report.profile.certifications.length > 0) {
    checkPageBreak(18)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(9)
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text('Education & Certifications', marginX, cursorY)
    cursorY += 4

    for (const edu of report.profile.education) {
      checkPageBreak(8)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...COLOR_DARK)
      const eduTitle = `${edu.degree || 'Degree'} in ${edu.fieldOfStudy || 'Field'} — ${edu.institution}`
      doc.text(eduTitle, marginX + 2, cursorY)
      if (edu.graduationYear) {
        doc.setFont('helvetica', 'normal')
        doc.setFontSize(7.5)
        doc.setTextColor(...COLOR_MUTED)
        doc.text(String(edu.graduationYear), pageWidth - marginX, cursorY, { align: 'right' })
      }
      cursorY += 4
    }

    for (const cert of report.profile.certifications) {
      checkPageBreak(8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...COLOR_DARK)
      doc.text(`• Certification: ${cert.name} (${cert.issuer || 'Verified'})`, marginX + 2, cursorY)
      cursorY += 4
    }
  }

  cursorY += 3

  // ==========================================
  // 3. TECHNICAL SKILLS SECTION
  // ==========================================
  drawSectionHeader(
    '2. Technical Skills Inventory',
    `Identified ${report.skills.totalSkills} skills categorized by domain and reported proficiency.`
  )

  if (report.skills.totalSkills === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('No technical skills have been added to your profile yet.', marginX, cursorY)
    cursorY += 8
  } else {
    for (const [category, skills] of Object.entries(report.skills.skillsByCategory)) {
      checkPageBreak(14)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...COLOR_PRIMARY)
      doc.text(`${category} (${skills.length})`, marginX, cursorY)
      cursorY += 3.5

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...COLOR_DARK)
      const skillNames = skills.map((s) => `${s.normalisedName} [${s.proficiency}]`).join(', ')
      const skillLines = doc.splitTextToSize(skillNames, contentWidth - 4)
      doc.text(skillLines, marginX + 2, cursorY)
      cursorY += skillLines.length * 3.5 + 3
    }
  }

  cursorY += 2

  // ==========================================
  // 4. CAREER MATCH ANALYSIS SECTION
  // ==========================================
  drawSectionHeader(
    '3. Career Role Match Analysis',
    'Weighted coverage analysis comparing your skills against standard industry target role benchmarks.'
  )

  if (report.careerMatches.topMatches.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('Insufficient skill data to compute career matches.', marginX, cursorY)
    cursorY += 8
  } else {
    for (const match of report.careerMatches.topMatches) {
      checkPageBreak(28)

      // Role Card Box
      doc.setFillColor(...COLOR_BG_LIGHT)
      doc.setDrawColor(...COLOR_BORDER)
      doc.setLineWidth(0.2)
      doc.roundedRect(marginX, cursorY, contentWidth, 23, 2, 2, 'FD')

      // Role Title & Category
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(9.5)
      doc.setTextColor(...COLOR_DARK)
      doc.text(match.roleTitle, marginX + 5, cursorY + 6)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...COLOR_MUTED)
      doc.text(`Category: ${match.category}`, marginX + 5, cursorY + 10)

      // Match Score Badge
      const isHigh = match.matchScore >= 70
      doc.setFillColor(...(isHigh ? COLOR_EMERALD : COLOR_PRIMARY))
      doc.roundedRect(pageWidth - marginX - 28, cursorY + 4, 23, 7, 1.5, 1.5, 'F')
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(255, 255, 255)
      doc.text(`${match.matchScore}% Match`, pageWidth - marginX - 16.5, cursorY + 8.8, {
        align: 'center',
      })

      // Matched & Missing Skills Text
      const matchedNames = match.matchedSkills.map((s) => s.name).join(', ') || 'None'
      const missingNames =
        match.missingRequiredSkills.map((s) => s.name).join(', ') || 'None critical'

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(7.5)
      doc.setTextColor(...COLOR_EMERALD)
      doc.text(`Covered Skills: `, marginX + 5, cursorY + 15)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLOR_DARK)
      const coveredText = doc.splitTextToSize(matchedNames, contentWidth - 40)[0] || ''
      doc.text(coveredText, marginX + 28, cursorY + 15)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLOR_ROSE)
      doc.text(`Missing Skills: `, marginX + 5, cursorY + 19.5)
      doc.setFont('helvetica', 'normal')
      doc.setTextColor(...COLOR_DARK)
      const missingText = doc.splitTextToSize(missingNames, contentWidth - 40)[0] || ''
      doc.text(missingText, marginX + 28, cursorY + 19.5)

      cursorY += 26
    }
  }

  cursorY += 2

  // ==========================================
  // 5. SKILL GAP ANALYSIS
  // ==========================================
  drawSectionHeader(
    '4. Skill Gap Analysis & Learning Priorities',
    'High and medium priority capabilities identified to bridge the distance to target positions.'
  )

  if (report.skillGaps.gaps.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text('No skill gaps identified based on current profile coverage.', marginX, cursorY)
    cursorY += 8
  } else {
    for (const gap of report.skillGaps.gaps.slice(0, 8)) {
      checkPageBreak(12)

      const isHigh = gap.priority === 'high'
      doc.setFillColor(...(isHigh ? COLOR_ROSE_BG : COLOR_BG_LIGHT))
      doc.setDrawColor(...(isHigh ? COLOR_ROSE_BORDER : COLOR_BORDER))
      doc.setLineWidth(0.2)
      doc.roundedRect(marginX, cursorY, contentWidth, 10, 1.5, 1.5, 'FD')

      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8)
      doc.setTextColor(...(isHigh ? COLOR_ROSE : COLOR_DARK))
      doc.text(`[${gap.priority.toUpperCase()}] ${gap.skillName}`, marginX + 4, cursorY + 4.5)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...COLOR_MUTED)
      doc.text(`Target Role: ${gap.targetRole}`, marginX + 55, cursorY + 4.5)

      const reasonShort = doc.splitTextToSize(gap.reason || gap.suggestedAction, 100)[0] || ''
      doc.text(reasonShort, marginX + 4, cursorY + 8)

      cursorY += 12
    }
  }

  cursorY += 2

  // ==========================================
  // 6. SKILL RELATIONSHIPS (ASSOCIATION RULES)
  // ==========================================
  drawSectionHeader(
    '5. Data-Mined Skill Relationships',
    'Pattern-mining co-occurrences discovered across projects and work experiences.'
  )

  if (report.relationships.rules.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(8.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(
      'No association rules mined. Add more projects and experiences to identify relational patterns.',
      marginX,
      cursorY
    )
    cursorY += 8
  } else {
    // Table Header
    checkPageBreak(16)
    doc.setFillColor(...COLOR_BG_LIGHT)
    doc.rect(marginX, cursorY, contentWidth, 6, 'F')
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_DARK)
    doc.text('Discovered Rule (Antecedent -> Consequent)', marginX + 4, cursorY + 4.2)
    doc.text('Support', marginX + 115, cursorY + 4.2)
    doc.text('Confidence', marginX + 135, cursorY + 4.2)
    doc.text('Lift', marginX + 160, cursorY + 4.2)
    cursorY += 6.5

    for (const rule of report.relationships.rules) {
      checkPageBreak(8)
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(7.5)
      doc.setTextColor(...COLOR_DARK)

      const ruleText = `${rule.antecedent.join(', ')}  →  ${rule.consequent.join(', ')}`
      doc.text(ruleText, marginX + 4, cursorY + 3.5)

      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...COLOR_MUTED)
      doc.text(`${Math.round(rule.support * 100)}%`, marginX + 115, cursorY + 3.5)
      doc.text(`${Math.round(rule.confidence * 100)}%`, marginX + 135, cursorY + 3.5)
      doc.text(`${rule.lift.toFixed(1)}x`, marginX + 160, cursorY + 3.5)

      doc.setDrawColor(...COLOR_BORDER)
      doc.setLineWidth(0.15)
      doc.line(marginX, cursorY + 5, pageWidth - marginX, cursorY + 5)
      cursorY += 6.5
    }
  }

  cursorY += 2

  // ==========================================
  // 7. ANALYTICS & SUMMARY METRICS
  // ==========================================
  drawSectionHeader(
    '6. Analytics Summary',
    'Verified counts and distribution across your career portfolio sources.'
  )

  checkPageBreak(18)
  const metricBoxWidth = (contentWidth - 6) / 4
  const metricItems = [
    { label: 'Total Skills', value: report.analytics.totalSkills },
    { label: 'Portfolio Transactions', value: report.analytics.totalTransactions },
    { label: 'Verified Projects', value: report.analytics.totalProjects },
    { label: 'Roles Evaluated', value: report.careerMatches.totalMatchesEvaluated },
  ]

  metricItems.forEach((m, idx) => {
    const boxX = marginX + idx * (metricBoxWidth + 2)
    doc.setFillColor(...COLOR_BG_LIGHT)
    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.2)
    doc.roundedRect(boxX, cursorY, metricBoxWidth, 14, 1.5, 1.5, 'FD')

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(11)
    doc.setTextColor(...COLOR_PRIMARY)
    doc.text(String(m.value), boxX + metricBoxWidth / 2, cursorY + 6.5, { align: 'center' })

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(6.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(m.label, boxX + metricBoxWidth / 2, cursorY + 11, { align: 'center' })
  })

  cursorY += 19

  // Category Distribution
  if (report.analytics.categoryDistribution.length > 0) {
    checkPageBreak(14)
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(...COLOR_DARK)
    doc.text('Skill Category Distribution:', marginX, cursorY)
    cursorY += 3.5

    const distStrings = report.analytics.categoryDistribution
      .map((c) => `${c.category}: ${c.count} (${c.percentage}%)`)
      .join('  •  ')
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    const distLines = doc.splitTextToSize(distStrings, contentWidth)
    doc.text(distLines, marginX, cursorY)
    cursorY += distLines.length * 3.5 + 4
  }

  // ==========================================
  // 8. DATA LIMITATIONS & METHODOLOGY
  // ==========================================
  drawSectionHeader(
    '7. Data Limitations & Methodology',
    'Transparent disclosure of heuristics and dataset constraints.'
  )

  checkPageBreak(24)
  doc.setFillColor(...COLOR_BG_LIGHT)
  doc.setDrawColor(...COLOR_BORDER)
  doc.setLineWidth(0.2)
  doc.roundedRect(marginX, cursorY, contentWidth, 22, 2, 2, 'FD')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...COLOR_DARK)
  doc.text('Methodology Notice:', marginX + 4, cursorY + 5)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...COLOR_MUTED)
  const methodologyText =
    'This report is generated by the NETGRAPH data-mining prototype using transparent co-occurrence counting, support/confidence association rules, and weighted requirement coverage. It is an exploratory decision aid and does not constitute a guaranteed commercial employment prediction.'
  const methodLines = doc.splitTextToSize(methodologyText, contentWidth - 8)
  doc.text(methodLines, marginX + 4, cursorY + 9)

  if (report.limitations.warnings.length > 0) {
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(...COLOR_ROSE)
    doc.text(`Quality Warnings: ${report.limitations.warnings.join(' ')}`, marginX + 4, cursorY + 18)
  }

  // ==========================================
  // FINAL PASS: PAGE NUMBERS & FOOTERS
  // ==========================================
  const totalPages = doc.getNumberOfPages()
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p)

    // Footer divider line
    doc.setDrawColor(...COLOR_BORDER)
    doc.setLineWidth(0.2)
    doc.line(marginX, pageHeight - 12, pageWidth - marginX, pageHeight - 12)

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor(...COLOR_MUTED)
    doc.text(
      'NETGRAPH • Academic Data Mining & Career Intelligence Platform',
      marginX,
      pageHeight - 8
    )
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - marginX, pageHeight - 8, {
      align: 'right',
    })
  }

  return doc
}

/**
 * Returns binary ArrayBuffer representation of the PDF
 */
export function generateReportPdfBuffer(report: CareerIntelligenceReport): Uint8Array {
  const doc = createReportPdfDocument(report)
  return new Uint8Array(doc.output('arraybuffer'))
}

/**
 * Returns a standard Blob suitable for download or preview
 */
export function generateReportPdfBlob(report: CareerIntelligenceReport): Blob {
  const doc = createReportPdfDocument(report)
  return doc.output('blob')
}

/**
 * Client-side utility that automatically triggers a download of the report PDF
 */
export function downloadReportPdf(
  report: CareerIntelligenceReport,
  customFilename?: string
): void {
  const filename = customFilename || getReportPdfFilename(report.metadata.generatedAt)
  const doc = createReportPdfDocument(report)
  doc.save(filename)
}
