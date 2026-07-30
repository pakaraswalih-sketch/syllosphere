import React, { useState, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { XCircleIcon, LoaderIcon, EyeIcon, EyeOffIcon, BrainCircuitIcon, BookOpenIcon, BarChart2Icon, ShieldCheckIcon, MailIcon, LockIcon, ArrowLeftIcon } from './Icons';

// ─── Shared Types ────────────────────────────────────────────────────────────
type ModalMode = 'login' | 'signup' | 'forgot_password';

interface AuthModalProps {
  initialMode: ModalMode;
  onClose: () => void;
  onSuccess: (email: string) => void;
  onNeedsVerification: (email: string) => void;
}

// ─── Helper ──────────────────────────────────────────────────────────────────
const parseSupabaseError = (msg: string): string => {
  if (msg.includes('Invalid login credentials')) return 'Incorrect email or password.';
  if (msg.includes('Email not confirmed')) return 'Please verify your email before logging in.';
  if (msg.includes('User already registered')) return 'An account with this email already exists.';
  if (msg.includes('Password should be at least')) return 'Password must be at least 6 characters.';
  if (msg.includes('Unable to validate email')) return 'Please enter a valid email address.';
  if (msg.includes('rate limit')) return 'Too many attempts. Please wait a moment.';
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) return 'Unable to connect. Please check your internet connection.';
  if (msg.includes('Database error') || msg.includes('502') || msg.includes('503') || msg.includes('504')) return 'Server temporarily unavailable. Please try again.';
  return msg || 'Something went wrong. Please try again.';
};

