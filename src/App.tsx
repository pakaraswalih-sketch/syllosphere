import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useCMS } from './context/CMSContext';
import { EditableText } from './components/EditableText';
import { EditableHTML } from './components/EditableHTML';
import { AdminInspector } from './components/AdminInspector';
import { supabase } from './lib/supabaseClient';
import { logActivity, getLessons } from './lib/adminService';
import { startHeartbeat } from './lib/heartbeat';
import { createRoot } from 'react-dom/client';
import { DIFFICULTY_COLORS } from './constants';
import { Lesson, LessonContent, QuizQuestion, ChatMessage, Tab } from './types';
import * as GeminiService from './services/geminiService';
import { 
  BookOpenIcon, BrainCircuitIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, SendIcon, 
  MessageSquareIcon, LoaderIcon, SearchIcon,
  GraduationCapIcon, LightbulbIcon, Volume2Icon, TurtleIcon,
  LockIcon, MedalIcon, MailIcon, StarIcon, PlayIcon, ShieldCheckIcon,
  UsersIcon, FileTextIcon, ClipboardListIcon, BarChart2Icon, MenuIcon,
  LayoutDashboardIcon, LogOutIcon, TrophyIcon, AwardIcon, SettingsIcon
} from './components/Icons';
import SyllogismValidator from './components/SyllogismValidator';
import { Header } from './components/Header';
import FloatingHeader from './components/FloatingHeader';
import AuthModal from './components/AuthModals';
import UserDashboard from './components/UserDashboard';
import Leaderboard from './components/Leaderboard';
import AdminQuizEditor from './components/AdminQuizEditor';
import { AdminConsultDesk } from './components/AdminConsultDesk';
import Certificate from './components/Certificate';
import { LiveConsultInterface } from './components/LiveConsultInterface';
import { useGlassHighlight } from './hooks/useGlassHighlight';
import { Settings } from './components/Settings';
import ResetPassword from './components/ResetPassword';

// Cache the initial hash before Supabase or React router can strip it
const INITIAL_HASH = typeof window !== 'undefined' ? window.location.hash : '';

// --- Types ---
type AppView = 'landing' | 'enrollment' | 'levelSelection' | 'dashboard' | 'lesson' | 'signupSuccess' | 'userDashboard' | 'adminConsult' | 'leaderboard' | 'certificate' | 'settings' | 'resetPassword';
type AuthModalMode = 'login' | 'signup' | 'forgot_password' | null;

interface Candidate {
  name: string;
  level: string;
  avatarUrl?: string | null;
}

