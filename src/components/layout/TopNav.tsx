import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import {
  Menu,
  Bell,
  Search,
  ExternalLink,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TopNavProps {
  onOpenMobile: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobile }) => {
  const { user } = useAuth();
  const { profile, isAnalyzing, runSkillAnalysis } = useAppData();
  const location = useLocation();

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  // Map route to title
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/dashboard')) return { title: 'Dashboard Overview', category: 'Analytics' };
    if (path.startsWith('/profile')) return { title: 'Candidate Profile', category: 'Account Management' };
    if (path.startsWith('/skill-analysis')) return { title: 'Skill Analysis Engine', category: 'Data Mining' };
    if (path.startsWith('/career-matches')) return { title: 'Career Matches & Alignment', category: 'Exploration' };
    if (path.startsWith('/skill-gap')) return { title: 'Skill Gap Diagnostics', category: 'Assessment' };
    if (path.startsWith('/analytics')) return { title: 'Career Analytics & Insights', category: 'Data Mining' };
    if (path.startsWith('/graph-explorer')) return { title: '3D Graph Explorer', category: 'Knowledge Graph' };
    if (path.startsWith('/career-paths')) return { title: 'Career Pathway Roadmaps', category: 'Guidance' };
    if (path.startsWith('/reports')) return { title: 'Reports & History', category: 'Documentation' };
    if (path.startsWith('/resume-builder')) return { title: 'Resume Builder', category: 'Tools' };
    if (path.startsWith('/settings')) return { title: 'Platform Settings', category: 'Preferences' };
    return { title: 'Overview', category: 'NETGRAPH' };
  };

  const { title, category } = getPageTitle();

  const demoNotifications = [
    {
      id: 1,
      title: 'Skill Vector Recomputed',
      desc: `Full analysis sync completed for ${profile.skills.length} identified competencies.`,
      time: '10m ago',
      unread: true,
    },
    {
      id: 2,
      title: 'High Career Match Detected',
      desc: 'Profile alignment with Data Scientist is currently estimated at 88%.',
      time: '1h ago',
      unread: false,
    },
    {
      id: 3,
      title: '3D Graph Ingestion Complete',
      desc: '27 vertices and 36 multi-relational edges loaded into local WebGL graph.',
      time: '2h ago',
      unread: false,
    },
  ];

  return (
    <header className="h-16 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobile}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="text-left">
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block">
            {category}
          </span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
            {title}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Quick Analysis Status Button */}
        <button
          onClick={() => runSkillAnalysis()}
          disabled={isAnalyzing}
          className={`hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            isAnalyzing
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100'
          }`}
          title="Run quick data mining resynchronization"
        >
          <Sparkles className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin text-amber-600' : 'text-indigo-600'}`} />
          <span>{isAnalyzing ? 'Mining...' : 'Analyze Skills'}</span>
        </button>

        {/* Public Landing Link */}
        <Link
          to="/"
          className="hidden lg:inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-100"
        >
          <span>Public Site</span>
          <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
        </Link>

        {/* Notification Bell with Dropdown */}
        <div className="relative">
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 relative transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-slate-200 shadow-xl p-3 text-left animate-in fade-in slide-in-from-top-1 z-30">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900">Research Notifications</span>
                <span className="text-[10px] text-indigo-600 font-semibold cursor-pointer">Mark read</span>
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {demoNotifications.map((n) => (
                  <div key={n.id} className="p-2 rounded-lg hover:bg-slate-50 text-xs transition-colors">
                    <div className="flex items-center justify-between font-semibold text-slate-800 mb-0.5">
                      <span>{n.title}</span>
                      <span className="text-[10px] text-slate-400 font-normal">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 leading-snug">{n.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* User Mini Avatar Badge */}
        <Link
          to="/profile"
          className="flex items-center gap-2 pl-2 border-l border-slate-200"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-bold text-xs flex items-center justify-center shadow-xs">
            {profile.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
        </Link>
      </div>
    </header>
  );
};
