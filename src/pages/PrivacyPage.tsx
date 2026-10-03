import React from 'react';
import { Navbar } from '../components/common/Navbar';
import { Footer } from '../components/common/Footer';
import { ShieldCheck, Lock, EyeOff } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20 text-left">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-8 sm:p-12 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Privacy & Research Data Governance</h1>
              <p className="text-xs text-slate-500">Last updated: October 2026 • Academic Demonstration Phase</p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
            <h2 className="text-base font-bold text-slate-900">1. Client-Side Data Isolation</h2>
            <p>
              In this development phase, all profile attributes, skill selections, resume text entries, and report configurations remain isolated within your browser's local sandbox and state. No private files or identifiers are transmitted to external ad trackers or undisclosed server endpoints.
            </p>

            <h2 className="text-base font-bold text-slate-900">2. External Profiles & Authorized Scopes</h2>
            <p>
              Any links provided to GitHub, LinkedIn, LeetCode, or personal portfolios are strictly referenced for mock evaluation demonstration. NETGRAPH does not perform unauthorized automated scraping against third-party access barriers or private authentication layers.
            </p>

            <h2 className="text-base font-bold text-slate-900">3. Non-Commercial Academic Use</h2>
            <p>
              This software was conceived as an academic Computer Science research platform exploring knowledge graphs, association rule mining, and career ontologies. No biometric, commercial, or credit data is collected or requested.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