// ─── Auth Modal ───────────────────────────────────────────────────────────────
const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose, onSuccess, onNeedsVerification }) => {
  const [mode, setMode] = useState<ModalMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // ── Request deduplication guard ──────────────────────────────────────────
  // Prevents double-submission from rapid clicks or React StrictMode.
  // Each button press must fire exactly ONE auth request to Supabase.
  const isSubmitting = useRef(false);

  const resetState = () => {
    setError('');
    setMessage('');
  };

  const switchMode = (m: ModalMode) => {
    setMode(m);
    resetState();
    setEmail('');
    setPassword('');
    setResetSent(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // ── In-flight guard: prevent duplicate requests from double-clicks or StrictMode ──
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setLoading(true);
    resetState();

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: cleanEmail,
          password: cleanPassword,
          options: {
            emailRedirectTo: `${window.location.origin}/`
          }
        });
        if (signUpError) throw signUpError;
        if (data.user && !data.session) {
          // Email confirmation required
          onNeedsVerification(cleanEmail);
        } else if (data.session) {
          onSuccess(cleanEmail);
        }
      } else if (mode === 'forgot_password') {
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: `${window.location.origin}/`
        });
        if (resetError) throw resetError;
        setResetSent(true);
        setMessage('We sent a password reset link to your email. Please check your inbox and click the link to set a new password.');
      } else {
        // NOTE: Do NOT call signOut() before signInWithPassword here.
        // A spurious signOut fires a SIGNED_OUT event that cascades state resets
        // and consumes an additional Supabase rate-limit slot.
        // Input normalization (trim/lowercase) is sufficient to prevent credential mismatches.
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: cleanEmail, password: cleanPassword });
        if (signInError) throw signInError;
        if (data.session) {
          onSuccess(cleanEmail);
        }
      }
    } catch (err: any) {
      setError(parseSupabaseError(err.message || 'Something went wrong. Try again.'));
    } finally {
      isSubmitting.current = false;
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex bg-white font-sans overflow-y-auto sm:overflow-hidden animate-[fadeIn_0.3s_ease-out]">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex flex-col w-1/2 bg-[#F3F7FF] relative overflow-hidden px-16 py-12">
        {/* Dotted pattern */}
        <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-10">
            <BrainCircuitIcon className="w-8 h-8 text-blue-600" />
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-[0.15em] text-[#0f172a] font-serif leading-none mb-1">SYLLOSPHERE</span>
              <span className="text-[9px] font-bold text-slate-500 tracking-widest mt-0.5">MASTER LOGIC. ACE EVERY EXAM.</span>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-100/60 text-blue-700 text-[10px] font-bold tracking-widest mb-10">
            SMART LEARNING. STRONG FUTURE.
          </div>

          <h1 className="text-6xl font-serif text-[#0f172a] mb-2 leading-[1.1] tracking-tight">Learn Logic.</h1>
          <h1 className="text-6xl font-sans font-bold text-blue-600 mb-6 leading-[1.1] tracking-tight">Excel Every Day.</h1>

          <p className="text-lg text-slate-600 mb-12 max-w-md font-medium">
            SylloSphere is your ultimate platform to master logic design and ace every exam with confidence.
          </p>

          <div className="space-y-6 max-w-md">
            {[
              { icon: <BookOpenIcon className="w-5 h-5" />, title: "Comprehensive Lessons", desc: "Learn from structured and easy-to-follow content." },
              { icon: <BarChart2Icon className="w-5 h-5" />, title: "Practice & Improve", desc: "Solve quizzes and strengthen your concepts." },
              { icon: <ShieldCheckIcon className="w-5 h-5" />, title: "Track Your Progress", desc: "Monitor your performance and achieve more." },
            ].map((feature, i) => (
              <div key={i} className="flex items-start gap-5">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-slate-100 flex items-center justify-center text-blue-600 shrink-0">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-[#0f172a] mb-1">{feature.title}</h3>
                  <p className="text-[13px] text-slate-500 font-medium">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Decorative Wave */}
        <div className="absolute bottom-0 left-0 w-full translate-y-[20%]">
          <svg viewBox="0 0 1440 320" className="w-full h-auto drop-shadow-xl" preserveAspectRatio="none">
            <path fill="#93c5fd" fillOpacity="0.4" d="M0,160L48,170.7C96,181,192,203,288,197.3C384,192,480,160,576,149.3C672,139,768,149,864,170.7C960,192,1056,224,1152,218.7C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            <path fill="#3b82f6" fillOpacity="0.8" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,138.7C672,128,768,128,864,138.7C960,149,1056,171,1152,176C1248,181,1344,171,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
          </svg>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 bg-white relative flex flex-col min-h-screen">
        <div className="absolute top-6 right-8 flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-blue-100 bg-blue-50 text-blue-600 text-xs font-semibold">
            <ShieldCheckIcon className="w-4 h-4" /> Secure
          </div>
          <button onClick={onClose} className="p-2 rounded-full border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors">
            <XCircleIcon className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 max-w-xl mx-auto w-full py-12">
          <h2 className="text-[32px] font-bold text-[#0f172a] mb-2 tracking-tight">
            {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
          </h2>
          <p className="text-[15px] text-slate-500 mb-8 font-medium">
            {mode === 'login' ? 'Login to continue your learning journey' : mode === 'signup' ? 'Sign up to start your learning journey' : 'Enter your email to receive a reset link'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {(mode !== 'forgot_password' || !resetSent) && (
              <div>
                <label className="text-sm font-bold text-[#0f172a] block mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <MailIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-4 text-[#0f172a] text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                  />
                </div>
              </div>
            )}

            {mode !== 'forgot_password' && (
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-bold text-[#0f172a] block">
                      Password
                    </label>
                    {mode === 'login' && (
                      <button type="button" onClick={() => switchMode('forgot_password')} className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors">
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <LockIcon className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full bg-white border border-slate-200 rounded-xl py-3.5 pl-12 pr-12 text-[#0f172a] text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                    >
                      {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}



            {error && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm flex items-start gap-2 font-medium">
                <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-600 text-sm font-medium">
                {message}
              </div>
            )}

            {!(mode === 'forgot_password' && resetSent) && (
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 text-base"
              >
                {loading ? (
                  <>
                    <LoaderIcon className="w-5 h-5 animate-spin" />
                    {mode === 'login' ? 'Logging in...' : mode === 'signup' ? 'Creating Account...' : 'Sending...'}
                  </>
                ) : (
                  mode === 'login' ? 'Login' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
                )}
                {!loading && mode === 'signup' && <ArrowLeftIcon className="w-4 h-4 rotate-180 ml-1" />}
              </button>
            )}
          </form>

          <div className="text-center mt-8">
            {mode === 'login' ? (
              <p className="text-sm text-slate-500 font-medium">
                Don't have an account?{' '}
                <button type="button" onClick={() => switchMode('signup')} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Sign up
                </button>
              </p>
            ) : mode === 'signup' ? (
              <p className="text-sm text-slate-500 font-medium">
                Already have an account?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Login
                </button>
              </p>
            ) : (
              <div className="text-sm text-slate-500 font-medium flex flex-col gap-2">
                Remembered your password?{' '}
                <button type="button" onClick={() => switchMode('login')} className="text-blue-600 font-bold hover:text-blue-700 transition-colors">
                  Back to Login
                </button>
                {resetSent && (
                  <button type="button" onClick={() => setResetSent(false)} className="text-slate-500 font-medium hover:text-slate-700 transition-colors mt-2 text-xs">
                    Didn't receive the email? Try again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
