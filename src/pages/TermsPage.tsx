import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { FileText, AlertTriangle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-left">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Terms of Research Use</h1>
              <p className="text-xs text-slate-500">Academic Project Guidelines • NETGRAPH 2026</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-900">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Advisory & Predictive Estimation Disclaimer</span>
                <span>
                  All career match percentages, skill gap classifications, and suggested pathways are algorithmic estimations generated for academic demonstration. They do not constitute formal employment guarantees, professional recruiter endorsements, or certifications of qualification.
                </span>
              </div>
            </div>

            <h2 className="text-base font-bold text-slate-900">1. Intellectual Property & Citation</h2>
            <p>
              NETGRAPH and its associated 3D graph algorithms and architecture are developed for academic capstone and data mining evaluation. Source artifacts and models may be cited with appropriate academic attribution.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. Permitted Testing Scenarios</h2>
            <p>
              Users are encouraged to interactively test profile modification, mock skill analysis, 3D network rotations, report generation, and the optional resume builder to explore how graph analytics can illuminate career pathways.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
