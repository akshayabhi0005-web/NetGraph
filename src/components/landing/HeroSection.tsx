import React from 'react';
import { Link } from 'react-router-dom';
import { HeroGraph3D } from '../graph/HeroGraph3D';
import { ArrowRight, Sparkles, Compass, ShieldCheck } from 'lucide-react';

export const HeroSection: React.FC = () => {
  const scrollToFeatures = () => {
    const el = document.getElementById('features');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="top" className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-100/60 via-blue-50/40 to-transparent rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Heading and CTAs */}
          <div className="lg:col-span-6 space-y-6 text-left">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Academic Data Mining & Career Intelligence Platform</span>
            </div>

            {/* Exact Heading from Reference Video */}
            <h1 className="text-4xl sm:text-5xl lg:text-[3.25rem] font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Discover Your Career Potential with{' '}
              <span className="bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-800 bg-clip-text text-transparent">
                Data Mining
              </span>
            </h1>

            {/* Supporting Text matching Reference */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              NETGRAPH analyzes skills, technologies, and GitHub projects to uncover meaningful relationships, identify skill gaps, and help you explore potential career pathways.
            </p>

            {/* CTA Buttons matching Reference Video */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={scrollToFeatures}
                className="px-6 py-3 rounded-xl text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 shadow-md shadow-slate-900/15 hover:shadow-lg transition-all cursor-pointer"
              >
                Explore Features
              </button>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 hover:shadow-lg hover:shadow-indigo-600/35 transition-all"
              >
                <span>Get Started</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Micro reassurance note */}
            <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Explore the platform freely without mandatory sign-in or paywalls.</span>
            </div>
          </div>

          {/* Right Column: Interactive 3D Network Graph */}
          <div className="lg:col-span-6 w-full">
            <HeroGraph3D />
          </div>
        </div>
      </div>
    </section>
  );
};
