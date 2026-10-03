import React, { useState } from 'react';
import { useAppData } from '../context/AppDataContext';
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  Search,
  Filter,
  X,
  FileCheck,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { ReportConfig, ReportType } from '../types';
import { generateCareerReportPDF } from '../utils/pdfGenerator';

export const ReportsPage: React.FC = () => {
  const { profile, careerRoles, selectedRole, reports, addReport, deleteReport } = useAppData();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState('All');

  // Generator Modal State
  const [showGeneratorModal, setShowGeneratorModal] = useState(false);
  const [reportTitle, setReportTitle] = useState('Comprehensive Career Intelligence Report');
  const [reportType, setReportType] = useState<ReportType>('complete');
  const [selectedRoleTitle, setSelectedRoleTitle] = useState(selectedRole.title);
  const [sections, setSections] = useState({
    cover: true,
    executiveSummary: true,
    profileOverview: true,
    skillAnalysis: true,
    careerAlignment: true,
    skillGap: true,
    analytics: true,
    graphInsights: true,
    careerPathways: true,
    recommendations: true,
    resumeSummary: true,
  });

  // Preview Modal State
  const [previewReport, setPreviewReport] = useState<ReportConfig | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const filteredReports = reports.filter((rep) => {
    const matchesSearch =
      rep.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rep.selectedRole.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedTypeFilter === 'All' || rep.type === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();

    const matchedRole =
      careerRoles.find((r) => r.title === selectedRoleTitle) || selectedRole;

    const newReport: ReportConfig = {
      id: `REP-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(
        100 + Math.random() * 900
      )}`,
      title: reportTitle,
      type: reportType,
      generatedAt: new Date().toLocaleString(),
      userName: profile.fullName,
      selectedRole: matchedRole.title,
      sections,
      metricsSnapshot: {
        totalSkills: profile.skills.length,
        techSkillsCount: profile.skills.filter((s) => s.type === 'technical').length,
        projectsCount: profile.projects.length,
        careerMatchesCount: careerRoles.length,
        overallCoverage: matchedRole.alignmentPercentage,
        topRole: matchedRole.title,
      },
    };

    addReport(newReport);
    setShowGeneratorModal(false);
    setPreviewReport(newReport);
  };

  const handleDownloadPDF = (reportToDownload: ReportConfig) => {
    setIsDownloading(true);
    const matchedRole =
      careerRoles.find((r) => r.title === reportToDownload.selectedRole) || selectedRole;

    setTimeout(() => {
      const doc = generateCareerReportPDF(reportToDownload, profile, matchedRole);
      const safeName = `NETGRAPH_Career_Analysis_${profile.fullName.replace(/\s+/g, '_')}_${reportToDownload.id}.pdf`;
      doc.save(safeName);
      setIsDownloading(false);
    }, 500);
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            <FileText className="w-3.5 h-3.5 text-indigo-600" />
            <span>A4 Document Engine & Analysis History</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Career Reports & Diagnostics
          </h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Generate printable, high-fidelity A4 PDF documents compiling executive summaries, skill taxonomy tables, skill gap matrices, and recommended learning pathways.
          </p>
        </div>

        <button
          onClick={() => setShowGeneratorModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Generate New Report</span>
        </button>
      </div>

      {/* Report History Table with Search & Filter */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Generated Reports History</h3>
            <p className="text-xs text-slate-500">Historical snapshots linked to your research profile</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search reports..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>

            <select
              value={selectedTypeFilter}
              onChange={(e) => setSelectedTypeFilter(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700"
            >
              <option value="All">All Report Types</option>
              <option value="complete">Complete Analysis</option>
              <option value="skill-gap">Skill Gap Only</option>
              <option value="skill-analysis">Skill Inventory Only</option>
            </select>
          </div>
        </div>

        {filteredReports.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/60 p-3 rounded-xl transition-colors text-xs"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{report.title}</span>
                    <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-semibold uppercase">
                      {report.type}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-slate-500 text-[11px]">
                    <span className="font-mono text-slate-400">{report.id}</span>
                    <span>•</span>
                    <span>Target Role: <strong className="text-slate-700">{report.selectedRole}</strong></span>
                    <span>•</span>
                    <span>Date: {report.generatedAt}</span>
                    <span>•</span>
                    <span className="text-emerald-600 font-semibold">{report.metricsSnapshot.overallCoverage}% Match</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewReport(report)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Preview</span>
                  </button>
                  <button
                    onClick={() => handleDownloadPDF(report)}
                    disabled={isDownloading}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-70"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    onClick={() => deleteReport(report.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                    title="Delete report"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs">
            <FileText className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p>No reports match your current filter.</p>
          </div>
        )}
      </div>

      {/* REPORT GENERATION CONFIGURATION MODAL (Section 18.2) */}
      {showGeneratorModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 sm:p-8 text-left space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Configure Career Analysis Report</h3>
                <p className="text-xs text-slate-500">Select document sections and focus parameters</p>
              </div>
              <button
                onClick={() => setShowGeneratorModal(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Report Document Title</label>
                <input
                  type="text"
                  required
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Report Focus Type</label>
                  <select
                    value={reportType}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="complete">Complete Career Analysis (Comprehensive)</option>
                    <option value="skill-analysis">Skill Analysis & Inventory Only</option>
                    <option value="career-alignment">Career Role Alignment Report</option>
                    <option value="skill-gap">Skill Gap Diagnostics Report</option>
                    <option value="analytics-summary">Analytics & Visual Charts Summary</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target Career Role</label>
                  <select
                    value={selectedRoleTitle}
                    onChange={(e) => setSelectedRoleTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    {careerRoles.map((r) => (
                      <option key={r.id} value={r.title}>
                        {r.title} ({r.alignmentPercentage}% match)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Sections Checklist */}
              <div>
                <label className="block font-semibold text-slate-700 mb-2">
                  Sections to Include in Exported A4 PDF:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  {Object.keys(sections).map((secKey) => (
                    <label key={secKey} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-700">
                      <input
                        type="checkbox"
                        checked={(sections as any)[secKey]}
                        onChange={(e) =>
                          setSections((prev) => ({ ...prev, [secKey]: e.target.checked }))
                        }
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <span className="capitalize">{secKey.replace(/([A-Z])/g, ' $1')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowGeneratorModal(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs"
                >
                  Generate & Preview
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REPORT PREVIEW MODAL (Section 18.5) */}
      {previewReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-3xl w-full p-6 sm:p-8 text-left space-y-6 animate-in fade-in zoom-in-95 max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
                  A4 Print Preview • {previewReport.id}
                </span>
                <h3 className="text-lg font-bold text-slate-900">{previewReport.title}</h3>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Preview Canvas */}
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50 space-y-5 text-xs shadow-inner">
              <div className="p-4 bg-white rounded-lg border border-slate-200 shadow-xs space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-indigo-600 uppercase text-xs">NETGRAPH Academic Intelligence</span>
                  <span className="text-[11px] text-slate-400 font-mono">{previewReport.generatedAt}</span>
                </div>
                <h4 className="text-base font-bold text-slate-900">{previewReport.title}</h4>
                <div className="text-[11px] text-slate-600">
                  Candidate: <strong>{previewReport.userName}</strong> • Target Role: <strong>{previewReport.selectedRole}</strong>
                </div>
              </div>

              {/* Metrics preview row */}
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Total Skills</span>
                  <span className="font-extrabold text-sm text-slate-800">{previewReport.metricsSnapshot.totalSkills}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Tech Depth</span>
                  <span className="font-extrabold text-sm text-indigo-600">{previewReport.metricsSnapshot.techSkillsCount}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Projects</span>
                  <span className="font-extrabold text-sm text-slate-800">{previewReport.metricsSnapshot.projectsCount}</span>
                </div>
                <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                  <span className="text-[10px] text-slate-400 block">Role Fit</span>
                  <span className="font-extrabold text-sm text-emerald-600">{previewReport.metricsSnapshot.overallCoverage}%</span>
                </div>
              </div>

              {/* Included Sections Tag List */}
              <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5">
                <span className="font-semibold text-slate-700 block text-[11px]">Selected Sections in PDF:</span>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(previewReport.sections)
                    .filter(([_, included]) => included)
                    .map(([sec]) => (
                      <span key={sec} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 text-[10px] font-medium capitalize">
                        ✓ {sec.replace(/([A-Z])/g, ' $1')}
                      </span>
                    ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                PDF engine ready • Multi-page A4 format
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewReport(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs"
                >
                  Close Preview
                </button>
                <button
                  onClick={() => handleDownloadPDF(previewReport)}
                  disabled={isDownloading}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-70"
                >
                  <Download className="w-4 h-4" />
                  <span>{isDownloading ? 'Generating PDF...' : 'Download PDF Now'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
