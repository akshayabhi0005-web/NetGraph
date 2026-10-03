import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, ArrowLeft, ShieldCheck, CheckCircle2, User, Mail, Lock, AlertCircle } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the research terms and data guidelines.');
      return;
    }

    setIsLoading(true);
    const res = await signup(fullName, email, password);
    setIsLoading(false);

    if (res.success) {
      navigate('/dashboard');
    } else {
      setError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-indigo-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

      <div className="max-w-4xl mx-auto w-full relative z-10">
        {/* Main Card with Split Layout matching video frame 00:08 */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
          {/* Left Column: Graphic Preview */}
          <div className="md:col-span-5 bg-gradient-to-br from-indigo-900 via-slate-900 to-indigo-950 p-8 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

            <div>
              <Link to="/" className="inline-flex items-center gap-2 mb-8">
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center">
                  <span className="text-white font-extrabold text-lg">N</span>
                </div>
                <span className="font-extrabold text-lg tracking-tight">NETGRAPH</span>
              </Link>

              <h3 className="text-2xl font-bold tracking-tight mb-3">
                Unlock Graph-Based Career Intelligence
              </h3>
              <p className="text-xs text-indigo-200/80 leading-relaxed mb-6">
                Map your academic projects, competencies, and GitHub contributions to evolving industry job roles.
              </p>
            </div>

            {/* Illustrative Cards Stack Preview (as shown in reference video 00:08) */}
            <div className="space-y-3 relative">
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3.5 border border-white/15 shadow-lg transform -rotate-1">
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-400/30 flex items-center justify-center text-xs font-bold text-indigo-200">
                    AN
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-white">Profile Synthesis</div>
                    <div className="text-[10px] text-indigo-200">16 Skills Identified</div>
                  </div>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full w-[88%]" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-md rounded-xl p-3 border border-white/15 shadow-md flex items-center justify-between text-xs">
                <span className="text-indigo-200">Target Match: Data Scientist</span>
                <span className="text-emerald-400 font-bold">88% Fit</span>
              </div>
            </div>

            <div className="pt-6 text-[11px] text-indigo-300/70 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Academic Data Mining • Zero Spam</span>
            </div>
          </div>

          {/* Right Column: Sign Up Form */}
          <div className="md:col-span-7 p-8 sm:p-10 text-left">
            <div className="mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Sign-Up Page
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Sign in to access your personalized career insights.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Akshay N"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="akshay@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Password & Confirm Password in 2 Cols */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9.5 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Repeat password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9.5 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start pt-1">
                <input
                  id="agree-terms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-600 leading-tight">
                  I acknowledge that NETGRAPH is an academic research platform and agree to the{' '}
                  <Link to="/terms" className="text-indigo-600 hover:underline">
                    Terms of Use
                  </Link>.
                </label>
              </div>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center cursor-pointer disabled:opacity-70 mt-2"
              >
                {isLoading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="text-center pt-4 border-t border-slate-100 text-xs text-slate-500 mt-6">
              <span>Already registered? </span>
              <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">
                Return to Sign In
              </Link>
            </div>
          </div>
        </div>

        {/* Back to Home Link */}
        <div className="text-center mt-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
          <p className="text-[11px] text-slate-400 mt-0.5">
            If you wish to return to the public landing page
          </p>
        </div>
      </div>
    </div>
  );
};
