import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Header } from './Header';
import { Lesson } from '../types';
import { normalizeLevel } from '../lib/lessonUtils';
import {
  CheckCircleIcon, LockIcon, BrainCircuitIcon, LoaderIcon,
  LayoutDashboardIcon, BookOpenIcon, TrophyIcon, AwardIcon, SettingsIcon,
  MessageSquareIcon, ArrowLeftIcon
} from './Icons';

interface UserDashboardProps {
  candidateName: string;
  email: string;
  lessons: Lesson[];
  completedLessonIds: number[];
  avatarUrl?: string | null;
  onBack: () => void;
  onHome?: () => void;
  onLeaderboard?: () => void;
  onCertificate?: () => void;
  isAdmin?: boolean;
}

const UserDashboard: React.FC<UserDashboardProps> = React.memo(({
  candidateName,
  email,
  lessons,
  completedLessonIds,
  avatarUrl,
  onBack,
  onHome,
  onLeaderboard,
  onCertificate,
  isAdmin = false,
}) => {
  const [joinDate, setJoinDate] = useState<string>('');

  // Fetch user's join date from Supabase auth asynchronously without blocking UI
  useEffect(() => {
    let isMounted = true;
    const fetchUserMeta = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.created_at && isMounted) {
          const date = new Date(session.user.created_at);
          setJoinDate(date.toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', year: 'numeric'
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch user meta:', err);
      }
    };
    fetchUserMeta();
    return () => { isMounted = false; };
  }, []);

  // Stats
  const totalLessons = lessons.length || 18;
  const completedCount = completedLessonIds.length;
  const progressPercent = Math.round((completedCount / totalLessons) * 100) || 0;
  const xp = completedCount * 10;
  const statusLabel = completedCount >= totalLessons ? 'Adept' : completedCount > 0 ? 'Scholar' : 'Initiate';

  // Level breakdown
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'] as const;
  const levelData = useMemo(() => {
    return levels.map(level => {
      const levelLessons = lessons.filter(l => normalizeLevel(l.difficulty) === level);
      const completed = levelLessons.filter(l => completedLessonIds.includes(l.id));
      const allDone = levelLessons.length > 0 && completed.length === levelLessons.length;
      return { level, total: levelLessons.length, completed: completed.length, allDone, lessons: levelLessons };
    });
  }, [lessons, completedLessonIds]);

  // Completed lessons for timeline
  const completedLessonsData = useMemo(() => {
    return lessons.filter(l => completedLessonIds.includes(l.id));
  }, [lessons, completedLessonIds]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0F172A]">

      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-[#E2E8F0] bg-white flex-col shrink-0">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-[#3466F6] rounded-xl flex items-center justify-center text-white shrink-0">
            <BrainCircuitIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-[0.1em] text-[#0F172A] font-serif leading-none mb-1">SYLLOSPHERE</h1>
            <p className="text-[7px] font-bold text-[#64748B] tracking-widest uppercase">Master Logic. Ace Every Exam.</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-[#EFF6FF] text-[#3466F6] rounded-[16px] font-bold text-sm transition-all">
            <LayoutDashboardIcon className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <BookOpenIcon className="w-5 h-5" /> Lessons
          </button>
          <button onClick={() => window.location.hash = '#leaderboard'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <TrophyIcon className="w-5 h-5" /> Leaderboard
          </button>
          <button onClick={() => window.location.hash = '#certificate'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <AwardIcon className="w-5 h-5" /> Certificates
          </button>
          {isAdmin && (
            <button onClick={() => window.location.hash = '#adminConsult'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
              <MessageSquareIcon className="w-5 h-5" /> Consult Desk
            </button>
          )}
          <button onClick={() => window.location.hash = '#settings'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header userName={candidateName} variant="dashboard" isAdmin={isAdmin} avatarUrl={avatarUrl} />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 lg:pt-6">
          <div className="max-w-5xl mx-auto space-y-4 lg:space-y-5 pb-8">

            {/* Hero Section */}
            <div className="flex justify-between items-start sm:items-end mb-2 flex-col sm:flex-row gap-4">
              <div>
                <h2 className="text-[24px] md:text-[28px] font-bold text-[#0F172A] mb-1">My Dashboard</h2>
                <p className="text-[#64748B] text-[13px] md:text-[14px] font-medium">Track your learning journey and achievements.</p>
              </div>
              <button onClick={onBack} className="w-full sm:w-auto px-5 py-2.5 bg-[#3466F6] hover:bg-blue-700 text-white rounded-[12px] font-semibold flex items-center justify-center gap-2 shadow-sm transition-all text-[14px]">
                Start Lessons <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Profile & Progress Card */}
            <div className="bg-white rounded-[16px] md:rounded-[20px] p-5 lg:p-6 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row gap-6 lg:gap-8">
              {/* Left: Profile */}
              <div className="flex gap-4 md:gap-5 items-center md:w-[45%]">
                <div className="w-[60px] h-[60px] md:w-[72px] md:h-[72px] rounded-full bg-[#EFF6FF] flex items-center justify-center shrink-0 border border-blue-50 overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-[28px] md:text-[32px] font-medium text-[#3466F6]">{candidateName.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <p className="hidden md:block text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-1.5">Candidate Profile</p>
                  <h3 className="text-[18px] md:text-[20px] font-bold text-[#0F172A] mb-0.5 leading-tight">{candidateName}</h3>
                  <p className="text-[11px] md:text-[12px] text-[#64748B] mb-2">{email}</p>
                  <p className="text-[10px] md:text-[11px] text-[#64748B] font-medium flex items-center gap-1.5"><LayoutDashboardIcon className="w-3.5 h-3.5 hidden md:block" /> Member since <span className="font-bold text-[#0F172A]">{joinDate || 'Jun 22, 2026'}</span></p>
                </div>
              </div>

              <div className="md:hidden h-px w-full bg-[#E2E8F0]"></div>
              <div className="hidden md:block w-px bg-[#E2E8F0]"></div>

              {/* Right: Progress */}
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest mb-2">Overall Progress</p>
                <div className="flex justify-between items-end mb-2.5">
                  <p className="text-[#0F172A] font-bold"><span className="text-[20px]">{completedCount}</span> <span className="text-[12px] text-[#64748B] font-medium ml-1">/ {totalLessons} Lessons Completed</span></p>
                  <span className="text-[#3466F6] font-bold text-lg">{progressPercent}%</span>
                </div>
                <div className="h-2 w-full bg-[#F1F5F9] rounded-full overflow-hidden mb-2.5">
                  <div className="h-full bg-[#3466F6] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                </div>
                <p className="text-[12px] text-[#64748B] font-medium">Keep going! You are making great progress.</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-3 lg:gap-5">
              <div className="bg-white rounded-[16px] md:rounded-[20px] p-3 md:p-5 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[50px] md:h-[50px] rounded-full bg-[#ECFDF5] text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-[18px] md:text-[22px] font-bold text-[#0F172A] leading-none mb-1">{completedCount}</p>
                  <p className="text-[9px] md:text-[12px] text-[#64748B] font-medium mb-0.5 leading-tight">Lessons Completed</p>
                  <p className="text-[8px] md:text-[10px] text-[#64748B] hidden md:block">Great going!</p>
                </div>
              </div>
              <div className="bg-white rounded-[16px] md:rounded-[20px] p-3 md:p-5 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[50px] md:h-[50px] rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0">
                  <TrophyIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-[18px] md:text-[22px] font-bold text-[#0F172A] leading-none mb-1">{xp}</p>
                  <p className="text-[9px] md:text-[12px] text-[#64748B] font-medium mb-0.5 leading-tight">Experience Points</p>
                  <p className="text-[8px] md:text-[10px] text-[#64748B] hidden md:block">Keep learning!</p>
                </div>
              </div>
              <div className="bg-white rounded-[16px] md:rounded-[20px] p-3 md:p-5 border border-[#E2E8F0] shadow-sm flex flex-col md:flex-row items-center justify-center text-center md:text-left gap-2 md:gap-4">
                <div className="w-[36px] h-[36px] md:w-[50px] md:h-[50px] rounded-full bg-[#FFF7ED] text-orange-500 flex items-center justify-center shrink-0">
                  <AwardIcon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div>
                  <p className="text-[14px] md:text-[18px] font-bold text-[#0F172A] uppercase tracking-wide leading-none mb-1 md:mt-1">{statusLabel}</p>
                  <p className="text-[9px] md:text-[12px] text-[#64748B] font-medium mb-0.5 leading-tight">Current Rank</p>
                  <p className="text-[8px] md:text-[10px] text-[#64748B] hidden md:block">Keep it up!</p>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-4 lg:gap-5 items-stretch">

              {/* Level Breakdown */}
              <div className="bg-white rounded-[16px] md:rounded-[20px] p-5 lg:p-7 border border-[#E2E8F0] shadow-sm flex flex-col md:h-[340px]">
                <h3 className="text-[15px] md:text-[16px] font-bold text-[#0F172A] mb-6">Level Breakdown</h3>
                <div className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 flex-1">
                  {/* Donut Chart */}
                  <div className="relative w-[140px] h-[140px] sm:w-[130px] sm:h-[130px] shrink-0 sm:ml-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-[#EFF6FF]" strokeWidth="4.5" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                      <circle className="text-[#3466F6]" strokeWidth="4.5" strokeDasharray={`${Math.max(0.1, progressPercent)}, 100`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                      <span className="text-[32px] sm:text-[28px] font-bold text-[#0F172A] leading-none">{totalLessons}</span>
                      <span className="text-[10px] sm:text-[9px] text-[#64748B] font-medium uppercase mt-1">Total Lessons</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex-1 w-full space-y-3 sm:space-y-4 max-w-[300px] sm:max-w-none">
                    {levelData.map((data, idx) => {
                      const isLocked = idx > 0 && !levelData[idx - 1].allDone;
                      return (
                        <div key={data.level} className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className={`w-2 h-2 rounded-full ${isLocked ? 'bg-slate-300' : 'bg-[#3466F6]'}`}></div>
                            <span className={`text-[12px] font-medium ${isLocked ? 'text-[#64748B]' : 'text-[#64748B]'}`}>{data.level} Sphere</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {isLocked ? <LockIcon className="w-3 h-3 text-[#64748B]" /> : null}
                            <span className={`text-[12px] font-bold ${isLocked ? 'text-[#64748B]' : 'text-[#0F172A]'}`}>{isLocked ? 0 : data.completed} <span className="text-[10px] font-medium text-[#64748B] ml-0.5">({isLocked ? 0 : Math.round((data.completed / data.total) * 100)}%)</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-6 bg-[#EFF6FF] text-[#3466F6] text-[11px] font-medium px-4 py-3 rounded-[10px] flex items-center gap-2.5">
                  <LockIcon className="w-3.5 h-3.5 shrink-0 text-[#3466F6]" /> Complete previous levels to unlock advanced content.
                </div>
              </div>

              {/* Learning Journey */}
              <div className="bg-white rounded-[16px] md:rounded-[20px] p-5 lg:p-7 border border-[#E2E8F0] shadow-sm flex flex-col h-[340px]">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-[15px] md:text-[16px] font-bold text-[#0F172A]">Learning Journey</h3>
                  <button className="text-[10px] md:text-[11px] text-[#3466F6] font-bold tracking-wide hover:bg-blue-100 transition-colors bg-[#EFF6FF] px-3 py-1.5 rounded-full">View All</button>
                </div>

                {completedLessonsData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-14 h-14 bg-[#F8FAFC] rounded-full flex items-center justify-center mb-3">
                      <BookOpenIcon className="w-6 h-6 text-[#E2E8F0]" />
                    </div>
                    <p className="text-[#64748B] text-[13px] font-medium">No lessons completed yet.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-5 relative before:absolute before:inset-0 before:ml-[15px] before:w-px before:bg-[#E2E8F0]">
                    {/* Add a "All lessons completed" header item if completely done */}
                    {completedCount === totalLessons && (
                      <div className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#ECFDF5] text-emerald-500 flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm mt-0.5">
                          <CheckCircleIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[#0F172A] text-[12px]">Completed all lessons</p>
                              <p className="text-[10px] text-[#64748B] mt-0.5">You have completed the entire syllabus.</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-[9px] text-[#64748B] mb-1 font-medium">Just now</p>
                              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+100 XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {completedLessonsData.slice().reverse().map((lesson, idx) => (
                      <div key={lesson.id} className="relative flex items-start gap-4">
                        <div className="w-8 h-8 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center shrink-0 z-10 border-[3px] border-white shadow-sm mt-0.5">
                          <BookOpenIcon className="w-3 h-3" />
                        </div>
                        <div className="flex-1 pt-0.5">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-[#0F172A] text-[12px]">{lesson.topic === 'Quiz' ? 'Quiz Completed' : 'Lesson Completed'}</p>
                              <p className="text-[10px] text-[#64748B] mt-0.5 line-clamp-1">{lesson.title}</p>
                            </div>
                            <div className="text-right shrink-0 ml-3">
                              <p className="text-[9px] text-[#64748B] mb-1 font-medium">{idx === 0 ? '2 hours ago' : `${idx} days ago`}</p>
                              <div className="flex items-center gap-1.5 justify-end">
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${lesson.difficulty === 'Beginner' ? 'bg-[#ECFDF5] text-emerald-600' :
                                    lesson.difficulty === 'Intermediate' ? 'bg-[#EFF6FF] text-[#3466F6]' :
                                      lesson.difficulty === 'Advanced' ? 'bg-[#FAF5FF] text-purple-600' :
                                        'bg-[#FFF7ED] text-orange-600'
                                  }`}>{lesson.difficulty === 'Beginner' ? 'Easy' : lesson.difficulty === 'Intermediate' ? 'Medium' : 'Hard'}</span>
                                <span className="text-[10px] font-bold text-[#64748B] ml-1">+{lesson.topic === 'Quiz' ? '30' : '20'} XP</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
});

export default UserDashboard;
