import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Brain,
  Compass,
  GitBranch,
  Target,
  BarChart3,
  Share2,
  FileCheck2,
  Route,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
} from 'lucide-react';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  preview: React.ReactNode;
  actionText: string;
  route: string;
}

export const FeaturesGrid: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleAction = (targetRoute: string) => {
    if (isAuthenticated) {
      navigate(targetRoute);
    } else {
      navigate('/login', { state: { returnTo: targetRoute } });
    }
  };

  const features: FeatureCardProps[] = [
    {
      icon: <Brain className="w-5 h-5 text-indigo-600" />,
      title: 'Skill Analysis',
      description: 'Analyze user-provided profile details, skills, project descriptions, and optional resume information to create a structured skill overview.',
      badge: 'Core Mining',
      preview: (
        <div className="space-y-1.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <div className="flex justify-between text-[11px] text-slate-600">
            <span>Python & Data Mining</span>
            <span className="font-bold text-indigo-600">95%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[95%]" />
          </div>
          <div className="flex justify-between text-[11px] text-slate-600 pt-1">
            <span>React & TypeScript</span>
            <span className="font-bold text-blue-600">92%</span>
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[92%]" />
          </div>
        </div>
      ),
      actionText: 'Analyze My Skills',
      route: '/skill-analysis',
    },
    {
      icon: <Compass className="w-5 h-5 text-blue-600" />,
      title: 'Career Recommendations',
      description: 'Explore potential career roles using multidimensional profile alignment against live skill and technology requirements.',
      badge: 'Role Matching',
      preview: (
        <div className="grid grid-cols-2 gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <div className="p-2 rounded-md bg-white border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Top Match</span>
            <span className="font-bold text-slate-800 text-xs">Data Scientist</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">88% Fit</span>
          </div>
          <div className="p-2 rounded-md bg-white border border-slate-200">
            <span className="text-[10px] text-slate-400 block">Engineering</span>
            <span className="font-bold text-slate-800 text-xs">Full-Stack Dev</span>
            <span className="text-[11px] text-indigo-600 font-semibold block mt-0.5">92% Fit</span>
          </div>
        </div>
      ),
      actionText: 'View Role Matches',
      route: '/career-matches',
    },
    {
      icon: <GitBranch className="w-5 h-5 text-slate-700" />,
      title: 'GitHub Profile Analysis',
      description: 'Explore permitted GitHub profile repositories, programming languages, and projects to discover demonstrated technical strengths.',
      badge: 'Repository Mining',
      preview: (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-700">Repositories</span>
            <span className="font-mono text-slate-500">3 Public Repos</span>
          </div>
          <div className="flex items-center gap-1.5 pt-1">
            <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-medium">Python 52%</span>
            <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 text-[10px] font-medium">TypeScript 34%</span>
            <span className="px-2 py-0.5 rounded bg-cyan-100 text-cyan-800 text-[10px] font-medium">React 14%</span>
          </div>
        </div>
      ),
      actionText: 'Explore Repositories',
      route: '/profile',
    },
    {
      icon: <Target className="w-5 h-5 text-rose-600" />,
      title: 'Skill Gap Analysis',
      description: 'Compare profile skills with selected role requirements and identify skills not currently represented in your profile.',
      badge: 'Diagnostics',
      preview: (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="font-semibold text-slate-700">Identified Gaps for ML</span>
            <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-1.5 py-0.5 rounded">3 Needed</span>
          </div>
          <div className="space-y-1 text-[11px] text-slate-600">
            <div className="flex items-center gap-1 text-slate-500">○ PyTorch / TensorFlow</div>
            <div className="flex items-center gap-1 text-slate-500">○ A/B Testing Protocols</div>
          </div>
        </div>
      ),
      actionText: 'Review Skill Gaps',
      route: '/skill-gap',
    },
    {
      icon: <BarChart3 className="w-5 h-5 text-indigo-600" />,
      title: 'Data Analytics Dashboard',
      description: 'Visualize skill distributions, role alignment, technologies, project information, and illustrative career trends in real time.',
      badge: 'Visual Analytics',
      preview: (
        <div className="flex items-end justify-between gap-1.5 h-16 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
          <div className="w-1/6 bg-indigo-200 h-[45%] rounded-t" />
          <div className="w-1/6 bg-indigo-400 h-[70%] rounded-t" />
          <div className="w-1/6 bg-indigo-600 h-[95%] rounded-t" />
          <div className="w-1/6 bg-blue-500 h-[80%] rounded-t" />
          <div className="w-1/6 bg-cyan-400 h-[60%] rounded-t" />
          <div className="w-1/6 bg-purple-500 h-[75%] rounded-t" />
        </div>
      ),
      actionText: 'View Dashboard',
      route: '/analytics',
    },
    {
      icon: <Share2 className="w-5 h-5 text-teal-600" />,
      title: 'Interactive 3D Graph Explorer',
      description: 'Explore relationships among skills, technologies, projects, and career roles in a rotatable 3D graph with node-inspection.',
      badge: '3D Force Graph',
      preview: (
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-white font-medium text-[11px]">27 Nodes • 36 Edges</span>
          </div>
          <span className="text-cyan-400 text-[10px] font-semibold">Rotatable 3D</span>
        </div>
      ),
      actionText: 'Open 3D Explorer',
      route: '/graph-explorer',
    },
    {
      icon: <FileCheck2 className="w-5 h-5 text-amber-600" />,
      title: 'Resume Builder',
      description: 'Create a professional resume using profile information, customizable templates, live preview, and high-fidelity PDF download.',
      badge: 'Career Tool',
      preview: (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center gap-3">
          <div className="w-9 h-12 bg-white border border-slate-300 rounded shadow-xs flex flex-col p-1 gap-1">
            <div className="w-full h-1.5 bg-indigo-400 rounded-xs" />
            <div className="w-3/4 h-1 bg-slate-200 rounded-xs" />
            <div className="w-1/2 h-1 bg-slate-200 rounded-xs" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-semibold text-slate-800 block">4 Modern Templates</span>
            <span className="text-[10px] text-slate-500">Auto-filled from profile</span>
          </div>
        </div>
      ),
      actionText: 'Build My Resume',
      route: '/resume-builder',
    },
    {
      icon: <Route className="w-5 h-5 text-emerald-600" />,
      title: 'Career Path Exploration',
      description: 'Explore step-by-step pathways connecting current skills, intermediate technologies, project milestones, and target roles.',
      badge: 'Roadmapping',
      preview: (
        <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px]">
            <span className="font-semibold text-slate-700">4 Milestones</span>
            <span className="text-slate-400">•</span>
            <span className="text-emerald-600 font-medium">88% Ready</span>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-500" />
        </div>
      ),
      actionText: 'Explore Pathways',
      route: '/career-paths',
    },
  ];

  return (
    <section id="features" className="py-20 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Section Heading */}
        <div className="max-w-3xl mx-auto space-y-3 mb-14">
          <span className="inline-block text-xs font-bold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-100">
            Platform Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Comprehensive Data Mining & Career Intelligence
          </h2>
          <p className="text-base text-slate-600">
            Everything you need to analyze your skill footprint, explore multi-relational graphs, and navigate career transitions with empirical clarity.
          </p>
        </div>

        {/* Feature Cards Grid (matching video) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header with Icon and Badge */}
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
                    {feature.icon}
                  </div>
                  {feature.badge && (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {feature.badge}
                    </span>
                  )}
                </div>

                {/* Title & Description */}
                <h3 className="text-base font-bold text-slate-900 mb-1.5 group-hover:text-indigo-600 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">
                  {feature.description}
                </p>

                {/* Preview Thumbnail */}
                <div className="mb-4">{feature.preview}</div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleAction(feature.route)}
                className="w-full inline-flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-indigo-600 hover:text-white border border-slate-200/80 hover:border-indigo-600 transition-all cursor-pointer"
              >
                <span>{feature.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
