import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import { jsPDF } from 'jspdf';
import {
  FileCheck2,
  Download,
  Eye,
  RotateCcw,
  Sparkles,
  Layout,
  CheckCircle2,
  Plus,
  Trash2,
  Printer,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react';
import { ResumeDraft } from '../types';

export const ResumeBuilderPage: React.FC = () => {
  const { resumeDraft, updateResumeDraft, profile } = useAppData();

  const [activeStep, setActiveStep] = useState<number>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<'minimal' | 'professional' | 'modern' | 'technical'>('professional');
  const [isExporting, setIsExporting] = useState(false);

  const steps = [
    'Personal Details',
    'Summary',
    'Education',
    'Skills',
    'Experience',
    'Projects',
    'Certifications',
    'Template',
    'Preview & Download',
  ];

  const handleDownloadResumePDF = () => {
    setIsExporting(true);
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 18;
    const contentWidth = pageWidth - margin * 2;
    let y = 20;

    // Header styling based on template
    if (selectedTemplate === 'modern') {
      doc.setFillColor(79, 70, 229);
      doc.rect(0, 0, pageWidth, 28, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(255, 255, 255);
      doc.text(resumeDraft.personalDetails.fullName, margin, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(resumeDraft.personalDetails.professionalTitle, margin, 21);
      y = 36;
    } else {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.text(resumeDraft.personalDetails.fullName, margin, y);
      y += 6;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(79, 70, 229);
      doc.text(resumeDraft.personalDetails.professionalTitle, margin, y);
      y += 6;
    }

    // Contact info
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    const contactLine = `${resumeDraft.personalDetails.email}  •  ${resumeDraft.personalDetails.phone}  •  ${resumeDraft.personalDetails.location}`;
    doc.text(contactLine, margin, y);
    y += 5;
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Summary
    if (resumeDraft.summary) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('PROFESSIONAL SUMMARY', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(resumeDraft.summary, margin, y, { maxWidth: contentWidth, lineHeightFactor: 1.4 });
      y += 18;
    }

    // Skills
    if (resumeDraft.skills.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('CORE COMPETENCIES', margin, y);
      y += 5;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(51, 65, 85);
      doc.text(resumeDraft.skills.join('  •  '), margin, y, { maxWidth: contentWidth });
      y += 12;
    }

    // Projects
    if (resumeDraft.projects.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('KEY PROJECTS & REPOSITORIES', margin, y);
      y += 5;

      resumeDraft.projects.forEach((proj) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(proj.title, margin, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`Technologies: ${proj.technologiesUsed.join(', ')}`, margin, y);
        y += 4;
        doc.setFontSize(8);
        doc.setTextColor(71, 85, 105);
        doc.text(proj.description, margin, y, { maxWidth: contentWidth, lineHeightFactor: 1.3 });
        y += 10;
      });
    }

    // Education
    if (resumeDraft.education.length > 0) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('EDUCATION', margin, y);
      y += 5;

      resumeDraft.education.forEach((edu) => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(15, 23, 42);
        doc.text(`${edu.institution}  •  ${edu.degree} in ${edu.fieldOfStudy}`, margin, y);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(100, 116, 139);
        doc.text(`${edu.startYear} - ${edu.graduationYear} (Score: ${edu.grade || 'N/A'})`, pageWidth - margin, y, { align: 'right' });
        y += 8;
      });
    }

    doc.save(`Resume_${resumeDraft.personalDetails.fullName.replace(/\s+/g, '_')}_${selectedTemplate}.pdf`);
    setIsExporting(false);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-100 text-amber-800 text-xs font-semibold">
            <FileCheck2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Optional Resume Builder Tool</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Interactive Resume Builder
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Create and export an ATS-optimized, modern resume populated from your verified profile skills and academic project repositories.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveStep(9)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Live Preview</span>
          </button>
          <button
            onClick={handleDownloadResumePDF}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isExporting ? 'Exporting...' : 'Export PDF'}</span>
          </button>
        </div>
      </div>

      {/* Stepper Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 text-xs">
        {steps.map((st, i) => (
          <button
            key={i}
            onClick={() => setActiveStep(i + 1)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-all ${
              activeStep === i + 1
                ? 'bg-indigo-600 text-white shadow-xs font-bold'
                : activeStep > i + 1
                ? 'bg-indigo-50 text-indigo-700'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <span className="w-4 h-4 rounded-full text-[10px] flex items-center justify-center bg-white/20">
              {i + 1}
            </span>
            <span>{st}</span>
          </button>
        ))}
      </div>

      {/* Main Content Grid: Form (Step) on Left, Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form Area */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5 text-xs">
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 1: Personal Details</h3>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={resumeDraft.personalDetails.fullName}
                  onChange={(e) =>
                    updateResumeDraft({
                      personalDetails: { ...resumeDraft.personalDetails, fullName: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Professional Title</label>
                <input
                  type="text"
                  value={resumeDraft.personalDetails.professionalTitle}
                  onChange={(e) =>
                    updateResumeDraft({
                      personalDetails: { ...resumeDraft.personalDetails, professionalTitle: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={resumeDraft.personalDetails.email}
                    onChange={(e) =>
                      updateResumeDraft({
                        personalDetails: { ...resumeDraft.personalDetails, email: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone</label>
                  <input
                    type="text"
                    value={resumeDraft.personalDetails.phone}
                    onChange={(e) =>
                      updateResumeDraft({
                        personalDetails: { ...resumeDraft.personalDetails, phone: e.target.value },
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
                <input
                  type="text"
                  value={resumeDraft.personalDetails.location}
                  onChange={(e) =>
                    updateResumeDraft({
                      personalDetails: { ...resumeDraft.personalDetails, location: e.target.value },
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 2: Professional Summary</h3>
              <p className="text-slate-500">Provide an executive summary of your capabilities and aspirations.</p>
              <textarea
                rows={6}
                value={resumeDraft.summary}
                onChange={(e) => updateResumeDraft({ summary: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs leading-relaxed"
              />
            </div>
          )}

          {activeStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 4: Skills Selection</h3>
              <p className="text-slate-500">Select which competencies from your profile to include:</p>
              <div className="flex flex-wrap gap-1.5 max-h-60 overflow-y-auto p-2 bg-slate-50 rounded-lg border border-slate-200">
                {profile.skills.map((sk) => {
                  const isSelected = resumeDraft.skills.includes(sk.name);
                  return (
                    <button
                      key={sk.id}
                      type="button"
                      onClick={() => {
                        const updated = isSelected
                          ? resumeDraft.skills.filter((s) => s !== sk.name)
                          : [...resumeDraft.skills, sk.name];
                        updateResumeDraft({ skills: updated });
                      }}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {sk.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeStep === 8 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Step 8: Choose Resume Template</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { id: 'professional', name: 'Professional', desc: 'Clean standard layout with subtle divider rules' },
                  { id: 'modern', name: 'Modern Indigo', desc: 'Bold banner header with contemporary styling' },
                  { id: 'minimal', name: 'Minimalist ATS', desc: 'High scannability, black & white ATS-optimized' },
                  { id: 'technical', name: 'Technical Engineer', desc: 'Code repository and tech-stack centric' },
                ].map((tmpl) => (
                  <div
                    key={tmpl.id}
                    onClick={() => setSelectedTemplate(tmpl.id as any)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedTemplate === tmpl.id
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span className="font-bold text-slate-900 block">{tmpl.name}</span>
                    <span className="text-[11px] text-slate-500 mt-1 block leading-snug">{tmpl.desc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeStep !== 1 && activeStep !== 2 && activeStep !== 4 && activeStep !== 8 && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Step {activeStep}: Review Content</h3>
              <p className="text-slate-500">
                This section is automatically synchronized from your active profile ({steps[activeStep - 1]}).
              </p>
              <div className="p-3 bg-slate-50 rounded-lg text-[11px] text-slate-600">
                You can edit entries directly in the Profile tab or modify them in the live preview.
              </div>
            </div>
          )}

          {/* Stepper Bottom Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => setActiveStep(Math.max(1, activeStep - 1))}
              disabled={activeStep === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <button
              onClick={() => setActiveStep(Math.min(steps.length, activeStep + 1))}
              disabled={activeStep === steps.length}
              className="inline-flex items-center gap-1 px-4 py-1.5 rounded-lg bg-indigo-600 text-white font-semibold disabled:opacity-40"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Live Preview Area */}
        <div className="lg:col-span-6 bg-slate-100/70 p-4 rounded-2xl border border-slate-200/90 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-slate-700">A4 Document Live Preview</span>
            <span className="text-[11px] text-indigo-600 font-semibold uppercase">{selectedTemplate}</span>
          </div>

          {/* Printable Sheet Preview */}
          <div className="w-full max-w-md bg-white border border-slate-300 rounded-lg shadow-lg p-6 space-y-4 text-left text-xs min-h-[500px]">
            {/* Header */}
            {selectedTemplate === 'modern' ? (
              <div className="-m-6 mb-4 p-5 bg-indigo-600 text-white rounded-t-lg">
                <h2 className="text-base font-bold">{resumeDraft.personalDetails.fullName}</h2>
                <div className="text-[11px] text-indigo-200">{resumeDraft.personalDetails.professionalTitle}</div>
              </div>
            ) : (
              <div>
                <h2 className="text-base font-bold text-slate-900">{resumeDraft.personalDetails.fullName}</h2>
                <div className="text-[11px] font-semibold text-indigo-600">
                  {resumeDraft.personalDetails.professionalTitle}
                </div>
              </div>
            )}

            <div className="text-[10px] text-slate-400 border-b border-slate-100 pb-2">
              {resumeDraft.personalDetails.email} • {resumeDraft.personalDetails.phone} • {resumeDraft.personalDetails.location}
            </div>

            {/* Summary */}
            {resumeDraft.summary && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                  Summary
                </span>
                <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-3">
                  {resumeDraft.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {resumeDraft.skills.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                  Skills
                </span>
                <div className="flex flex-wrap gap-1">
                  {resumeDraft.skills.slice(0, 8).map((sk) => (
                    <span key={sk} className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[9px]">
                      {sk}
                    </span>
                  ))}
                  {resumeDraft.skills.length > 8 && (
                    <span className="text-[9px] text-slate-400 self-center">
                      +{resumeDraft.skills.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Projects */}
            {resumeDraft.projects.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wider block">
                  Featured Project
                </span>
                <div className="text-[11px]">
                  <strong className="text-slate-800">{resumeDraft.projects[0]?.title}</strong>
                  <p className="text-slate-500 line-clamp-2 mt-0.5 leading-snug">
                    {resumeDraft.projects[0]?.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
