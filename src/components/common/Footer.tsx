import React from 'react';
import { Link } from 'react-router-dom';
import { Network, Shield, FileText, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-12 text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-100">
          {/* Brand Column */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 flex items-center justify-center shadow-xs">
                <span className="text-white font-extrabold text-base">N</span>
              </div>
              <span className="font-extrabold text-xl tracking-tight text-slate-900">
                NETGRAPH
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Mining hidden relationships between user skills, emerging technologies, project repositories, and real-world career opportunities using graph analytics.
            </p>
            <div className="flex items-center gap-3 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                aria-label="GitHub"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-slate-900 transition-colors"
                aria-label="LinkedIn"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Quick Platform Links */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <a href="#features" className="hover:text-indigo-600 transition-colors">
                  Platform Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-indigo-600 transition-colors">
                  How NETGRAPH Works
                </a>
              </li>
              <li>
                <a href="#about" className="hover:text-indigo-600 transition-colors">
                  Academic Methodology
                </a>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Interactive 3D Graph
                </Link>
              </li>
            </ul>
          </div>

          {/* Authentication & User Portal */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">User Portal</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Sign In
                </Link>
              </li>
              <li>
                <Link to="/signup" className="hover:text-indigo-600 transition-colors">
                  Create Account
                </Link>
              </li>
              <li>
                <Link to="/forgot-password" className="hover:text-indigo-600 transition-colors">
                  Reset Password
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-indigo-600 transition-colors">
                  Demo Dashboard Access
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">Integrity & Policies</h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/privacy" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Privacy Policy</span>
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-600 transition-colors flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Terms of Research Use</span>
                </Link>
              </li>
              <li className="pt-2">
                <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-[10px] font-medium">
                  Academic Evaluation Phase
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p className="max-w-2xl text-left leading-relaxed">
            <strong>Disclaimer:</strong> NETGRAPH is an academic Data Mining and Career Intelligence project. Career alignment percentages are algorithmic estimates derived from profile submissions, not guarantees of employment or corporate hiring decisions.
          </p>
          <p className="shrink-0 text-slate-500">
            © {new Date().getFullYear()} NETGRAPH. Built for Academic Research.
          </p>
        </div>
      </div>
    </footer>
  );
};
