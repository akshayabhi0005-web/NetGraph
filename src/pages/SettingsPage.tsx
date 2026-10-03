import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import {
  Settings,
  User,
  Shield,
  Database,
  RotateCcw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { logout } = useAuth();
  const { profile, updateProfile, resetToDemoData } = useAppData();
  const navigate = useNavigate();

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all data back to the default demo values?')) {
      resetToDemoData();
      showToast('All data has been reset to initial academic demonstration state.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="space-y-6 text-left max-w-4xl">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-xl border border-slate-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-1.5">
        <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
          <Settings className="w-3.5 h-3.5" />
          <span>Preferences & Data Management</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          Platform Settings
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Manage local simulation state, career interest vectors, and research session controls.
        </p>
      </div>

      {/* Notice box */}
      <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3 text-xs text-indigo-950">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Frontend-Only Notice:</strong> Configuration changes and simulation variables are maintained strictly in your browser's local state. No personal profile data or credentials are submitted to external production servers.
        </p>
      </div>

      {/* Career Preferences */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-600" />
          <span>Career Target Preferences</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Target Work Mode</label>
            <select
              value={profile.careerPreferences.workMode}
              onChange={(e) =>
                updateProfile({
                  careerPreferences: {
                    ...profile.careerPreferences,
                    workMode: e.target.value as any,
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            >
              <option value="Remote">Remote</option>
              <option value="Hybrid">Hybrid</option>
              <option value="On-site">On-site</option>
              <option value="Flexible">Flexible</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Preferred Location</label>
            <input
              type="text"
              value={profile.careerPreferences.preferredLocation}
              onChange={(e) =>
                updateProfile({
                  careerPreferences: {
                    ...profile.careerPreferences,
                    preferredLocation: e.target.value,
                  },
                })
              }
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
            />
          </div>
        </div>
      </div>

      {/* Data Management & Session Controls */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600" />
          <span>Data Storage & Demo Reset</span>
        </h3>

        <div className="space-y-3">
          <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-slate-800 block">Reset Academic Demonstration Data</span>
              <span className="text-[11px] text-slate-500">
                Restores original profile skills, sample projects, and report history to defaults.
              </span>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Data</span>
            </button>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <span className="font-bold text-rose-900 block">End Session & Logout</span>
              <span className="text-[11px] text-rose-700/80">
                Clears active authentication tokens and returns to the public landing page.
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold cursor-pointer shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