const Landing = ({ 
  onOpenAuth, 
  isLoggedIn, 
  onEnterApp 
}: { 
  onOpenAuth: (mode: 'login' | 'signup') => void;
  isLoggedIn: boolean;
  onEnterApp: () => void;
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleStartContinue = () => {
    setIsMobileMenuOpen(false);
    isLoggedIn ? onEnterApp() : onOpenAuth('signup');
  };
  const handleLoginContinue = () => {
    setIsMobileMenuOpen(false);
    isLoggedIn ? onEnterApp() : onOpenAuth('login');
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF] font-sans text-slate-900 overflow-x-hidden relative">
      {/* Abstract Background Elements */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/50 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 sm:px-12 py-6 max-w-[1400px] mx-auto w-full relative z-50">
        <div className="flex items-center gap-2 sm:gap-3">
          <BrainCircuitIcon className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
          <span className="text-lg sm:text-xl font-bold tracking-[0.1em] sm:tracking-[0.15em] text-blue-900 font-serif">SYLLOSPHERE</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 lg:gap-10">
          <a href="#" className="text-blue-600 font-medium pb-1 border-b-2 border-blue-600 text-sm">Home</a>
          <a href="#features" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Features</a>
          <a href="#lessons" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Lessons</a>
          <a href="#about" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">About</a>
          <a href="#contact" className="text-slate-600 hover:text-slate-900 font-medium text-sm transition-colors">Contact</a>
        </nav>
        <div className="hidden md:flex items-center gap-3 lg:gap-4">
          <button onClick={handleStartContinue} className="px-5 lg:px-6 py-2.5 rounded-xl border border-blue-200 bg-blue-50/50 text-blue-600 font-semibold hover:bg-blue-50 transition-colors shadow-sm text-[13px] lg:text-sm">Get Started</button>
          <button onClick={handleLoginContinue} className="px-5 lg:px-6 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all text-[13px] lg:text-sm">Login</button>
        </div>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <XCircleIcon className="w-7 h-7" /> : <MenuIcon className="w-7 h-7" />}
        </button>
      </header>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-sm pt-24 px-6 pb-6 flex flex-col md:hidden animate-[fadeIn_0.2s_ease-out]">
          <nav className="flex flex-col gap-6 text-center">
            <a href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-slate-900">Home</a>
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-slate-600 hover:text-blue-600">Features</a>
            <a href="#lessons" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-slate-600 hover:text-blue-600">Lessons</a>
            <a href="#about" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-slate-600 hover:text-blue-600">About</a>
            <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-medium text-slate-600 hover:text-blue-600">Contact</a>
          </nav>
          <div className="mt-10 flex flex-col gap-4 max-w-xs mx-auto w-full">
            <button onClick={handleLoginContinue} className="w-full py-4 rounded-xl border-2 border-blue-100 bg-white text-blue-600 font-bold text-lg hover:bg-blue-50 transition-colors">
              Login
            </button>
            <button onClick={handleStartContinue} className="w-full py-4 rounded-xl bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors">
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="max-w-[1400px] mx-auto px-6 sm:px-12 pt-12 sm:pt-16 pb-24 sm:pb-32 flex flex-col lg:flex-row items-center gap-12 lg:gap-8 relative z-10">
         {/* Left text */}
         <div className="flex-1 w-full flex flex-col items-start xl:pl-8">
           <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full border border-blue-100 bg-white mb-8 sm:mb-10 shadow-sm">
             <StarIcon className="w-[14px] h-[14px] text-blue-600" />
             <span className="text-[13px] text-blue-600 font-semibold tracking-wide">Master Logic. Ace Every Exam.</span>
           </div>
           
           <h1 className="text-6xl sm:text-7xl md:text-[80px] font-serif text-[#0f172a] mb-2 leading-[1.1] tracking-tight">Learn Logic.</h1>
           <h1 className="text-6xl sm:text-7xl md:text-[80px] font-sans font-bold text-blue-600 mb-6 sm:mb-8 leading-[1.1] tracking-tight">Excel Every Day.</h1>
           
           <p className="text-lg sm:text-xl text-slate-500 mb-10 sm:mb-12 max-w-lg font-medium">Master Logic. Ace Every Exam.</p>
           
           <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 w-full sm:w-auto">
             <button onClick={handleLoginContinue} className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center gap-2.5 hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all text-[15px]">
                <BookOpenIcon className="w-[18px] h-[18px]" /> Start Learning
             </button>
             <button className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-3.5 rounded-xl border border-slate-200 bg-white text-blue-600 font-bold flex items-center justify-center gap-2.5 hover:bg-blue-50 transition-all shadow-sm text-[15px]">
                <PlayIcon className="w-[18px] h-[18px]" /> Watch Demo
             </button>
           </div>
         </div>

         {/* Right illustration */}
         <div className="flex-1 w-full relative h-[600px] items-center justify-center hidden lg:flex">
           {/* Main Grid Card */}
           <div className="absolute w-[600px] aspect-[4/3] bg-white rounded-3xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.05)] p-8 flex flex-col right-0">
              {/* Fake UI dots */}
              <div className="flex gap-2.5 mb-8">
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
                <div className="w-3.5 h-3.5 rounded-full bg-slate-200"></div>
              </div>
              {/* Grid area */}
              <div className="flex-1 border-2 border-slate-50/50 rounded-2xl relative overflow-hidden flex items-center justify-center bg-[#fafafa]">
                 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>
                 
                 {/* Logic connection illustration */}
                 <div className="relative z-10 flex items-center gap-12">
                    <div className="flex flex-col gap-6">
                      <div className="w-14 h-14 bg-white rounded-[14px] border border-blue-100 shadow-sm flex items-center justify-center text-blue-600 relative after:content-[''] after:absolute after:-right-12 after:top-1/2 after:w-12 after:h-px after:bg-blue-300">
                        <BrainCircuitIcon className="w-7 h-7" />
                      </div>
                      <div className="w-14 h-14 bg-white rounded-[14px] border border-blue-100 shadow-sm flex items-center justify-center text-blue-600 relative after:content-[''] after:absolute after:-right-12 after:top-1/2 after:w-12 after:h-px after:bg-blue-300">
                        <BrainCircuitIcon className="w-7 h-7" />
                      </div>
                    </div>
                    <div className="w-px h-24 bg-blue-300 relative after:content-[''] after:absolute after:top-1/2 after:left-0 after:w-12 after:h-px after:bg-blue-300"></div>
                    <div className="w-20 h-20 bg-white rounded-full border border-blue-100 shadow-lg flex items-center justify-center text-blue-600 ring-[8px] ring-blue-50/50 ml-6">
                      <LightbulbIcon className="w-9 h-9" />
                    </div>
                 </div>
              </div>
           </div>

           {/* Floating Progress Card */}
           <div className="absolute top-4 right-16 w-[180px] bg-white rounded-[24px] p-5 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] border border-slate-50 animate-[float_6s_ease-in-out_infinite]">
             <p className="text-[11px] font-bold text-[#0f172a] mb-4 text-center">Your Progress</p>
             <div className="relative w-20 h-20 mx-auto">
               <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path className="text-blue-50" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4"/>
                  <path className="text-blue-600 drop-shadow-sm" strokeDasharray="72, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round"/>
               </svg>
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                 <span className="text-xl font-bold text-[#0f172a]">72%</span>
               </div>
             </div>
             <p className="text-[10px] text-slate-400 text-center mt-3 font-medium">Keep it up!</p>
           </div>

           {/* Floating Quizzes Card */}
           <div className="absolute -bottom-8 right-24 w-[200px] bg-white rounded-[24px] p-5 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] border border-slate-50 animate-[float_8s_ease-in-out_infinite]">
             <p className="text-[11px] font-bold text-[#0f172a] mb-1 text-center">Quizzes Completed</p>
             <div className="flex items-center justify-center gap-2.5">
                <span className="text-3xl font-serif font-bold text-[#0f172a]">120</span>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded mb-0.5">↑ 15%</span>
             </div>
             <p className="text-[10px] text-slate-400 text-center font-medium mt-0.5">This Week</p>
           </div>

           {/* Floating Graduation Cap */}
           <div className="absolute bottom-12 -left-4 w-20 h-20 bg-white rounded-[24px] p-4 shadow-[0_15px_40px_-5px_rgba(0,0,0,0.08)] border border-slate-50 flex items-center justify-center text-blue-600 animate-[float_7s_ease-in-out_infinite_reverse]">
             <GraduationCapIcon className="w-10 h-10" />
           </div>

         </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-24 sm:py-32 rounded-t-[3rem] relative z-20">
        <div className="max-w-[1400px] mx-auto px-6 sm:px-12">
          <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-[32px] sm:text-[40px] font-serif text-[#0f172a] mb-4 sm:mb-6 tracking-tight leading-tight">Everything You Need to Succeed</h2>
            <p className="text-slate-500 text-base sm:text-lg font-medium">Powerful tools and resources designed to make learning logic simple and effective.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 xl:gap-8">
             {[
               { icon: <BookOpenIcon className="w-6 h-6"/>, title: "Comprehensive Lessons", desc: "Structured lessons that take you from basics to advanced concepts." },
               { icon: <ClipboardListIcon className="w-6 h-6"/>, title: "Practice Quizzes", desc: "Test your knowledge with quizzes designed for real exam success." },
               { icon: <BarChart2Icon className="w-6 h-6"/>, title: "Track Progress", desc: "Monitor your performance and stay motivated with detailed analytics." },
               { icon: <ShieldCheckIcon className="w-6 h-6"/>, title: "Achieve Excellence", desc: "Build confidence, improve accuracy, and achieve your academic goals." },
             ].map((feature, i) => (
               <div key={i} className="bg-white rounded-[24px] p-7 border border-slate-100 shadow-sm hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.05)] hover:-translate-y-1 transition-all duration-300">
                 <div className="w-12 h-12 bg-blue-50/80 rounded-[14px] flex items-center justify-center text-blue-600 mb-6">
                   {feature.icon}
                 </div>
                 <h3 className="text-[15px] font-bold text-[#0f172a] mb-2 leading-snug">{feature.title}</h3>
                 <p className="text-slate-500 text-[13px] leading-relaxed font-medium">{feature.desc}</p>
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-[#fafafa] py-16 border-t border-slate-100 relative z-20">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-wrap justify-center sm:justify-between items-center gap-10">
           {[
             { icon: <UsersIcon className="w-5 h-5"/>, val: "10K+", label: "ACTIVE LEARNERS" },
             { icon: <FileTextIcon className="w-5 h-5"/>, val: "250+", label: "LESSONS" },
             { icon: <ClipboardListIcon className="w-5 h-5"/>, val: "5K+", label: "QUIZZES" },
             { icon: <StarIcon className="w-5 h-5"/>, val: "4.9/5", label: "USER RATING" },
           ].map((stat, i) => (
             <div key={i} className="flex flex-1 items-center justify-center gap-4 min-w-[200px] relative">
               <div className="w-11 h-11 rounded-full bg-blue-100/60 flex items-center justify-center text-blue-600 shrink-0">
                 {stat.icon}
               </div>
               <div>
                 <h4 className="text-2xl font-serif font-bold text-[#0f172a] mb-0.5">{stat.val}</h4>
                 <p className="text-[9px] font-bold text-slate-500 tracking-[0.15em]">{stat.label}</p>
               </div>
               {i < 3 && (
                 <div className="hidden sm:block absolute right-0 top-1/2 -translate-y-1/2 w-px h-8 bg-slate-200"></div>
               )}
             </div>
           ))}
        </div>
      </section>

    </div>
  );
};

// --- Enrollment Component ---
const Enrollment = ({ onConfirm, onBack }: { onConfirm: (name: string) => void, onBack: () => void }) => {
  const [name, setName] = useState('');
  const { get: cms } = useCMS();
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-4 sm:p-6">
        <div className="w-full max-w-md fade-in">
            <div className="bg-slate-900/40 p-6 sm:p-8 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-2xl font-serif text-white mb-6 text-center"><EditableText contentKey="ui.enrollment.title" fallback="Identity Registration" disableIcon /></h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white focus:border-gold-500 outline-none transition-all placeholder:text-slate-700 text-center"
                            placeholder={cms('ui.enrollment.placeholder', 'Enter Name')}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gold-600 text-white font-bold rounded-xl hover:bg-gold-500 transition-all uppercase tracking-widest text-xs">
                        <EditableText contentKey="ui.enrollment.confirm" fallback="CONFIRM" disableIcon />
                    </button>
                    <button 
                        type="button"
                        onClick={onBack}
                        className="w-full text-slate-600 hover:text-slate-400 text-[10px] uppercase tracking-widest transition-colors"
                    >
                        <EditableText contentKey="ui.enrollment.cancel" fallback="Cancel" disableIcon />
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

// --- Signup Success Component ---
const SignupSuccess = ({ email, onGoToLogin }: { email: string, onGoToLogin: () => void }) => {
  const { get: cms } = useCMS();
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');

  const isGmail = email.toLowerCase().includes('@gmail.com') || email.toLowerCase().includes('@googlemail.com');

  const handleOpenEmail = () => {
    if (isGmail) {
      window.open('https://mail.google.com', '_blank', 'noopener,noreferrer');
    } else {
      const domain = email.split('@')[1];
      if (domain) {
        window.open(`https://${domain}`, '_blank', 'noopener,noreferrer');
      } else {
        alert("Please open your email client.");
      }
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMsg('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email
      });
      if (error) throw error;
      setResendMsg('Email sent successfully!');
    } catch (err: any) {
      setResendMsg('Failed: ' + (err.message || 'Try again later.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC] p-4 sm:p-6 text-center font-sans">
      <div className="w-full max-w-md animate-[fadeIn_0.3s_ease-out]">
        <div className="bg-white p-6 sm:p-10 rounded-3xl border border-slate-100 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.07)] relative overflow-hidden flex flex-col items-center">
          
          {/* Subtle Brand Background Glow */}
          <div className="absolute top-0 w-full h-32 bg-blue-500/5 blur-[50px] rounded-full scale-125 -z-10 pointer-events-none"></div>

          {/* Icon Badge */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-50 rounded-2xl sm:rounded-3xl border border-blue-100 flex items-center justify-center mb-6 shadow-sm">
            <CheckCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>

          {/* Heading & Subtitle */}
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0f172a] mb-2 tracking-tight">
            <EditableText contentKey="ui.signup.title" fallback="Account Created" disableIcon />
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm mb-6 leading-relaxed font-medium">
            A verification link has been sent to <br/>
            <strong className="text-[#0f172a] font-semibold">{email}</strong>
          </p>

          {/* Note Banner */}
          <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 sm:p-4 mb-6 w-full text-center">
            <p className="text-blue-700 text-[11px] sm:text-xs font-semibold tracking-wide leading-relaxed">
              <EditableText contentKey="ui.signup.verify_note" fallback="Please check your inbox and verify your account before logging in." disableIcon />
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button 
              onClick={handleOpenEmail}
              className="w-full py-3.5 sm:py-4 bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 text-xs sm:text-sm flex items-center justify-center gap-2.5 tracking-wide"
            >
               <MailIcon className="w-4 h-4" />
               {isGmail ? <EditableText contentKey="ui.signup.open_gmail" fallback="Open Gmail" disableIcon /> : <EditableText contentKey="ui.signup.open_email" fallback="Open Email Provider" disableIcon />}
            </button>

            <button 
              onClick={onGoToLogin}
              className="w-full py-3.5 sm:py-4 border border-slate-200 hover:bg-slate-50 active:scale-[0.99] text-[#0f172a] font-bold rounded-xl transition-all text-xs sm:text-sm tracking-wide"
            >
              <EditableText contentKey="ui.signup.go_login" fallback="Go to Login" disableIcon />
            </button>
          </div>

          {/* Resend Link */}
          <div className="mt-6 flex flex-col items-center gap-2">
            <button 
              onClick={handleResend}
              disabled={resending}
              className="text-slate-400 hover:text-blue-600 text-xs font-semibold tracking-wide transition-colors disabled:opacity-50"
            >
              {resending ? 'Sending...' : <EditableText contentKey="ui.signup.resend" fallback="Resend Verification Email" disableIcon />}
            </button>
            {resendMsg && (
              <p className={`text-xs font-medium ${resendMsg.includes('Failed') ? 'text-rose-500' : 'text-emerald-600'}`}>
                {resendMsg}
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

// --- Shared Mobile Menu Component ---
const SharedMobileMenu = ({
  isOpen,
  onClose,
  onDashboard,
  onLessons,
  onLeaderboard,
  activeTab = 'lessons'
}: {
  isOpen: boolean;
  onClose: () => void;
  onDashboard: () => void;
  onLessons: () => void;
  onLeaderboard?: () => void;
  activeTab?: 'dashboard' | 'lessons' | 'leaderboard';
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex md:hidden animate-[fadeIn_0.2s_ease-out]">
      <div className="absolute inset-0 bg-[#0F172A]/20 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-[280px] h-full bg-white shadow-2xl flex flex-col animate-[slideInLeft_0.3s_ease-out]">
        <div className="p-6 flex items-center justify-between border-b border-[#E2E8F0]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#3466F6] rounded-lg flex items-center justify-center text-white shrink-0">
              <BrainCircuitIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-[14px] font-bold tracking-[0.1em] text-[#0F172A] font-serif leading-none mb-0.5">SYLLOSPHERE</h1>
            </div>
          </div>
          <button onClick={onClose} className="text-[#64748B] hover:text-[#0F172A]">
            <XCircleIcon className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <button onClick={() => { onClose(); onDashboard(); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold text-sm transition-all ${activeTab === 'dashboard' ? 'bg-[#EFF6FF] text-[#3466F6]' : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'}`}>
            <LayoutDashboardIcon className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => { onClose(); onLessons(); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold text-sm transition-all ${activeTab === 'lessons' ? 'bg-[#EFF6FF] text-[#3466F6]' : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'}`}>
            <BookOpenIcon className="w-5 h-5" /> Lessons
          </button>
          <button onClick={() => { onClose(); if(onLeaderboard) onLeaderboard(); }} className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-[16px] font-bold text-sm transition-all ${activeTab === 'leaderboard' ? 'bg-[#EFF6FF] text-[#3466F6]' : 'text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A]'}`}>
            <TrophyIcon className="w-5 h-5" /> Leaderboard
          </button>
          <button onClick={() => { onClose(); window.location.hash = '#certificate'; }} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <AwardIcon className="w-5 h-5" /> Certificates
          </button>
          <button onClick={() => { onClose(); window.location.hash = '#settings'; }} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </nav>
        <div className="p-4 border-t border-[#E2E8F0]">
          <button 
            onClick={() => { onClose(); handleLogout(); }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm hover:bg-red-100 transition-colors"
          >
            <LogOutIcon className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Level Selection Component ---
const LevelSelection = ({ 
  unlockedLevels, 
  onSelectLevel, 
  onBack,
  onDashboard,
  candidateName,
  completedCount,
  totalCount,
  lessons,
  completedLessonIds,
  onLeaderboard,
  avatarUrl,
  isAdmin = false
}: { 
  unlockedLevels: string[], 
  onSelectLevel: (level: string) => void,
  onBack: () => void,
  onDashboard: () => void,
  onLeaderboard?: () => void,
  candidateName: string,
  completedCount: number,
  totalCount: number,
  lessons: Lesson[],
  completedLessonIds: number[],
  avatarUrl: string | null,
  isAdmin?: boolean
}) => {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { get: cms } = useCMS();
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

  const handleLevelClick = (level: string) => {
    if (unlockedLevels.includes(level)) {
      onSelectLevel(level);
    } else {
      setPopupMessage(cms('ui.levels.locked_msg', 'Complete the previous level to unlock this.'));
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  const getSubtitle = (lvl: string) => {
    if (lvl === 'Beginner') return 'Start your journey with the basics of logic.';
    if (lvl === 'Intermediate') return 'Build stronger thinking and problem-solving skills.';
    if (lvl === 'Advanced') return 'Tackle complex problems and advanced topics.';
    return 'Master the art of logic and become an expert.';
  };

  return (
    <div className="min-h-screen bg-[#F3F7FF] font-sans relative overflow-hidden flex flex-col">
      <Header userName={candidateName} isAdmin={isAdmin} avatarUrl={avatarUrl} />

      {/* Main Content Area - Reduced vertical padding to fit viewport */}
      <div className="flex-1 flex flex-col items-center pt-4 md:pt-6 pb-6 px-4 md:px-6 w-full z-20">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50/50 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 -z-10 pointer-events-none"></div>

      {/* --- User Personal Dashboard --- */}
      <div className="w-full max-w-5xl mx-auto mb-6 fade-in z-20">
        <div className="bg-white rounded-[16px] md:rounded-[20px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row md:items-center justify-between relative overflow-hidden">
          
          {/* Left: Avatar + Name (Mobile Top) */}
          <div className="flex items-center gap-3 md:gap-4 md:w-[30%] w-full p-5 md:p-6 pb-4 md:pb-6">
             <div className="w-[48px] h-[48px] md:w-[60px] md:h-[60px] rounded-[12px] md:rounded-[16px] bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center font-bold text-[24px] md:text-[28px] shrink-0 border border-blue-50">
               {candidateName.charAt(0).toUpperCase()}
             </div>
             <div>
               <p className="text-[8px] md:text-[9px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-1">Candidate Profile</p>
               <h3 className="text-[16px] md:text-[22px] font-bold text-[#0F172A] uppercase tracking-wide leading-none">{candidateName}</h3>
             </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-[#F1F5F9]"></div>
          <div className="md:hidden w-full h-px bg-[#F1F5F9]"></div>
          
          {/* Middle: Path (Mobile Middle) */}
          <div className="flex-1 w-full max-w-sm p-5 md:p-6 py-4 md:py-6">
            <div className="flex justify-between items-end mb-2">
              <span className="text-[8px] md:text-[9px] font-bold text-[#64748B] uppercase tracking-[0.15em]">Syllospherical Path</span>
              <span className="text-[9px] md:text-[10px] font-bold text-[#3466F6]">{Math.round((completedCount/totalCount)*100)}% Verified</span>
            </div>
            <div className="h-1.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
              <div className="h-full bg-[#3466F6] rounded-full transition-all duration-1000" style={{ width: `${(completedCount/totalCount)*100}%` }}></div>
            </div>
          </div>
          
          <div className="hidden md:block w-px h-12 bg-[#F1F5F9]"></div>
          <div className="md:hidden w-full h-px bg-[#F1F5F9]"></div>
          
          {/* Right: Verified (Mobile Bottom) */}
          <div className="flex justify-between md:justify-end w-full md:w-auto p-5 md:p-6 pt-4 md:pt-6 bg-white">
            <div className="flex-1 md:flex-none text-center flex flex-col items-center md:min-w-[70px]">
              <p className="text-[8px] md:text-[9px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-1">Verified</p>
              <p className="text-[18px] md:text-[24px] font-bold text-[#0F172A] leading-none">{completedCount} <span className="text-[12px] md:text-[14px] text-[#64748B] font-medium">/ {totalCount}</span></p>
            </div>
            
            <div className="w-px h-10 bg-[#F1F5F9] self-center md:mx-6"></div>
            
            <div className="flex-1 md:flex-none text-center flex flex-col items-center md:min-w-[70px]">
              <p className="text-[8px] md:text-[9px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-1">Status</p>
              <p className="text-[14px] md:text-[16px] font-bold text-[#3466F6] uppercase tracking-wide leading-none mt-1">{completedCount >= totalCount ? 'ADEPT' : 'INITIATE'}</p>
            </div>
          </div>
        </div>
      </div>

      <header className="text-center mb-6 fade-in z-20 w-full px-4">
        <h1 className="text-[28px] md:text-[36px] font-bold text-[#0F172A] mb-2 tracking-tight">Course Levels</h1>
        <div className="w-8 h-1 bg-[#3466F6] rounded-full mx-auto mb-3 md:hidden"></div>
        <p className="text-[13px] md:text-[15px] text-[#64748B] max-w-lg mx-auto font-medium">Master logic step by step.<br className="md:hidden" /> Complete levels and unlock advanced concepts.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 w-full max-w-5xl mx-auto z-10 fade-in px-2 md:px-0">
        {levels.map((level, index) => {
          const isUnlocked = unlockedLevels.includes(level);
          const levelLessons = lessons.filter(l => l.difficulty === level);
          const levelLessonCount = levelLessons.length;
          const completedInLevel = levelLessons.filter(l => completedLessonIds.includes(l.id)).length;
          
          let btnState = 'Locked';
          if (isUnlocked) {
            if (completedInLevel === 0) btnState = 'Start Level';
            else if (completedInLevel < levelLessonCount) btnState = 'Continue';
            else btnState = 'Completed';
          }

          return (
            <button
              key={level}
              onClick={() => isUnlocked && handleLevelClick(level)}
              className={`bg-white rounded-[16px] md:rounded-[20px] w-full transition-all duration-300 relative group text-left border border-slate-100 md:border-2
                ${isUnlocked 
                  ? 'md:border-[#3466F6] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] md:shadow-[0_10px_30px_-10px_rgba(52,102,246,0.15)] hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(52,102,246,0.2)]' 
                  : 'md:border-transparent shadow-[0_4px_15px_-4px_rgba(0,0,0,0.05)] md:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:-translate-y-1 hover:shadow-[0_10px_30px_-5px_rgba(0,0,0,0.1)]'
                }
              `}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* --- DESKTOP INNER LAYOUT (hidden on mobile) --- */}
              <div className="hidden md:flex flex-col items-center w-full p-5">
                {/* Icon */}
                <div className="relative mb-4 mt-2">
                  <div className={`w-[64px] h-[64px] rounded-full flex items-center justify-center transition-colors
                    ${isUnlocked ? 'bg-[#3466F6] text-white shadow-md shadow-blue-600/20' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#CBD5E1]'}
                  `}>
                    {isUnlocked ? <BookOpenIcon className="w-7 h-7" /> : <LockIcon className="w-7 h-7" />}
                  </div>
                  {isUnlocked && (
                     <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm z-10">
                       <CheckCircleIcon className="w-3.5 h-3.5" />
                     </div>
                  )}
                </div>
                
                <h3 className={`text-[16px] font-bold tracking-widest uppercase mb-2 
                  ${isUnlocked ? 'text-[#3466F6]' : 'text-[#0F172A]'}`
                }>
                  {level}
                </h3>
                
                <p className="text-[13px] text-[#64748B] text-center mb-5 font-medium leading-relaxed px-1 flex-1 min-h-[38px]">
                  {getSubtitle(level)}
                </p>
                
                <div className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] mb-4 text-[12px] font-bold w-full justify-center transition-colors
                  ${isUnlocked ? 'bg-[#EFF6FF] text-[#3466F6]' : 'bg-[#F8FAFC] border border-[#F1F5F9] text-[#94A3B8]'}
                `}>
                  <BookOpenIcon className="w-3.5 h-3.5" /> {levelLessonCount} Lessons
                </div>
                
                <div className={`w-full py-3 rounded-[10px] font-bold text-[13px] flex items-center justify-center gap-2 transition-all duration-300
                  ${isUnlocked 
                    ? btnState === 'Completed'
                       ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                       : 'bg-[#3466F6] text-white shadow-[0_4px_12px_rgba(52,102,246,0.2)] hover:bg-blue-700 hover:shadow-[0_6px_16px_rgba(52,102,246,0.3)]'
                    : 'bg-[#F8FAFC] border border-[#F1F5F9] text-[#94A3B8]'
                  }
                `}>
                  {btnState === 'Locked' && <LockIcon className="w-3.5 h-3.5" />}
                  {btnState}
                  {isUnlocked && btnState !== 'Completed' && <span className="ml-1">&rarr;</span>}
                  {btnState === 'Completed' && <CheckCircleIcon className="w-3.5 h-3.5" />}
                </div>
              </div>

              {/* --- MOBILE INNER LAYOUT (hidden on desktop) --- */}
              <div className={`flex md:hidden flex-row w-full items-center justify-between gap-3 p-4 border-[2.5px] rounded-[16px] transition-all duration-300
                 ${isUnlocked ? 'border-[#3466F6]' : 'border-transparent'}
              `}>
                {/* Left: Icon */}
                <div className="relative shrink-0">
                  <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center transition-colors
                    ${isUnlocked ? 'bg-[#3466F6] text-white shadow-md shadow-blue-600/20' : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#CBD5E1]'}
                  `}>
                    {isUnlocked ? <BookOpenIcon className="w-6 h-6" /> : <LockIcon className="w-6 h-6" />}
                  </div>
                  {isUnlocked && (
                     <div className="absolute -bottom-0.5 -right-0.5 bg-emerald-500 w-5 h-5 rounded-full border-[2.5px] border-white flex items-center justify-center text-white shadow-sm z-10">
                       <CheckCircleIcon className="w-3 h-3" />
                     </div>
                  )}
                </div>

                {/* Center: Title & Subtitle */}
                <div className="flex flex-col flex-1 min-w-0 pr-1">
                  <h3 className={`text-[13px] font-bold tracking-[0.1em] uppercase mb-1
                    ${isUnlocked ? 'text-[#3466F6]' : 'text-[#0F172A]'}`
                  }>
                    {level}
                  </h3>
                  <p className="text-[11px] text-[#64748B] font-medium leading-snug">
                    {getSubtitle(level)}
                  </p>
                </div>

                {/* Right: Pill & Action Button */}
                <div className="flex flex-col items-end shrink-0 gap-2">
                  <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] font-bold text-[#64748B]">
                    <BookOpenIcon className="w-3 h-3 text-[#3466F6]" /> {levelLessonCount} Lessons
                  </div>
                  
                  <div className={`py-1.5 px-3 rounded-[8px] font-bold text-[11px] flex items-center justify-center gap-1.5 min-w-[90px] transition-all duration-300
                    ${isUnlocked 
                      ? btnState === 'Completed'
                         ? 'bg-emerald-50 text-emerald-600'
                         : 'bg-[#3466F6] text-white shadow-sm'
                      : 'bg-[#F8FAFC] border border-[#E2E8F0] text-[#94A3B8]'
                    }
                  `}>
                    {btnState === 'Locked' && <LockIcon className="w-2.5 h-2.5" />}
                    {btnState}
                    {isUnlocked && btnState !== 'Completed' && <span className="ml-0.5">&rarr;</span>}
                    {btnState === 'Completed' && <CheckCircleIcon className="w-3 h-3" />}
                  </div>
                </div>
              </div>

            </button>
          );
        })}
      </div>

      <div className="w-full max-w-5xl mx-auto mt-6 bg-[#EFF6FF] rounded-[16px] p-4 md:p-5 flex items-center gap-4 fade-in z-20">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-blue-100/50 flex items-center justify-center text-[#3466F6] shrink-0 border border-blue-100">
          <ShieldCheckIcon className="w-4 h-4 md:w-5 md:h-5" />
        </div>
        <div>
          <h4 className="text-[13px] md:text-[14px] font-bold text-[#3466F6] md:text-[#0F172A] mb-0.5">Complete levels in order</h4>
          <p className="text-[12px] md:text-[13px] text-[#64748B] font-medium">You must complete the current level to unlock the next one.</p>
        </div>
      </div>
      </div>

      {popupMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-700 text-white px-10 py-4 rounded-full shadow-[0_20px_50px_rgba(0,0,0,0.2)] animate-in slide-in-from-bottom-8 fade-in duration-300 z-50 flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-800 rounded-full flex items-center justify-center shrink-0">
            <LockIcon size={16} className="text-slate-300" />
          </div>
          <span className="text-[13px] font-bold uppercase tracking-wider">{popupMessage}</span>
        </div>
      )}

    </div>
  );
};

// --- Dashboard Component (Lesson Page) ---
const Dashboard = ({ 
  candidate, 
  activeLevel,
  onSelectLesson, 
  onBackToLevels,
  onDashboard,
  completedLessonIds,
  lessons,
  isAdmin,
  onLeaderboard
}: { 
  candidate: Candidate, 
  activeLevel: string,
  onSelectLesson: (id: number) => void, 
  onBackToLevels: () => void,
  onDashboard: () => void,
  onLeaderboard?: () => void,
  completedLessonIds: number[],
  lessons: Lesson[],
  isAdmin?: boolean
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { get: cms } = useCMS();
  const levelLessons = useMemo(() => {
    return lessons.filter(l => l.difficulty === activeLevel);
  }, [activeLevel, lessons]);

  const levelLessonCount = levelLessons.length;
  const completedInLevel = levelLessons.filter(l => completedLessonIds.includes(l.id)).length;
  const progressPercentage = levelLessonCount === 0 ? 0 : Math.round((completedInLevel / levelLessonCount) * 100);
  const isLevelCompleted = completedInLevel === levelLessonCount && levelLessonCount > 0;
  
  const levelStatus = completedInLevel === 0 ? 'Not Started' : completedInLevel < levelLessonCount ? 'In Progress' : 'Completed';

  const statusColor = levelStatus === 'Completed' ? 'bg-emerald-500' : levelStatus === 'In Progress' ? 'bg-[#3466F6]' : 'bg-slate-300';
  const levelBgColor = activeLevel === 'Beginner' ? 'bg-[#3466F6]' : activeLevel === 'Intermediate' ? 'bg-purple-500' : activeLevel === 'Advanced' ? 'bg-rose-500' : 'bg-gold-500';

  return (
    <div className="min-h-screen bg-[#F3F7FF] font-sans relative overflow-hidden flex flex-col pb-20 md:pb-0">
      <Header userName={candidate.name} isAdmin={isAdmin} avatarUrl={candidate.avatarUrl} />

      {/* Abstract Background Element */}
      <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3 -z-10 pointer-events-none"></div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-5xl mx-auto pt-5 md:pt-10 px-4 md:px-0 z-20 relative fade-in">
        
        {/* Back Button */}
        <button onClick={onBackToLevels} className="flex items-center gap-2 text-[#3466F6] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.05em] md:tracking-widest mb-6 md:mb-8 hover:opacity-80 transition-opacity bg-white px-3 md:px-4 py-1.5 md:py-2 rounded-full border border-blue-100 shadow-sm w-fit">
          &larr; Course Levels
        </button>
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 md:gap-10">
          {/* Left Side: Level Info */}
          <div className="flex items-center gap-4 md:gap-6">
            <div className={`w-[72px] h-[72px] md:w-[96px] md:h-[96px] rounded-full flex items-center justify-center relative shrink-0 shadow-lg ${levelBgColor} text-white`}>
               <BookOpenIcon className="w-8 h-8 md:w-10 md:h-10" /> 
               {isLevelCompleted && (
                 <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-6 h-6 md:w-8 md:h-8 rounded-full border-[3px] border-white flex items-center justify-center text-white shadow-sm z-10">
                   <CheckCircleIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
                 </div>
               )}
            </div>
            <div>
              <p className="text-[10px] md:text-[11px] font-bold text-[#3466F6] uppercase tracking-[0.2em] mb-1">{activeLevel} Level</p>
              <h1 className="text-[32px] md:text-[44px] font-bold text-[#0F172A] leading-none tracking-tight mb-3 md:mb-4">{activeLevel}</h1>
              
              <div className="flex flex-wrap items-center gap-2 md:gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white border border-[#E2E8F0] text-[#64748B] text-[11px] md:text-[12px] font-bold shadow-sm">
                  <BookOpenIcon className="w-3.5 h-3.5 text-[#3466F6]" /> {levelLessonCount} Lessons
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] bg-white border border-[#E2E8F0] text-[#64748B] text-[11px] md:text-[12px] font-bold shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${statusColor}`}></div> <span className="hidden md:inline">Level Status: </span>{levelStatus}
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Progress Card */}
          <div className="bg-white rounded-[16px] md:rounded-[24px] p-5 md:p-6 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex items-center gap-6 md:gap-10 w-full md:w-[400px] shrink-0 mt-2 md:mt-0">
             <div className="flex-1">
               <p className="text-[9px] md:text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-1 md:mb-2">Level Progress</p>
               <h2 className="text-[28px] md:text-[32px] font-bold text-[#0F172A] leading-none mb-1">{progressPercentage}%</h2>
               <p className="text-[11px] md:text-[12px] font-bold text-[#0F172A] mb-3 md:mb-4">{completedInLevel} of {levelLessonCount} lessons completed</p>
               <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden">
                 <div className="h-full bg-[#3466F6] rounded-full transition-all duration-1000" style={{ width: `${progressPercentage}%` }}></div>
               </div>
             </div>
             <div className="shrink-0 relative w-[72px] h-[72px] md:w-[88px] md:h-[88px]">
                {/* SVG Circular Progress Ring */}
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#3466F6" strokeWidth="8" strokeDasharray={`${2 * Math.PI * 40}`} strokeDashoffset={`${2 * Math.PI * 40 * (1 - progressPercentage / 100)}`} strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center font-bold text-[16px] md:text-[20px] text-[#0F172A]">
                  {progressPercentage}%
                </div>
             </div>
          </div>
        </div>

        {/* Lessons Timeline Section */}
        <div className="mt-10 md:mt-16 w-full">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 md:mb-8">
            <h2 className="text-[20px] md:text-[24px] font-bold text-[#0F172A] mb-1 md:mb-0">Lessons</h2>
            <p className="text-[11px] md:text-[12px] font-medium text-[#64748B] md:text-right">Complete lessons in order to<br className="md:hidden" /> unlock the next one.</p>
          </div>

          <div className="relative pb-6">
            {/* Vertical Timeline Line */}
            <div className="absolute left-[15px] md:left-[23px] top-[24px] bottom-[24px] w-px border-l-2 border-dashed border-[#CBD5E1] -z-10"></div>

            <div className="flex flex-col gap-4 md:gap-5">
              {levelLessons.map((lesson, idx) => {
                const isCompleted = completedLessonIds.includes(lesson.id);
                const isUnlocked = isAdmin || idx === 0 || completedLessonIds.includes(levelLessons[idx - 1].id);
                
                let lessonStatus = 'Locked';
                if (isUnlocked) {
                   lessonStatus = isCompleted ? 'Completed' : 'In Progress';
                }
                
                const isCurrent = lessonStatus === 'In Progress';

                return (
                  <div key={lesson.id} className="flex items-start md:items-center gap-4 md:gap-6 w-full group">
                    {/* Timeline Node */}
                    <div className={`w-[32px] h-[32px] md:w-[48px] md:h-[48px] mt-2 md:mt-0 rounded-full flex items-center justify-center shrink-0 text-[12px] md:text-[14px] font-bold shadow-sm transition-colors ${
                      isCurrent ? 'bg-[#3466F6] text-white shadow-blue-500/30' :
                      isCompleted ? 'bg-[#3466F6] text-white' :
                      'bg-[#94A3B8] text-white'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Lesson Card */}
                    <div className="bg-white rounded-[16px] md:rounded-[20px] p-4 md:p-6 shadow-[0_4px_15px_-4px_rgba(0,0,0,0.03)] border border-slate-100 flex-1 flex flex-row items-center justify-between gap-3 md:gap-6 transition-all duration-300 hover:shadow-[0_8px_25px_-5px_rgba(0,0,0,0.06)] hover:-translate-y-0.5 w-full overflow-hidden">
                      
                      {/* Left: Icon + Title */}
                      <div className="flex items-center gap-3 md:gap-6 flex-1 min-w-0 h-full">
                         <div className={`hidden md:flex w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-[12px] md:rounded-[16px] items-center justify-center shrink-0 ${
                           isUnlocked ? 'bg-[#EFF6FF] text-[#3466F6]' : 'bg-[#F8FAFC] text-[#CBD5E1] border border-[#E2E8F0]'
                         }`}>
                           {!isUnlocked ? <LockIcon className="w-5 h-5 md:w-8 md:h-8" /> : 
                            idx % 2 === 0 ? <span className="font-bold text-[12px] md:text-[18px]">A&rarr;B</span> :
                            <BrainCircuitIcon className="w-5 h-5 md:w-8 md:h-8" />}
                         </div>

                         <div className="flex flex-col flex-1 min-w-0 pr-1 md:pr-2">
                           <p className="hidden md:block text-[9px] md:text-[10px] font-bold text-[#64748B] uppercase tracking-[0.15em] mb-1">Lesson {idx + 1}</p>
                           <h3 className={`text-[13px] md:text-[16px] font-bold leading-snug truncate ${isUnlocked ? 'text-[#0F172A]' : 'text-[#0F172A]'}`}>
                             {lesson.title}
                           </h3>
                         </div>
                      </div>

                      {/* Right: Status Pill + Action */}
                      <div className="flex flex-col md:flex-row items-end md:items-center justify-between md:justify-end gap-2 md:gap-8 shrink-0 h-full">
                         
                         {/* Status Pill */}
                         {isCompleted && (
                           <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] md:text-[11px] font-bold border border-emerald-100">
                             <CheckCircleIcon className="w-3 h-3 md:w-3.5 md:h-3.5" /> Completed
                           </div>
                         )}
                         {isCurrent && (
                           <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-blue-50 text-[#3466F6] text-[9px] md:text-[11px] font-bold border border-blue-100">
                             <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full border-[1.5px] md:border-2 border-[#3466F6]"></div> In Progress
                           </div>
                         )}
                         {!isUnlocked && (
                           <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-0.5 md:py-1 rounded-full bg-slate-50 text-[#94A3B8] text-[9px] md:text-[11px] font-bold border border-slate-200">
                             <LockIcon className="w-2.5 h-2.5 md:w-3 md:h-3" /> Locked
                           </div>
                         )}

                         {/* Action Container */}
                         <div className="flex items-center gap-2 md:gap-4 mt-auto md:mt-0">
                           <div className={`text-[10px] md:text-[13px] font-bold whitespace-nowrap ${isUnlocked ? 'text-[#0F172A]' : 'text-[#64748B]'}`}>+{lesson.base_xp || 20} XP</div>
                           
                           {/* Action Button */}
                           <button 
                             onClick={() => isUnlocked && onSelectLesson(lesson.id)}
                             disabled={!isUnlocked}
                             className={`flex items-center justify-center gap-1.5 rounded-[8px] md:rounded-[10px] text-[11px] md:text-[13px] font-bold transition-all ${
                               isCurrent ? 'bg-[#3466F6] text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 py-1.5 md:py-2 px-3 md:px-4 min-w-[80px] md:min-w-[110px]' :
                               isCompleted ? 'bg-transparent text-[#94A3B8] hover:text-[#0F172A] py-1 md:py-2 pl-0.5 pr-1 md:px-2 min-w-0' :
                               'bg-transparent text-[#94A3B8] py-1 md:py-2 pl-0.5 pr-1 md:px-2 min-w-0 cursor-not-allowed'
                             }`}
                           >
                             {isCurrent ? 'Continue \u2192' : <span className="text-[14px] md:text-[16px]">&rsaquo;</span>}
                           </button>
                         </div>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Completion Card */}
        <div className="w-full mt-6 md:mt-10 mb-8 md:mb-16">
          <div className="bg-white rounded-[16px] md:rounded-[20px] p-5 md:p-6 lg:p-8 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10 relative overflow-hidden">
            <div className="flex items-center gap-4 md:gap-6 w-full">
              <div className="w-[48px] h-[48px] md:w-[64px] md:h-[64px] rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                <ShieldCheckIcon className="w-6 h-6 md:w-8 md:h-8" />
              </div>
              <div>
                <h3 className="text-[14px] md:text-[18px] font-bold text-[#3466F6] mb-1">
                  {isLevelCompleted ? 'Congratulations!' : 'Complete all lessons to advance'}
                </h3>
                <p className="text-[11px] md:text-[13px] text-[#64748B] font-medium leading-relaxed">
                  {isLevelCompleted 
                    ? `You have successfully completed all ${levelLessonCount} lessons in the ${activeLevel} level.` 
                    : `Finish all ${levelLessonCount} lessons in the ${activeLevel} level to unlock ${activeLevel === 'Beginner' ? 'Intermediate' : activeLevel === 'Intermediate' ? 'Advanced' : activeLevel === 'Advanced' ? 'Master' : 'the final'} level.`
                  }
                </p>
              </div>
            </div>
            
            {/* Graphic Placehoder */}
            <div className="w-full md:w-[150px] h-[80px] md:h-[100px] shrink-0 bg-gradient-to-t from-blue-100 to-blue-50 rounded-xl border border-blue-100 flex items-center justify-center overflow-hidden relative">
              <span className="text-[32px] md:text-[40px] drop-shadow-md relative z-10">🏆</span>
              <div className="absolute w-2 h-2 bg-yellow-400 rounded-sm top-4 left-6 rotate-12"></div>
              <div className="absolute w-1.5 h-1.5 bg-blue-400 rounded-sm top-8 left-12 -rotate-12"></div>
              <div className="absolute w-2 h-2 bg-green-400 rounded-sm top-6 right-8 rotate-45"></div>
              <div className="absolute w-1.5 h-1.5 bg-pink-400 rounded-sm top-12 right-12 -rotate-12"></div>
              {/* Podium Base */}
              <div className="absolute bottom-0 w-16 h-6 bg-blue-400 z-0 flex flex-col">
                 <div className="h-2 w-full bg-blue-300"></div>
                 <div className="h-4 w-full bg-blue-500"></div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};



// --- Lesson View Component ---
const LessonView = ({ lesson, candidate, onBack, onDashboard, onComplete, onLeaderboard }: { lesson: Lesson; candidate: Candidate; onBack: () => void; onDashboard: () => void; onComplete: () => void; onLeaderboard?: () => void }) => {
  const { get: cms, updateContent, isAdmin, data: cmsData } = useCMS();
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [content, setContent] = useState<LessonContent | null>(lesson.content || null);
  
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(() => {
     const cmsQuiz = cmsData[`lesson.${lesson.id}.quiz`];
     if (cmsQuiz) {
         try { return JSON.parse(cmsQuiz); } catch(e) {}
     }
     return lesson.quiz || null;
  });

  useEffect(() => {
     const cmsQuiz = cmsData[`lesson.${lesson.id}.quiz`];
     if (cmsQuiz) {
         try { 
             const parsed = JSON.parse(cmsQuiz);
             setQuiz(prev => JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev);
         } catch(e) {}
     } else if (lesson.quiz) {
         setQuiz(prev => JSON.stringify(prev) !== JSON.stringify(lesson.quiz) ? lesson.quiz : prev);
     }
  }, [cmsData, lesson.id, lesson.quiz]);

  const [chatService, setChatService] = useState<GeminiService.ChatService | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [loadingStates, setLoadingStates] = useState({ 
    content: !lesson.content, 
    quiz: !lesson.quiz && activeTab === 'quiz' && !cmsData[`lesson.${lesson.id}.quiz`],
  });
  const [errors, setErrors] = useState({ content: false, quiz: false });

  const fetchContent = useCallback(async () => {
    if (lesson.content) {
        setContent(lesson.content);
        setLoadingStates(s => ({ ...s, content: false }));
        return;
    }
    setLoadingStates(s => ({ ...s, content: true }));
    setErrors(e => ({ ...e, content: false }));
    try {
      const data = await GeminiService.generateLessonContent(lesson.topic, lesson.description);
      setContent(data);
    } catch (err) {
      setErrors(e => ({ ...e, content: true }));
    } finally {
      setLoadingStates(s => ({ ...s, content: false }));
    }
  }, [lesson]);

  const fetchQuiz = useCallback(async () => {
    // Check SMS first for customized overrides
    const cmsQuiz = cmsData[`lesson.${lesson.id}.quiz`];
    if (cmsQuiz) {
       try {
           setQuiz(JSON.parse(cmsQuiz));
           setLoadingStates(s => ({ ...s, quiz: false }));
           return;
       } catch(e) {}
    }

    if (lesson.quiz) {
        setQuiz(lesson.quiz);
        setLoadingStates(s => ({ ...s, quiz: false }));
        return;
    }
    setLoadingStates(s => ({ ...s, quiz: true }));
    setErrors(e => ({ ...e, quiz: false }));
    try {
      const data = await GeminiService.generateQuiz(lesson.topic);
      setQuiz(data);
    } catch (err) {
      setErrors(e => ({ ...e, quiz: true }));
    } finally {
      setLoadingStates(s => ({ ...s, quiz: false }));
    }
  }, [lesson, cmsData]);

  useEffect(() => { 
    if (!content && !loadingStates.content && !errors.content) fetchContent(); 
  }, [fetchContent, content, loadingStates.content, errors.content]);

  useEffect(() => {
    if (activeTab === 'quiz' && !quiz && !loadingStates.quiz && !errors.quiz) fetchQuiz();
    if (activeTab === 'tutor' && !chatService) setChatService(new GeminiService.ChatService());
  }, [activeTab, quiz, chatService, fetchQuiz, loadingStates.quiz, errors.quiz]);

  const processHtml = (html: string) => {
    if (!html) return html;
    return html.replace(/<h2([^>]*)>\s*(\d+)\.\s*(.*?)<\/h2>/g, '<h2$1><span class="section-number bg-[#3466F6] text-white w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-sm md:text-lg font-bold shrink-0 shadow-md">$2</span> <span class="section-title">$3</span></h2>');
  };

  return (
    <div className={`min-h-screen bg-[#F8FAFC] font-sans relative overflow-hidden flex flex-col pb-20 md:pb-0 transition-all duration-500`}>
      
      {/* Top Header */}
      {!focusMode && (
        <Header userName={candidate.name} isAdmin={isAdmin} avatarUrl={candidate.avatarUrl} />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 w-full ${focusMode ? 'max-w-4xl' : 'max-w-[1200px]'} mx-auto px-4 md:px-8 pt-5 md:pt-12 pb-12 transition-all duration-500`}>
        
        {!focusMode && (
          <div className="mb-8">
            <button onClick={onBack} className="flex items-center gap-2 text-[#3466F6] font-bold text-sm hover:opacity-80 transition-opacity">
              <ArrowLeftIcon className="w-4 h-4" /> Back to Lessons
            </button>
          </div>
        )}

          <div className="flex flex-col md:flex-row gap-6 md:gap-12 items-start md:items-center justify-between mb-12">
            <div className="flex gap-4 md:gap-6 items-center">
               <div className="w-16 h-16 md:w-24 md:h-24 bg-[#3466F6] rounded-full flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                  <BookOpenIcon className="w-8 h-8 md:w-12 md:h-12" />
               </div>
               <div>
                  <h3 className="text-[#64748B] font-bold tracking-[0.15em] text-[10px] md:text-xs uppercase mb-1">Lesson {lesson.id}</h3>
                  <h1 className="text-2xl md:text-5xl font-bold text-[#0F172A] mb-2 md:mb-4">{lesson.title}</h1>
                  <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#3466F6] rounded-full text-[10px] md:text-xs font-bold border border-blue-100">
                    <div className="w-2 h-2 rounded-full bg-[#3466F6]"></div>
                    {lesson.difficulty} Level
                  </span>
               </div>
            </div>

            <div className="flex p-1 bg-[#F1F5F9] rounded-[20px] shrink-0 w-full md:w-[400px]">
               <TabButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BookOpenIcon className="w-4 h-4" />} label={cms('ui.tabs.theory', 'Theory')} />
               <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<ShieldCheckIcon className="w-4 h-4" />} label={cms('ui.tabs.validate', 'Validate')} />
               <TabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquareIcon className="w-4 h-4" />} label={cms('ui.tabs.consult', 'Consult')} />
            </div>
          </div>

        {/* Active Tab Content */}
        <div className="w-full relative">
          
          {focusMode && (
            <button 
              onClick={() => setFocusMode(false)}
              className="absolute top-0 right-0 p-2 text-slate-400 hover:text-[#3466F6] transition-colors z-20"
              title="Exit Focus Mode"
            >
              <XCircleIcon className="w-6 h-6" />
            </button>
          )}
          
          {activeTab === 'learn' && (
            <div className="fade-in max-w-4xl mx-auto h-full light-lesson-theme">
              {loadingStates.content ? <LoadingState message={cms('ui.lesson.loading', 'Decoding verification protocols...')} /> :
               errors.content ? <ErrorRetry onRetry={fetchContent} /> :
               content ? <>
                  {!focusMode && (
                    <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-100 shadow-sm mb-8 flex flex-col md:flex-row gap-6 items-start">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center text-[#3466F6] shrink-0">
                            <LightbulbIcon className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <h3 className="text-[#3466F6] font-bold text-lg mb-2">Logic Summary</h3>
                            <p className="text-[#64748B] md:text-lg leading-relaxed italic">
                              <EditableText contentKey={`lesson.${lesson.id}.summary`} fallback={`"${content.summary}"`} />
                            </p>
                        </div>
                        <button onClick={() => setFocusMode(true)} className="px-5 py-3 bg-slate-50 text-[#64748B] text-[11px] font-bold uppercase tracking-widest rounded-xl border border-slate-200 hover:bg-slate-100 hover:text-[#0F172A] transition-all flex items-center gap-2 shrink-0 w-full md:w-auto justify-center">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" /></svg>
                          Enter Focus Mode
                        </button>
                    </div>
                  )}
                  
                  <EditableHTML 
                    contentKey={`lesson.${lesson.id}.htmlContent`} 
                    fallbackHTML={processHtml(content.htmlContent)}
                    className={`markdown-content text-slate-300 ${focusMode ? 'prose-lg' : ''}`} 
                  />
                  
                  {lesson.id === 18 && (
                    <div className="mt-12 pt-12 border-t border-slate-200">
                      <SyllogismValidator />
                    </div>
                  )}
               </> : <div className="flex items-center justify-center h-full"><button onClick={fetchContent} className="text-[#3466F6] uppercase font-bold text-xs tracking-widest">Re-Initialize Link</button></div>}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="relative fade-in max-w-[900px] mx-auto h-full min-h-[500px]">
               {isAdmin && quiz && !loadingStates.quiz && (
                <div className="absolute -top-16 right-0 z-10 flex gap-2">
                   <button 
                     onClick={() => setIsEditingQuiz(!isEditingQuiz)} 
                     className="text-[10px] bg-white text-[#64748B] px-4 py-2 rounded-xl hover:bg-slate-50 font-bold uppercase tracking-widest border border-slate-200 shadow-sm"
                   >
                      {isEditingQuiz ? 'Preview Quiz' : 'Edit Quiz'}
                   </button>
                </div>
              )}
              {loadingStates.quiz ? <LoadingState message={cms('ui.quiz.loading', 'Generating integrity checks...')} /> :
               errors.quiz ? <ErrorRetry onRetry={fetchQuiz} /> :
               isEditingQuiz && quiz ? <AdminQuizEditor initialQuiz={quiz} onSave={async (newQuiz) => {
                    setQuiz(newQuiz);
                    setIsEditingQuiz(false);
                    updateContent(`lesson.${lesson.id}.quiz`, JSON.stringify(newQuiz));
                  }} onCancel={() => setIsEditingQuiz(false)} /> :
               quiz ? <QuizInterface questions={quiz} onComplete={onComplete} onContinue={onBack} /> : null}
            </div>
          )}

          {activeTab === 'tutor' && (
            <div className="relative fade-in max-w-[1300px] mx-auto md:h-[calc(100vh-200px)] md:min-h-[500px] md:max-h-[800px]">
              <LiveConsultInterface lesson={lesson} candidateName={candidate.name} />
            </div>
          )}
          
        </div>

        {/* Reset Tool for stuck sessions */}
        <div className="mt-12 flex justify-center">
            <button 
              onClick={() => {
                  setLoadingStates({ content: false, quiz: false });
                  setErrors({ content: false, quiz: false });
                  setContent(null);
                  setQuiz(null);
                  fetchContent();
              }}
              className="px-6 py-3 bg-blue-50 text-[#3466F6] hover:bg-[#3466F6] hover:text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center gap-2"
            >
                <LoaderIcon className="w-3 h-3" />
                <EditableText contentKey="ui.lesson.reset_btn" fallback="Recycle Logical Stream" />
            </button>
        </div>
      </main>
    </div>
  );
};

const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`flex flex-col md:flex-row items-center justify-center gap-1.5 md:gap-2 py-2 md:py-3.5 rounded-[16px] text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 flex-1 ${active ? 'bg-white text-[#3466F6] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A] hover:bg-white/50'}`}>
    {icon}<span className="whitespace-nowrap">{label}</span>
  </button>
);

const LoadingState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-gold-400 gap-6">
    <div className="relative"><div className="absolute inset-0 bg-gold-500/20 blur-xl rounded-full animate-pulse"></div><LoaderIcon className="w-12 h-12 relative z-10" /></div>
    <p className="font-mono text-[10px] tracking-[0.3em] uppercase animate-pulse text-center max-w-[250px]">{message}</p>
    <div className="w-32 h-0.5 bg-slate-800 rounded-full overflow-hidden">
        <div className="h-full bg-gold-500 animate-loading-bar"></div>
    </div>
  </div>
);

const ErrorRetry = ({ onRetry }: { onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-rose-500/80 gap-6 text-center">
    <XCircleIcon className="w-10 h-10" />
    <div className="space-y-2">
        <p className="font-mono text-xs uppercase tracking-widest font-bold">Protocol Breach / Uplink Error</p>
        <p className="text-[10px] text-slate-500 max-w-xs">Failed to synchronize with the logic sphere. Please re-authenticate your request.</p>
    </div>
    <button onClick={onRetry} className="bg-rose-900/20 border border-rose-500/30 text-rose-400 px-8 py-3 rounded-xl text-xs font-bold hover:bg-rose-900/40 transition-all uppercase tracking-widest shadow-lg shadow-rose-900/10">Re-verify Link</button>
  </div>
);

const QuizInterface = ({ questions, onComplete, onContinue }: { questions: QuizQuestion[]; onComplete: () => void; onContinue?: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);
  const { get: cms } = useCMS();

  const question = questions[currentIndex];

  useEffect(() => {
    if (question?.type === 'word-bank' && question.wordBank) {
      setAvailableWords([...question.wordBank]);
      setSelectedWords([]);
    }
    setShowResult(false);
    setSelectedOption(null);
  }, [currentIndex, question]);

  const handleSelectOption = (idx: number) => {
    if (showResult) return;
    setSelectedOption(idx);
  };

  const handleCheckValidation = () => {
    if (showResult) return;
    const correct = selectedOption === question.correctAnswer;
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
  };

  const handleWordClick = (word: string, index: number) => {
    if (showResult) return;
    setSelectedWords([...selectedWords, word]);
    const newAvailable = [...availableWords];
    newAvailable.splice(index, 1);
    setAvailableWords(newAvailable);
  };

  const handleRemoveWord = (word: string, index: number) => {
    if (showResult) return;
    const newSelected = [...selectedWords];
    newSelected.splice(index, 1);
    setSelectedWords(newSelected);
    setAvailableWords([...availableWords, word]);
  };

  const handleCheckWordBank = () => {
    if (showResult) return;
    const correct = JSON.stringify(selectedWords) === JSON.stringify(question.correctSequence);
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (!isCorrect) {
      // Incorrect -> Retry logic
      setShowResult(false);
      setSelectedOption(null);
      setSelectedWords([]);
      if (question?.type === 'word-bank' && question.wordBank) {
        setAvailableWords([...question.wordBank]);
      }
      return;
    }
    
    // Correct -> Progress logic
    setShowResult(false);
    setSelectedOption(null);
    if (currentIndex === questions.length - 1) {
      onComplete();
    }
    setCurrentIndex(prev => prev + 1);
  };

  if (currentIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center fade-in py-20">
        <div className="w-24 h-24 bg-[#F0FDF4] rounded-full flex items-center justify-center mb-6">
           <CheckCircleIcon className="w-12 h-12 text-[#10B981]" />
        </div>
        <h3 className="text-3xl font-bold text-[#0F172A] mb-3">Validation Complete</h3>
        <p className="text-[#64748B] mb-8 text-lg">Ready for next lesson. You successfully demonstrated your understanding.</p>
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {onContinue && (
              <button onClick={() => { onContinue(); }} className="bg-[#3466F6] hover:bg-blue-700 text-white px-10 py-4 rounded-2xl font-bold transition-all shadow-md w-full md:w-auto text-[13px] uppercase tracking-wider">
                Continue to Next Lesson
              </button>
            )}
            <button onClick={() => { setCurrentIndex(0); setScore(0); }} className="bg-white border border-slate-200 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] px-10 py-4 rounded-2xl font-bold transition-all shadow-sm w-full md:w-auto text-[13px] uppercase tracking-wider">
              Review Answers
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative font-sans">
      
      {/* Header Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm mb-8 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#EFF6FF] text-[#3466F6] rounded-2xl flex items-center justify-center shrink-0 border border-[#DBEAFE]">
             <ShieldCheckIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-[#0F172A] mb-1">Knowledge Validation</h2>
            <p className="text-[#64748B] text-sm">Answer all questions correctly to demonstrate your understanding before moving to the next lesson.</p>
          </div>
        </div>
        <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl px-5 py-3 text-center shrink-0 hidden md:block">
           <span className="block text-[10px] uppercase font-bold text-[#64748B] mb-1">Question</span>
           <span className="block font-bold text-[#3466F6] text-lg leading-none">{currentIndex + 1} <span className="text-[#94A3B8] text-sm">of {questions.length}</span></span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        {/* Question Text */}
        <div className="mb-10 flex gap-4 md:gap-6 items-start px-2">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-[#3466F6] text-white rounded-full flex items-center justify-center font-bold text-lg shrink-0 shadow-md">
            {currentIndex + 1}
          </div>
          <h3 className="text-2xl md:text-[28px] font-bold text-[#0F172A] pt-1">
            {question.type === 'word-bank' ? 'Tap what you hear' : question.question}
          </h3>
        </div>

        {question.type === 'word-bank' ? (
          <div className="flex flex-col flex-1">
            {/* Character and Audio */}
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 bg-[#EFF6FF] rounded-full flex items-center justify-center relative">
                <BrainCircuitIcon className="w-12 h-12 text-[#3466F6]" />
                <div className="absolute -right-2 top-0 bg-white border border-slate-200 p-2 rounded-xl shadow-lg">
                   <div className="flex gap-2">
                      <button className="p-2 bg-[#3466F6] rounded-lg text-white hover:bg-blue-600 transition-colors">
                        <Volume2Icon size={20} />
                      </button>
                      <button className="p-2 bg-slate-100 rounded-lg text-slate-500 hover:text-[#0F172A] transition-colors">
                        <TurtleIcon size={20} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="flex-1 p-4 bg-white rounded-2xl border border-slate-200 relative shadow-sm">
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-white"></div>
                <p className="text-[#64748B] italic text-sm">"Listen carefully to the logical sequence..."</p>
              </div>
            </div>

            {/* Selection Area */}
            <div className="min-h-[100px] border-y border-slate-200 py-6 mb-8 flex flex-wrap gap-2 items-center">
              {selectedWords.map((word, idx) => (
                <button 
                  key={`selected-${idx}`}
                  onClick={() => handleRemoveWord(word, idx)}
                  className="px-4 py-2 bg-white border border-[#3466F6] text-[#3466F6] rounded-xl text-sm font-medium hover:bg-blue-50 transition-all shadow-sm"
                >
                  {word}
                </button>
              ))}
              {selectedWords.length === 0 && (
                <div className="w-full text-center text-[#94A3B8] font-mono text-[10px] uppercase tracking-widest">Select words below</div>
              )}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {availableWords.map((word, idx) => (
                <button 
                  key={`bank-${idx}`}
                  onClick={() => handleWordClick(word, idx)}
                  className="px-5 py-3 bg-white border border-slate-200 text-[#334155] rounded-xl text-sm font-medium hover:border-[#3466F6] hover:text-[#3466F6] active:scale-95 transition-all shadow-sm"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {question.options.map((opt, idx) => {
              let styles = "border-slate-200 bg-white hover:border-[#93C5FD] hover:bg-[#EFF6FF]";
              let circleStyles = "bg-[#F8FAFC] border-slate-200 text-[#64748B] group-hover:border-[#93C5FD] group-hover:bg-white group-hover:text-[#3466F6]";
              
              if (showResult) {
                if (idx === question.correctAnswer) {
                   styles = "border-emerald-200 bg-[#F0FDF4]";
                   circleStyles = "bg-[#10B981] border-[#10B981] text-white";
                }
                else if (idx === selectedOption) {
                   styles = "border-rose-200 bg-[#FEF2F2]";
                   circleStyles = "bg-[#EF4444] border-[#EF4444] text-white";
                }
                else {
                   styles = "border-slate-100 bg-white opacity-50 grayscale";
                }
              } else if (selectedOption === idx) {
                 styles = "border-[#3466F6] bg-[#EFF6FF] ring-1 ring-[#3466F6]";
                 circleStyles = "bg-[#3466F6] border-[#3466F6] text-white";
              }
              
              return (
                <button key={idx} onClick={() => handleSelectOption(idx)} disabled={showResult} className={`w-full text-left p-5 rounded-2xl border transition-all duration-200 group flex items-center shadow-sm ${styles}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mr-5 border transition-colors shrink-0 ${circleStyles}`}>
                     {String.fromCharCode(65 + idx)}
                  </div>
                  <span className={`text-[17px] font-semibold ${selectedOption === idx ? 'text-[#0F172A]' : 'text-[#334155]'}`}>{opt}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Area */}
        <div className="mt-8 mb-4">
          {!showResult ? (
            <div className="flex flex-col md:flex-row items-center justify-between bg-[#F8FAFC] p-4 rounded-2xl border border-slate-200 gap-4">
               <div className="flex items-center gap-3 text-[#64748B] px-2 text-sm font-semibold">
                  <LightbulbIcon className="w-5 h-5 text-[#3466F6]" />
                  Take your time. You can review the theory section anytime.
               </div>
               <button 
                 onClick={question.type === 'word-bank' ? handleCheckWordBank : handleCheckValidation}
                 disabled={question.type === 'word-bank' ? selectedWords.length === 0 : selectedOption === null}
                 className={`w-full md:w-auto px-10 py-4 rounded-[14px] font-bold uppercase tracking-wider text-[11px] transition-all flex items-center justify-center gap-2 ${
                   (question.type === 'word-bank' ? selectedWords.length > 0 : selectedOption !== null)
                   ? 'bg-[#E2E8F0] text-[#64748B] hover:bg-[#CBD5E1] hover:text-[#0F172A]' 
                   : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                 }`}
               >
                 <LockIcon className="w-4 h-4" /> Submit Answers
               </button>
            </div>
          ) : (
            <div className={`p-6 md:p-8 rounded-3xl border flex flex-col md:flex-row gap-6 items-center justify-between animate-in slide-in-from-bottom-4 duration-300 ${isCorrect ? 'border-emerald-200 bg-[#F0FDF4]' : 'border-rose-200 bg-[#FEF2F2]'}`}>
              <div className="flex items-center gap-5 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 ${isCorrect ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEE2E2] text-[#DC2626]'}`}>
                  {isCorrect ? <CheckCircleIcon className="w-7 h-7" /> : <XCircleIcon className="w-7 h-7" />}
                </div>
                <div>
                  <h4 className={`font-bold text-xl mb-1 ${isCorrect ? 'text-[#059669]' : 'text-[#DC2626]'}`}>
                    {isCorrect ? 'Excellent!' : 'Incorrect'}
                  </h4>
                  <p className="text-[#475569] text-sm leading-relaxed max-w-md">{question.explanation}</p>
                </div>
              </div>
              <button 
                onClick={handleNext} 
                className={`w-full md:w-auto px-12 py-4 rounded-2xl font-bold uppercase tracking-widest transition-all text-xs text-white shrink-0 shadow-lg ${
                  isCorrect ? 'bg-[#10B981] hover:bg-[#059669] shadow-emerald-500/20' : 'bg-[#EF4444] hover:bg-[#DC2626] shadow-rose-500/20'
                }`}
              >
                {isCorrect ? 'Continue' : 'Retry Question'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const { isAdmin } = useCMS();
  const [view, setView] = useState<AppView>('landing');
  const [candidate, setCandidate] = useState<Candidate>({ name: '', level: 'Novice', avatarUrl: null });
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [activeLevel, setActiveLevel] = useState<string>('Beginner');
  const [isSyncing, setIsSyncing] = useState(false);
  const [authModal, setAuthModal] = useState<AuthModalMode>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const currentUserIdRef = useRef<string | null>(null);
  const [certificateUnlocked, setCertificateUnlocked] = useState(false);
  const [certificateData, setCertificateData] = useState<any>(null);

  // ── Restore session on page load ────────────────────────────────────────
  const loadProgressFromSupabase = async (providedUserId?: string) => {
    setIsSyncing(true);
    try {
      let targetUserId = providedUserId;
      if (!targetUserId) {
        const { data: { session } } = await supabase.auth.getSession();
        targetUserId = session?.user?.id;
      }
      if (!targetUserId) return;

      const { data, error } = await supabase
        .from('user_progress')
        .select('completed_lessons, certificate_unlocked, certificate_id, completion_date, course_name, issued_by')
        .eq('user_id', targetUserId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase load error:', error);
      } else if (data) {
        if (data.completed_lessons) setCompletedLessonIds(data.completed_lessons);
        
        // Auto-mint certificate if missed during a previous completion event
        const totalRequiredLessons = lessons.length > 0 ? lessons.length : 18;
        if (data.completed_lessons && data.completed_lessons.length >= totalRequiredLessons && !data.certificate_unlocked && !data.certificate_id) {
          const newCertId = `SYL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
          const newDate = new Date().toISOString();
          
          setCertificateUnlocked(true);
          setCertificateData({
            certificate_id: newCertId,
            completion_date: newDate,
            course_name: 'Syllogism',
            issued_by: 'Syllosphere Learning Platform'
          });

          // Update the newly minted certificate to guarantee it's saved
          await supabase.from('user_progress').update({
            updated_at: new Date().toISOString(),
            certificate_unlocked: true,
            certificate_id: newCertId,
            completion_date: newDate,
            course_name: 'Syllogism',
            issued_by: 'Syllosphere Learning Platform'
          }).eq('user_id', targetUserId);
          
        } else {
          setCertificateUnlocked(data.certificate_unlocked || false);
          if (data.certificate_id) {
            setCertificateData({
              certificate_id: data.certificate_id,
              completion_date: data.completion_date,
              course_name: data.course_name,
              issued_by: data.issued_by
            });
          }
        }
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Supabase: Lesson complete ആകുമ്പോൾ save ചെയ്യുക
  const saveProgressToSupabase = async (newCompletedIds: number[], isUnlockEvent: boolean = false) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) return;

      const totalRequiredLessons = lessons.length > 0 ? lessons.length : 18;
      
      // 1. Fetch latest state immediately before updating to avoid race conditions
      const { data: existingProgress, error: fetchError } = await supabase
        .from('user_progress')
        .select('completed_lessons, certificate_unlocked, certificate_id, completion_date, course_name, issued_by, user_name, avatar_url')
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('Failed to fetch existing progress:', fetchError);
        // Continue but do not merge to prevent total failure, though typically we should abort
      }

      // 2. Safely merge completed lessons to ensure progress only goes forward
      const existingLessons: number[] = existingProgress?.completed_lessons || [];
      const mergedCompletedIds = Array.from(new Set([...existingLessons, ...newCompletedIds]));

      let certUpdates = {};
      
      // 3. Isolate Certificates - strictly preserve existing certificate if one exists in DB
      const hasDBCert = existingProgress?.certificate_unlocked || existingProgress?.certificate_id;
      
      if (isUnlockEvent && mergedCompletedIds.length >= totalRequiredLessons && !certificateUnlocked && !certificateData && !hasDBCert) {
        const newCertId = `SYL-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
        const newDate = new Date().toISOString();
        
        certUpdates = {
          certificate_unlocked: true,
          certificate_id: newCertId,
          completion_date: newDate,
          course_name: 'Syllogism',
          issued_by: 'Syllosphere Learning Platform'
        };
        
        setCertificateUnlocked(true);
        setCertificateData({
          certificate_id: newCertId,
          completion_date: newDate,
          course_name: 'Syllogism',
          issued_by: 'Syllosphere Learning Platform'
        });
      }

      // 4. Update the database payload, omitting unrelated fields (like user_name and avatar_url)
      // We only provide user_name if the row is brand new to prevent null on creation
      const payload: any = {
        user_id: user.id,
        completed_lessons: mergedCompletedIds,
        updated_at: new Date().toISOString(),
        ...certUpdates
      };

      if (!existingProgress && candidate.name) {
         payload.user_name = candidate.name;
      }

      const { error } = await supabase
        .from('user_progress')
        .upsert(payload, { onConflict: 'user_id' });

      if (error) {
        console.error('Supabase save error:', error);
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const fetchLessons = async () => {
    const data = await getLessons();
    if (data && data.length > 0) setLessons(data);
  };

  // Sync view to hash
  useEffect(() => {
    // If the page loaded with a recovery token, permanently lock the view to resetPassword for this session
    if (INITIAL_HASH.includes('type=recovery')) {
      setView('resetPassword');
      setAuthModal(null);
      return;
    }

    const handleHashChange = () => {
      // Don't override view if we are processing a Supabase recovery token
      if (window.location.hash.includes('type=recovery')) {
        setView('resetPassword');
        return;
      }

      const hash = window.location.hash.replace('#', '');
      const validViews: AppView[] = ['landing', 'enrollment', 'levelSelection', 'dashboard', 'lesson', 'signupSuccess', 'userDashboard', 'adminConsult', 'leaderboard', 'certificate', 'settings', 'resetPassword'];
      if (hash === 'profile' || hash === 'settings') {
        setView('settings');
      } else if (validViews.includes(hash as AppView)) {
        setView(hash as AppView);
      }
    };
    
    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    // Call once to handle initial load
    handleHashChange();
    
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, []);

  // Sync hash when view changes
  useEffect(() => {
    const currentHash = window.location.hash;
    // Don't push state if we are handling a recovery token
    if (currentHash.includes('type=recovery')) return;

    const cleanHash = currentHash.replace('#', '');
    const targetHash = (view === 'settings') ? '#settings' : (view === 'landing' ? '' : `#${view}`);
    
    if (cleanHash !== view && !(view === 'settings' && (cleanHash === 'profile' || cleanHash === 'settings'))) {
      if (view === 'landing') {
        if (cleanHash) {
          window.history.replaceState(null, '', window.location.pathname);
        }
      } else {
        window.history.replaceState(null, '', targetHash);
      }
    }
  }, [view]);

  useEffect(() => {
    const restoreSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name || email.split('@')[0];
        const avatarUrl = session.user.user_metadata?.avatar_url || null;
        setCandidate({ name, level: 'Novice', avatarUrl });
        setUserEmail(email);
        await loadProgressFromSupabase(session.user.id);
        // We DON'T setView('userDashboard') here. Let the user stay on Landing until they choose to continue.
      }
      
      // Explicitly check for password recovery token if event missed
      if (INITIAL_HASH.includes('type=recovery') || window.location.hash.includes('type=recovery')) {
        setView('resetPassword');
        setAuthModal(null);
      }
      
      setSessionChecked(true);

      // Admin quick-login trigger
      if (window.location.pathname === '/admin') {
        if (!session?.user) {
          setAuthModal('login');
        }
        window.history.replaceState({}, '', '/');
      }
    };
    restoreSession();

    // Fetch lessons from Supabase
    fetchLessons();

    // Start heartbeat to keep Supabase free tier alive
    const stopHeartbeat = startHeartbeat();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setView('resetPassword');
        setAuthModal(null);
      } else if (event === 'SIGNED_OUT') {
        currentUserIdRef.current = null;
        setCurrentUserId(null);
        setView('landing');
        setCandidate({ name: '', level: 'Novice', avatarUrl: null });
        setCompletedLessonIds([]);
        setActiveLessonId(null);
        setActiveLevel('Beginner');
        setCertificateUnlocked(false);
        setCertificateData(null);
      } else if (session) {
        // Cross-tab account switch detection — use ref to avoid stale closure
        if (currentUserIdRef.current && currentUserIdRef.current !== session.user.id) {
           window.location.reload(); 
        } else if (!currentUserIdRef.current) {
           currentUserIdRef.current = session.user.id;
           setCurrentUserId(session.user.id);
           setUserEmail(session.user.email || '');
           const name = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '';
           const avatarUrl = session.user.user_metadata?.avatar_url || null;
           setCandidate({ name, level: 'Novice', avatarUrl });
        }
      }
    });
    return () => {
      subscription.unsubscribe();
      stopHeartbeat();
    };
  }, []);

  // ── Auth handlers ────────────────────────────────────────────────────────
  const handleAuthSuccess = async (email: string) => {
    const name = email.split('@')[0];
    setAuthModal(null);
    setCandidate({ name, level: 'Novice' });
    setUserEmail(email);
    await loadProgressFromSupabase();
    setView('userDashboard');
  };

  const handleNeedsVerification = (email: string) => {
    setPendingEmail(email);
    setAuthModal(null);
    setView('signupSuccess');
  };

  // ── Logout ───────────────────────────────────────────────────────────────
  const handleLogout = async () => {
    window.location.hash = '';
    await supabase.auth.signOut();
    window.location.href = window.location.origin + window.location.pathname;
  };

  const unlockedLevels = useMemo(() => {
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    if (isAdmin) return levels;
    const unlocked = ['Beginner'];
    
    for (let i = 0; i < levels.length - 1; i++) {
      const currentLevel = levels[i];
      const nextLevel = levels[i + 1];
      const levelLessons = lessons.filter(l => l.difficulty === currentLevel);
      const allCompleted = levelLessons.length > 0 && levelLessons.every(l => completedLessonIds.includes(l.id));
      
      if (allCompleted) {
        unlocked.push(nextLevel);
      } else {
        break;
      }
    }
    return unlocked;
  }, [completedLessonIds, lessons, isAdmin]);

  const handleEnrollment = async (name: string) => { 
    setCandidate({ ...candidate, name }); 
    await loadProgressFromSupabase();
    setView('userDashboard'); 
  };

  const handleSelectLevel = (level: string) => {
    setActiveLevel(level);
    setView('dashboard');
  };

  const activeLesson = useMemo(() => lessons.find(l => l.id === activeLessonId), [activeLessonId, lessons]);

  const handleCompleteLesson = () => {
    if (activeLessonId && !completedLessonIds.includes(activeLessonId)) {
      const newIds = [...completedLessonIds, activeLessonId];
      setCompletedLessonIds(newIds);
      // Supabase-ൽ progress save ചെയ്യുക
      if (candidate.name) {
        const totalRequiredLessons = lessons.length > 0 ? lessons.length : 18;
        const isUnlocking = newIds.length >= totalRequiredLessons && !certificateUnlocked;
        saveProgressToSupabase(newIds, isUnlocking);
        // Activity log-ൽ രേഖപ്പെടുത്തുക
        logActivity(candidate.name, 'completed_lesson', { lessonId: activeLessonId });

      }
    }
  };

  const showHeader = ['adminConsult'].includes(view);
  const isLightView = view === 'userDashboard' || view === 'levelSelection' || view === 'dashboard' || view === 'lesson' || view === 'leaderboard' || view === 'certificate';

  useEffect(() => {
    const root = document.documentElement;
    if (view === 'userDashboard' || view === 'landing' || view === 'levelSelection' || view === 'lesson' || view === 'leaderboard' || view === 'certificate') {
      document.body.style.backgroundColor = (view === 'userDashboard' || view === 'leaderboard' || view === 'certificate') ? '#F8FAFC' : '#F3F7FF';
      root.style.setProperty('--scrollbar-bg', 'transparent');
      root.style.setProperty('--scrollbar-thumb', '#CBD5E1');
      root.style.setProperty('--scrollbar-thumb-hover', '#94A3B8');
    } else {
      document.body.style.backgroundColor = '#020617';
      root.style.setProperty('--scrollbar-bg', '#020617');
      root.style.setProperty('--scrollbar-thumb', '#1e293b');
      root.style.setProperty('--scrollbar-thumb-hover', '#334155');
    }
  }, [view]);

  return (
    <div className={`${isLightView ? 'bg-[#F8FAFC] text-slate-900' : 'bg-[#020617] text-slate-200'} min-h-screen font-sans selection:bg-gold-500/30 overflow-x-hidden ${showHeader ? 'md:pt-28' : ''}`}>
      <AdminInspector lessons={lessons} onRefreshLessons={async () => {
        const data = await getLessons();
        if (data && data.length > 0) setLessons(data);
      }} />
      {showHeader && (
        <FloatingHeader 
          candidateName={candidate.name} 
          activeLevel={activeLevel} 
          onLogout={handleLogout} 
          onDashboard={() => setView('userDashboard')} 
          onAdminConsult={() => setView('adminConsult')}
          onSettings={() => setView('settings')}
          isAdmin={isAdmin}
          avatarUrl={candidate.avatarUrl}
        />
      )}

      {/* Auth Modal */}
      {authModal && (
        <AuthModal
          initialMode={authModal}
          onClose={() => setAuthModal(null)}
          onSuccess={handleAuthSuccess}
          onNeedsVerification={handleNeedsVerification}
        />
      )}

      {view === 'landing' && <Landing onOpenAuth={(mode) => setAuthModal(mode)} isLoggedIn={!!candidate.name} onEnterApp={() => setView('userDashboard')} />}
      {view === 'resetPassword' && <ResetPassword onComplete={() => setView('landing')} />}
      {view === 'signupSuccess' && <SignupSuccess email={pendingEmail} onGoToLogin={() => { setView('landing'); setAuthModal('login'); }} />}
      {view === 'enrollment' && <Enrollment onConfirm={handleEnrollment} onBack={() => setView('landing')} />}
      {view === 'userDashboard' && (
        <UserDashboard
          candidateName={candidate.name}
          email={userEmail || ''}
          lessons={lessons}
          completedLessonIds={isAdmin ? lessons.map(l => l.id) : completedLessonIds}
          avatarUrl={candidate.avatarUrl}
          onBack={() => setView('levelSelection')}
          onHome={() => setView('landing')}
          onLeaderboard={() => setView('leaderboard')}
          onCertificate={() => setView('certificate')}
        />
      )}
      {view === 'levelSelection' && (
        <LevelSelection 
          unlockedLevels={unlockedLevels} 
          onSelectLevel={(level) => {
            setActiveLevel(level);
            setView('dashboard');
          }}
          onBack={() => setView('landing')}
          onDashboard={() => setView('userDashboard')}
          candidateName={candidate.name}
          completedCount={isAdmin ? lessons.length : completedLessonIds.length}
          totalCount={lessons.length || 18}
          lessons={lessons}
          completedLessonIds={isAdmin ? lessons.map(l => l.id) : completedLessonIds}
          avatarUrl={candidate.avatarUrl}
        />
      )}
      {view === 'dashboard' && activeLevel && (
        <Dashboard 
          candidate={candidate} 
          activeLevel={activeLevel}
          onSelectLesson={(lessonId) => {
            setActiveLessonId(lessonId);
            setView('lesson');
          }}
          onBackToLevels={() => setView('levelSelection')}
          onDashboard={() => setView('userDashboard')}
          onLeaderboard={() => setView('leaderboard')}
          completedLessonIds={completedLessonIds}
          lessons={lessons}
          isAdmin={isAdmin}
        />
      )}
      {view === 'leaderboard' && (
        <Leaderboard 
          currentUser={{ id: '', name: candidate.name }}
          onDashboard={() => setView('dashboard')}
          onLessons={() => setView('levelSelection')}
          isAdmin={isAdmin}
        />
      )}
      
      {view === 'adminConsult' && isAdmin && (
        <AdminConsultDesk
          lessons={lessons}
          onBack={() => setView('userDashboard')}
        />
      )}
      {view === 'lesson' && activeLesson && (
        <LessonView 
          lesson={activeLesson}
          candidate={candidate}
          onBack={() => setView('dashboard')}
          onDashboard={() => setView('userDashboard')}
          onLeaderboard={() => setView('leaderboard')}
          onComplete={handleCompleteLesson}
        />
      )}

      {view === 'certificate' && (
        <Certificate
          userName={candidate.name}
          completedLessons={isAdmin ? (lessons.length || 18) : completedLessonIds.length}
          totalLessons={lessons.length > 0 ? lessons.length : 18}
          quizzesPassed={isAdmin ? (lessons.length || 18) : completedLessonIds.length} // Quizzes are required to complete lessons
          totalQuizzes={lessons.length > 0 ? lessons.length : 18}
          unlocked={isAdmin ? true : certificateUnlocked}
          certificateData={isAdmin && !certificateData ? {
            certificate_id: 'SYL-ADMIN-PREVIEW',
            completion_date: new Date().toISOString(),
            course_name: 'Syllogism',
            issued_by: 'Syllosphere Learning Platform'
          } : certificateData}
          onContinue={() => setView('dashboard')}
          onBack={() => setView('userDashboard')}
          isAdmin={isAdmin}
        />
      )}

      {view === 'settings' && (
        <Settings 
          userName={candidate.name} 
          email={userEmail} 
          isAdmin={isAdmin}
          onProfileUpdate={(name, avatarUrl) => setCandidate({ ...candidate, name, avatarUrl })}
        />
      )}
    </div>
  );
}
