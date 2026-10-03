import React from 'react';
import { Database, Network, ShieldCheck, GraduationCap } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-20 bg-slate-50/60 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Academic Story */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
              Academic Research Context
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              Bridging Career Pathways Through Graph-Theoretic Data Mining
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              NETGRAPH was designed as an academic data mining project to address fragmentation in computer science career transitions. By treating technical proficiencies, open-source repositories, and job taxonomies as a multi-relational knowledge graph, the platform discovers latent associations that traditional keyword-matching resumes overlook.
            </p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Our graph traversal and association algorithms identify not just the skills a candidate possesses, but the most efficient bridge nodes necessary to unlock their next career milestone.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <GraduationCap className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Academic Integrity</h4>
                <p className="text-xs text-slate-500 mt-1">Formulated on peer-reviewed association rule and graph clustering frameworks.</p>
              </div>
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="text-sm font-bold text-slate-900">Ethical Transparency</h4>
                <p className="text-xs text-slate-500 mt-1">Predictive alignment estimates are clearly labeled as advisory guides, not hiring guarantees.</p>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Architecture Blueprint */}
          <div className="lg:col-span-6">
            <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-900">System Architecture Overview</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  Client Phase 1.0
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-indigo-50/50 border border-indigo-100">
                  <div className="font-semibold text-indigo-900 mb-0.5">1. Ingestion & Entity Resolution</div>
                  <div className="text-indigo-700/80">User profiles, repository metadata, and optional resume text are normalized into standardized competency entities.</div>
                </div>

                <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-100">
                  <div className="font-semibold text-blue-900 mb-0.5">2. Knowledge Graph Modeling</div>
                  <div className="text-blue-700/80">Multi-relational graph schema with explicit edges for <code className="text-indigo-800">REQUIRES_SKILL</code> and data mining inferred associations.</div>
                </div>

                <div className="p-3 rounded-lg bg-emerald-50/50 border border-emerald-100">
                  <div className="font-semibold text-emerald-900 mb-0.5">3. Diagnostic Reporting & Roadmaps</div>
                  <div className="text-emerald-700/80">Real-time gap computation, printable A4 PDF reporting, and step-by-step career path milestone navigation.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
