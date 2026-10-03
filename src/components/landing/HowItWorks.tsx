import React from 'react';
import { UserPlus, FileUp, Sparkles, Network, BarChart2, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: 'Step 1',
      title: 'Skill Analysis',
      subtitle: 'Create profile & skills',
      description: 'Add personal background, education, and technical skills.',
      icon: <UserPlus className="w-5 h-5 text-indigo-600" />,
      color: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    },
    {
      number: 'Step 2',
      title: 'Resume Upload',
      subtitle: 'Extract skills automatically',
      description: 'Optionally upload your resume or link GitHub & LinkedIn.',
      icon: <FileUp className="w-5 h-5 text-blue-600" />,
      color: 'bg-blue-50 border-blue-200 text-blue-700',
    },
    {
      number: 'Step 3',
      title: 'Career Recommendations',
      subtitle: 'Algorithm matching',
      description: 'Mining algorithms match your competencies to evolving roles.',
      icon: <Sparkles className="w-5 h-5 text-purple-600" />,
      color: 'bg-purple-50 border-purple-200 text-purple-700',
    },
    {
      number: 'Step 4',
      title: 'Explore Relationships',
      subtitle: 'Interactive 3D graph',
      description: 'Uncover latent links between skills, tech, and opportunities.',
      icon: <Network className="w-5 h-5 text-teal-600" />,
      color: 'bg-teal-50 border-teal-200 text-teal-700',
    },
    {
      number: 'Step 5',
      title: 'Matching Analytics',
      subtitle: 'Gaps & PDF reports',
      description: 'Review diagnostics, bridge skill gaps, and export PDF reports.',
      icon: <BarChart2 className="w-5 h-5 text-emerald-600" />,
      color: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading matching reference video */}
        <div className="max-w-3xl mx-auto space-y-3 mb-16">
          <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Methodology Flow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How NETGRAPH Works
          </h2>
          <p className="text-base text-slate-600">
            NETGRAPH applies cutting-edge data mining techniques to analyze skills, bridge gaps, and illuminate career pathways.
          </p>
        </div>

        {/* Step Flow (5 connected cards matching reference video 00:03 - 00:05) */}
        <div className="relative">
          {/* Subtle connecting line for desktop */}
          <div className="hidden lg:block absolute top-1/2 left-8 right-8 h-0.5 bg-slate-200 -translate-y-6 -z-0" />

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 relative z-10 text-left">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Step Badge & Icon */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-100">
                      {step.number}
                    </span>
                    <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                      {step.icon}
                    </div>
                  </div>

                  {/* Title & Subtitle */}
                  <h3 className="text-sm font-bold text-slate-900 mb-0.5">
                    {step.title}
                  </h3>
                  <span className="text-[11px] font-medium text-slate-400 block mb-2">
                    {step.subtitle}
                  </span>

                  {/* Description */}
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>Phase {idx + 1} of 5</span>
                  {idx < 4 && <ArrowRight className="w-3.5 h-3.5 text-slate-300 hidden lg:block" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
