import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UserProfile, CareerRoleMatch, ReportConfig } from '../types';

export const generateCareerReportPDF = (
  config: ReportConfig,
  profile: UserProfile,
  role: CareerRoleMatch
): jsPDF => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;

  // Colors
  const primaryColor = [79, 70, 229]; // #4F46E5
  const darkNavy = [15, 23, 42]; // #0F172A
  const slateMuted = [100, 116, 139]; // #64748B
  const lightBg = [248, 250, 252]; // #F8FAFC
  const borderGrey = [226, 232, 240];

  let currentPage = 1;

  const addHeaderFooter = (title: string) => {
    // Header
    doc.setFillColor(lightBg[0], lightBg[1], lightBg[2]);
    doc.rect(0, 0, pageWidth, 16, 'F');
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.setLineWidth(0.3);
    doc.line(0, 16, pageWidth, 16);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('NETGRAPH', margin, 11);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`|  ${title}`, margin + 22, 11);

    const dateStr = config.generatedAt || new Date().toISOString().split('T')[0];
    doc.text(dateStr, pageWidth - margin, 11, { align: 'right' });

    // Footer
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFontSize(8);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text('NETGRAPH Academic Career Intelligence Platform  •  CONFIDENTIAL', margin, pageHeight - 9);
    doc.text(`Page ${currentPage}`, pageWidth - margin, pageHeight - 9, { align: 'right' });
  };

  // --- PAGE 1: COVER PAGE ---
  if (config.sections.cover) {
    // Background gradient visual accent
    doc.setFillColor(238, 242, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Diagonal brand banner
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, pageWidth, 90, 'F');

    // Logo & System Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.text('NETGRAPH', margin, 42);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('DATA MINING & CAREER INTELLIGENCE PLATFORM', margin, 52);

    doc.setFontSize(10);
    doc.setTextColor(224, 231, 255);
    doc.text('Mining Hidden Relationships Between Skills, Technologies & Opportunities', margin, 60);

    // Report Main Title Card
    doc.setFillColor(255, 255, 255);
    doc.roundedRect(margin, 105, contentWidth, 110, 4, 4, 'F');
    doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
    doc.roundedRect(margin, 105, contentWidth, 110, 4, 4, 'S');

    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(config.title, margin + 12, 125, { maxWidth: contentWidth - 24 });

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(`Target Role Focus: ${role.title}`, margin + 12, 142);
    doc.text(`Subject: ${profile.fullName} (${profile.email})`, margin + 12, 150);
    doc.text(`Analysis ID: ${profile.lastAnalysisId || 'ANL-20261003-8839'}`, margin + 12, 158);
    doc.text(`Generated Date: ${config.generatedAt}`, margin + 12, 166);

    // Badges
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin + 12, 178, 65, 10, 2, 2, 'F');
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Overall Role Fit: ${role.alignmentPercentage}% Match`, margin + 16, 184);

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(margin + 82, 178, 55, 10, 2, 2, 'F');
    doc.setTextColor(22, 101, 52);
    doc.text(`Skills Verified: ${profile.skills.length}`, margin + 86, 184);

    // Disclaimer Box
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(
      'Notice: This document provides academic data mining alignment estimates based on supplied competencies. It does not constitute a legal credential or employment guarantee.',
      margin,
      pageHeight - 25,
      { maxWidth: contentWidth }
    );
  }

  // --- PAGE 2: EXECUTIVE SUMMARY ---
  if (config.sections.executiveSummary) {
    doc.addPage();
    currentPage++;
    addHeaderFooter('Executive Summary & Competency Audit');

    let y = 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('1. Executive Summary', margin, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    const summaryPara =
      `This report compiles relationship mining vectors derived from candidate profile records, project descriptions, and verified technical competencies. With a primary analytical focus on the ${role.title} target role, NETGRAPH identified strong foundations in programming and data systems with high alignment in core capabilities (${role.alignmentPercentage}% overall fit).`;
    doc.text(summaryPara, margin, y, { maxWidth: contentWidth, lineHeightFactor: 1.4 });

    y += 24;
    // Metric cards grid
    const cardW = (contentWidth - 6) / 4;
    const metrics = [
      { label: 'Total Skills', val: profile.skills.length.toString() },
      { label: 'Tech Stack Depth', val: `${profile.skills.filter((s) => s.type === 'technical').length} skills` },
      { label: 'Projects Analyzed', val: profile.projects.length.toString() },
      { label: 'Target Alignment', val: `${role.alignmentPercentage}%` },
    ];

    metrics.forEach((m, i) => {
      const cx = margin + i * (cardW + 2);
      doc.setFillColor(248, 250, 252);
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.roundedRect(cx, y, cardW, 22, 2, 2, 'FD');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
      doc.text(m.label, cx + 4, y + 7);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(m.val, cx + 4, y + 17);
    });

    y += 32;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Key Findings & Diagnostic Highlights', margin, y);

    y += 6;
    const findings = [
      `High affinity detected for data pipeline, graph analysis, and web engineering.`,
      `Profile currently represents ${role.matchedSkills.length} of ${role.matchedSkills.length + role.missingSkills.length} primary skills required for ${role.title}.`,
      `${role.missingSkills.length} key competency areas identified as high-value bridge opportunities (${role.missingSkills.slice(0, 3).join(', ')}).`,
      `Project portfolio exhibits solid technical diversity across ${profile.projects.map((p) => p.technologiesUsed[0]).slice(0, 4).join(', ')}.`,
    ];

    findings.forEach((finding) => {
      doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.circle(margin + 2, y + 2, 1.2, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text(finding, margin + 7, y + 3.5, { maxWidth: contentWidth - 10 });
      y += 8;
    });

    y += 10;
    // Education & Experience snapshot table
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Education & Relevant Experience', margin, y);

    y += 4;
    const eduRows = profile.education.map((e) => [e.institution, e.degree, e.fieldOfStudy, `${e.startYear}-${e.graduationYear}`, e.grade || 'N/A']);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Institution', 'Degree', 'Specialization', 'Year', 'Score']],
      body: eduRows,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], fontSize: 8.5 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  // --- PAGE 3: SKILL ANALYSIS ---
  if (config.sections.skillAnalysis) {
    doc.addPage();
    currentPage++;
    addHeaderFooter('Skill Inventory & Source Breakdown');

    let y = 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('2. Skill Inventory & Source Verification', margin, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(slateMuted[0], slateMuted[1], slateMuted[2]);
    doc.text(
      'Skills mapped from candidate submissions, verified projects, and uploaded resume parsing.',
      margin,
      y
    );

    y += 6;
    const skillRows = profile.skills.map((s) => [
      s.name,
      s.category,
      s.type.toUpperCase(),
      s.proficiency,
      s.source.toUpperCase(),
      `${s.marketDemand || 85}%`,
    ]);

    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Skill Name', 'Domain Category', 'Type', 'Proficiency', 'Source Evidence', 'Market Demand']],
      body: skillRows,
      theme: 'striped',
      headStyles: { fillColor: [67, 56, 202], fontSize: 8.5 },
      bodyStyles: { fontSize: 8 },
      alternateRowStyles: { fillColor: [248, 250, 252] },
    });
  }

  // --- PAGE 4: CAREER ALIGNMENT & SKILL GAP ---
  if (config.sections.skillGap || config.sections.careerAlignment) {
    doc.addPage();
    currentPage++;
    addHeaderFooter('Career Alignment & Skill Gap Diagnostics');

    let y = 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text(`3. Skill Gap Analysis: ${role.title}`, margin, y);

    y += 8;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    doc.setTextColor(71, 85, 105);
    doc.text(role.description, margin, y, { maxWidth: contentWidth });

    y += 18;
    // Two columns: Represented vs Missing Skills
    const colW = (contentWidth - 6) / 2;

    // Matched skills box
    doc.setFillColor(240, 253, 244);
    doc.setDrawColor(187, 247, 208);
    doc.roundedRect(margin, y, colW, 75, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(22, 101, 52);
    doc.text(`Represented Skills (${role.matchedSkills.length})`, margin + 6, y + 10);

    let my = y + 18;
    role.matchedSkills.forEach((sk) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(21, 128, 61);
      doc.text(`✓  ${sk}`, margin + 8, my);
      my += 7;
    });

    // Missing skills box
    const rx = margin + colW + 6;
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(rx, y, colW, 75, 3, 3, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(153, 27, 27);
    doc.text(`Identified Skill Gaps (${role.missingSkills.length})`, rx + 6, y + 10);

    let ry = y + 18;
    role.missingSkills.forEach((sk) => {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(185, 28, 28);
      doc.text(`○  ${sk} (Recommended for mastery)`, rx + 8, ry);
      ry += 7;
    });

    y += 85;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('Recommended Bridging Strategy', margin, y);

    y += 6;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const bridgeStr =
      `To optimize candidacy for ${role.title}, we recommend completing milestone projects in ${role.missingSkills.join(', ')} while obtaining recommended industry credentials such as ${role.recommendedCertifications.join(' or ')}.`;
    doc.text(bridgeStr, margin, y, { maxWidth: contentWidth });
  }

  // --- PAGE 5: RECOMMENDATIONS & METHODOLOGY DISCLAIMER ---
  if (config.sections.recommendations) {
    doc.addPage();
    currentPage++;
    addHeaderFooter('Recommendations & Data Mining Methodology');

    let y = 28;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(darkNavy[0], darkNavy[1], darkNavy[2]);
    doc.text('4. Strategic Action Plan & Next Steps', margin, y);

    y += 10;
    const actions = [
      {
        title: 'Priority 1: Hands-On Capstone Project',
        desc: `Implement an end-to-end repository incorporating ${role.missingSkills[0] || 'advanced frameworks'} with clean documentation and live deployment URL.`,
      },
      {
        title: 'Priority 2: Industry Certification Alignment',
        desc: `Target credential acquisition: ${role.recommendedCertifications[0] || 'Cloud & Mining Foundations'} to validate specialized proficiency.`,
      },
      {
        title: 'Priority 3: Open-Source Contributions',
        desc: 'Commit pull requests to high-visibility open-source projects in the Data Science & AI ecosystem.',
      },
    ];

    actions.forEach((a) => {
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'F');
      doc.setDrawColor(borderGrey[0], borderGrey[1], borderGrey[2]);
      doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
      doc.text(a.title, margin + 6, y + 8);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.text(a.desc, margin + 6, y + 15, { maxWidth: contentWidth - 12 });

      y += 26;
    });

    y += 12;
    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y, contentWidth, 44, 2, 2, 'F');
    doc.setDrawColor(199, 210, 254);
    doc.roundedRect(margin, y, contentWidth, 44, 2, 2, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text('Academic Data Mining Methodology & Ethical Disclaimer', margin + 6, y + 8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    const methodText =
      'NETGRAPH uses vector space modeling, graph-based community clustering, and Jaccard similarity coefficients across normalized technical skill ontologies. Match metrics are predictive alignment estimations based exclusively on submitted profile artifacts. They do not simulate live hiring committees, recruiter assessments, or guarantees of employment.';
    doc.text(methodText, margin + 6, y + 16, { maxWidth: contentWidth - 12, lineHeightFactor: 1.4 });
  }

  return doc;
};
