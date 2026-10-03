import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import {
  LayoutDashboard,
  User,
  Brain,
  Compass,
  Target,
  BarChart3,
  Share2,
  Route,
  FileText,
  FileCheck2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const { profile } = useAppData();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { name: 'Overview', to: '/dashboard', icon: LayoutDashboard },
    { name: 'My Profile', to: '/profile', icon: User },
    { name: 'Skill Analysis', to: '/skill-analysis', icon: Brain },
    { name: 'Career Matches', to: '/career-matches', icon: Compass },
    { name: 'Skill Gap Analysis', to: '/skill-gap', icon: Target },
    { name: 'Analytics', to: '/analytics', icon: BarChart3 },
    { name: '3D Graph Explorer', to: '/graph-explorer', icon: Share2 },
    { name: 'Career Paths', to: '/career-paths', icon: Route },
    { name: 'Reports', to: '/reports', icon: FileText },
    // Resume Builder must be a separate optional item in the sidebar (Section 8.1)
    { name: 'Resume Builder', to: '/resume-builder', icon: FileCheck2, badge: 'Optional' },
    { name: 'Settings', to: '/settings', icon: Settings },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200/90 text-slate-700 select-none">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
        <NavLink
          to="/"
          className={`flex items-center gap-2.5 overflow-hidden transition-all ${
            collapsed ? 'justify-center w-full' : ''
          }`}
          title="Return to Public Landing Page"
        >
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shrink-0 shadow-xs">
            <span className="text-white font-extrabold text-base">N</span>
          </div>
          {!collapsed && (
            <span className="font-extrabold text-lg tracking-tight text-slate-900 truncate">
              NETGRAPH
            </span>
          )}
        </NavLink>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links List */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navLinks.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? 'bg-indigo-50 text-indigo-600 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              } ${collapsed ? 'justify-center' : ''}`}
              title={collapsed ? item.name : undefined}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'
                }`}
              />
              {!collapsed && (
                <span className="truncate flex-1 text-left">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-indigo-100/70 text-indigo-700">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info & Footer Controls */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className={`flex items-center gap-2.5 p-2 rounded-xl hover:bg-white border border-transparent hover:border-slate-200 transition-all ${
            collapsed ? 'justify-center' : ''
          }`}
          title={collapsed ? profile.fullName : undefined}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {profile.fullName.split(' ').map((n) => n[0]).join('')}
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden text-left">
              <div className="text-xs font-bold text-slate-800 truncate">{profile.fullName}</div>
              <div className="text-[10px] text-slate-500 truncate">{profile.email}</div>
            </div>
          )}
        </NavLink>

        <button
          onClick={handleLogout}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer ${
            collapsed ? 'justify-center' : ''
          }`}
          title="Logout and return to public website"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 h-screen sticky top-0 transition-all duration-300 z-30 ${
          collapsed ? 'w-18' : 'w-64'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 transition-opacity"
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 shadow-2xl ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
