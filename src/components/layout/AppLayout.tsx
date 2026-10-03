import React, { useState } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Sparkles, Loader2 } from 'lucide-react';

export const AppLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isAnalyzing, analysisProgress, analysisStage } = useAppData();
  const location = useLocation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Protected Route Check (Section 7.3)
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-row relative">
      {/* Sidebar */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <TopNav onOpenMobile={() => setMobileMenuOpen(true)} />

        {/* Global Live Analysis Floating Notification Bar */}
        {isAnalyzing && (
          <div className="bg-indigo-900 text-white px-4 py-2.5 flex items-center justify-between text-xs animate-in slide-in-from-top duration-200 sticky top-16 z-30 shadow-md">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-400" />
              <span className="font-semibold text-indigo-200">Data Mining Engine:</span>
              <span className="text-white">{analysisStage}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-28 bg-indigo-950 h-2 rounded-full overflow-hidden border border-indigo-700/50">
                <div
                  className="bg-indigo-400 h-full transition-all duration-300"
                  style={{ width: `${analysisProgress}%` }}
                />
              </div>
              <span className="font-mono font-bold text-indigo-200">{analysisProgress}%</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
