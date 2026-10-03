import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

export const PublicCTA: React.FC = () => {
  return (
    <section className="py-20 bg-white relative overflow-hidden border-t border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 rounded-3xl p-10 sm:p-14 text-white shadow-2xl relative overflow-hidden border border-indigo-800/50">
          {/* Subtle Ambient Ring */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Start Your Research Journey</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-4">
            Ready to Explore Your Career Insights?
          </h2>

          <p className="text-slate-300 text-sm sm:text-base max-w-xl mx-auto mb-8 leading-relaxed">
            Create your profile to explore personalized skill analysis, career alignment, and interactive data visualizations.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold text-slate-900 bg-white hover:bg-slate-100 shadow-lg hover:shadow-xl transition-all"
            >
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 border border-indigo-500 shadow-md transition-all"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
