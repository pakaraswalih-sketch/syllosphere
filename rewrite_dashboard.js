const fs = require('fs');
const path = require('path');

const newContent = `import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Lesson } from '../types';
import { 
  ArrowLeftIcon, CheckCircleIcon, LockIcon,
  BrainCircuitIcon, LoaderIcon,
  LayoutDashboardIcon, BookOpenIcon, TrophyIcon, AwardIcon, SettingsIcon,
  BellIcon, LogOutIcon
} from './Icons';

interface UserDashboardProps {
  candidateName: string;
  email: string;
  lessons: Lesson[];
  completedLessonIds: number[];
  onBack: () => void;
  onHome?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({
  candidateName,
  email,
  lessons,
  completedLessonIds,
  onBack,
  onHome,
}) => {
  const [joinDate, setJoinDate] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Fetch user's join date from Supabase auth
  useEffect(() => {
    const fetchUserMeta = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.created_at) {
          const date = new Date(user.created_at);
          setJoinDate(date.toLocaleDateString('en-US', { 
            month: 'long', year: 'numeric', day: 'numeric' 
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch user meta:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserMeta();
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
      const levelLessons = lessons.filter(l => l.difficulty === level);
      const completed = levelLessons.filter(l => completedLessonIds.includes(l.id));
      const allDone = levelLessons.length > 0 && completed.length === levelLessons.length;
      return { level, total: levelLessons.length, completed: completed.length, allDone, lessons: levelLessons };
    });
  }, [lessons, completedLessonIds]);

  // Completed lessons for timeline
  const completedLessonsData = useMemo(() => {
    return lessons.filter(l => completedLessonIds.includes(l.id));
  }, [lessons, completedLessonIds]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    if (onHome) onHome();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="flex flex-col items-center gap-4">
          <LoaderIcon className="w-10 h-10 text-blue-600" />
          <p className="text-sm text-blue-600 font-semibold animate-pulse">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-6 pb-8 flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shrink-0">
            <BrainCircuitIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-[0.1em] text-blue-900 font-serif leading-none mb-1">SYLLOSPHERE</h1>
            <p className="text-[7px] font-bold text-slate-500 tracking-widest uppercase">Master Logic. Ace Every Exam.</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <button className="w-full flex items-center gap-3 px-4 py-3.5 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm transition-all">
            <LayoutDashboardIcon className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={onBack} className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-sm transition-all">
            <BookOpenIcon className="w-5 h-5" /> Lessons
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-sm transition-all">
            <TrophyIcon className="w-5 h-5" /> Leaderboard
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-sm transition-all">
            <AwardIcon className="w-5 h-5" /> Certificates
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3.5 text-slate-500 hover:bg-slate-50 hover:text-slate-900 rounded-xl font-medium text-sm transition-all">
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-[72px] border-b border-slate-200 bg-white flex items-center justify-between px-8 shrink-0">
          <button onClick={onHome} className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 rounded-full text-slate-700 font-semibold text-[13px] transition-all border border-slate-200 shadow-sm">
            <ArrowLeftIcon className="w-4 h-4" /> Home
          </button>

          <div className="flex items-center gap-6">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <BellIcon className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 font-bold text-lg border border-blue-100 relative">
                {candidateName.charAt(0).toUpperCase()}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white"></div>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-slate-900 leading-none mb-1">{candidateName}</p>
                <p className="text-[11px] text-slate-500 font-medium">Active Candidate</p>
              </div>
            </div>
            <button onClick={handleSignOut} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 text-sm font-medium ml-2">
              <LogOutIcon className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-5xl mx-auto space-y-6 pb-12">
            
            {/* Hero Section */}
            <div className="flex justify-between items-end mb-4">
              <div>
                <h2 className="text-[32px] font-bold text-slate-900 mb-2">My Dashboard</h2>
                <p className="text-slate-500 text-[15px] font-medium">Track your learning journey and achievements.</p>
              </div>
              <button onClick={onBack} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-[14px] font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 transition-all text-[15px]">
                Start Lessons <ArrowLeftIcon className="w-4 h-4 rotate-180" />
              </button>
            </div>

            {/* Profile & Progress Card */}
            <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col md:flex-row gap-10">
              {/* Left: Profile */}
              <div className="flex gap-6 items-center md:w-[45%]">
                <div className="w-[88px] h-[88px] rounded-full bg-blue-50/80 flex items-center justify-center shrink-0 border border-blue-100/50">
                  <span className="text-[40px] font-medium text-blue-600">{candidateName.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Candidate Profile</p>
                  <h3 className="text-[22px] font-bold text-slate-900 mb-1 leading-tight">{candidateName}</h3>
                  <p className="text-[13px] text-slate-500 mb-3">{email}</p>
                  <p className="text-[11px] text-slate-500 font-medium flex items-center gap-1.5"><LayoutDashboardIcon className="w-3.5 h-3.5" /> Member since <span className="font-bold text-slate-700">{joinDate || 'Jun 22, 2026'}</span></p>
                </div>
              </div>
              
              <div className="hidden md:block w-px bg-slate-100"></div>

              {/* Right: Progress */}
              <div className="flex-1 flex flex-col justify-center">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Overall Progress</p>
                <div className="flex justify-between items-end mb-3">
                  <p className="text-slate-900 font-bold"><span className="text-[22px]">{completedCount}</span> <span className="text-[13px] text-slate-500 font-medium ml-1">/ {totalLessons} Lessons Completed</span></p>
                  <span className="text-blue-600 font-bold text-lg">{progressPercent}%</span>
                </div>
                <div className="h-2.5 w-full bg-[#F1F5F9] rounded-full overflow-hidden mb-3">
                  <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: \`\${progressPercent}%\` }}></div>
                </div>
                <p className="text-[13px] text-slate-500 font-medium">Keep going! You are making great progress.</p>
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-5">
                <div className="w-[60px] h-[60px] rounded-[18px] bg-[#ECFDF5] text-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircleIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[26px] font-bold text-slate-900 leading-none mb-1.5">{completedCount}</p>
                  <p className="text-[13px] text-slate-600 font-medium mb-1">Lessons Completed</p>
                  <p className="text-[11px] text-slate-400">Great going!</p>
                </div>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-5">
                <div className="w-[60px] h-[60px] rounded-[18px] bg-[#EFF6FF] text-blue-500 flex items-center justify-center shrink-0">
                  <TrophyIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[26px] font-bold text-slate-900 leading-none mb-1.5">{xp}</p>
                  <p className="text-[13px] text-slate-600 font-medium mb-1">Experience Points (XP)</p>
                  <p className="text-[11px] text-slate-400">Keep learning!</p>
                </div>
              </div>
              <div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex items-center gap-5">
                <div className="w-[60px] h-[60px] rounded-[18px] bg-[#FFF7ED] text-orange-500 flex items-center justify-center shrink-0">
                  <AwardIcon className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-xl font-bold text-slate-900 uppercase tracking-wide leading-none mb-2 mt-1">{statusLabel}</p>
                  <p className="text-[13px] text-slate-600 font-medium mb-1">Current Rank</p>
                  <p className="text-[11px] text-slate-400">Keep it up!</p>
                </div>
              </div>
            </div>

            {/* Bottom Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr] gap-6 items-stretch">
              
              {/* Level Breakdown */}
              <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col h-full">
                <h3 className="text-lg font-bold text-slate-900 mb-8">Level Breakdown</h3>
                <div className="flex items-center gap-10 flex-1">
                  {/* Donut Chart */}
                  <div className="relative w-[160px] h-[160px] shrink-0 ml-2">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                      <circle className="text-[#EFF6FF]" strokeWidth="4.5" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                      <circle className="text-blue-500" strokeWidth="4.5" strokeDasharray={\`\${Math.max(0.1, progressPercent)}, 100\`} strokeLinecap="round" stroke="currentColor" fill="transparent" r="16" cx="18" cy="18" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center mt-1">
                      <span className="text-[34px] font-bold text-slate-900 leading-none">{totalLessons}</span>
                      <span className="text-[10px] text-slate-500 font-medium uppercase mt-1">Total Lessons</span>
                    </div>
                  </div>
                  {/* Legend */}
                  <div className="flex-1 space-y-4">
                    {levelData.map((data, idx) => {
                      const isLocked = idx > 0 && !levelData[idx - 1].allDone;
                      return (
                        <div key={data.level} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={\`w-2 h-2 rounded-full \${isLocked ? 'bg-slate-300' : 'bg-blue-500'}\`}></div>
                            <span className={\`text-[13px] font-medium \${isLocked ? 'text-slate-400' : 'text-slate-600'}\`}>{data.level} Sphere</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {isLocked ? <LockIcon className="w-3.5 h-3.5 text-slate-400" /> : null}
                            <span className={\`text-[13px] font-bold \${isLocked ? 'text-slate-400' : 'text-slate-900'}\`}>{isLocked ? 0 : data.completed} <span className="text-xs font-normal text-slate-400 ml-0.5">({isLocked ? 0 : Math.round((data.completed/data.total)*100)}%)</span></span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="mt-8 bg-blue-50/80 text-blue-600 text-xs font-medium px-4 py-3.5 rounded-xl flex items-center gap-2.5">
                  <LockIcon className="w-4 h-4 shrink-0 text-blue-500" /> Complete previous levels to unlock advanced content.
                </div>
              </div>

              {/* Learning Journey */}
              <div className="bg-white rounded-[24px] p-8 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] flex flex-col h-[420px]">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-lg font-bold text-slate-900">Learning Journey</h3>
                  <button className="text-[11px] text-blue-600 font-bold tracking-wide hover:bg-blue-100 transition-colors bg-blue-50 px-4 py-1.5 rounded-full">View All</button>
                </div>
                
                {completedLessonsData.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                      <BookOpenIcon className="w-8 h-8 text-slate-300" />
                    </div>
                    <p className="text-slate-600 font-medium">No lessons completed yet.</p>
                    <p className="text-sm text-slate-500 mt-1">Start learning to build your journey.</p>
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto pr-3 space-y-7 relative before:absolute before:inset-0 before:ml-[19px] before:w-px before:bg-slate-200">
                    {/* Add a "All lessons completed" header item if completely done */}
                    {completedCount === totalLessons && (
                      <div className="relative flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-emerald-500 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5">
                          <CheckCircleIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900 text-[13px]">Completed all lessons</p>
                              <p className="text-[11px] text-slate-500 mt-1">Congratulations! You have completed the entire syllabus.</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-[10px] text-slate-400 mb-1.5 font-medium">Just now</p>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+100 XP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {completedLessonsData.slice().reverse().map((lesson, idx) => (
                      <div key={lesson.id} className="relative flex items-start gap-5">
                        <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-blue-500 flex items-center justify-center shrink-0 z-10 border-4 border-white shadow-sm mt-0.5">
                          <BookOpenIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 pt-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-bold text-slate-900 text-[13px]">{lesson.topic === 'Quiz' ? 'Quiz Completed' : 'Lesson Completed'}</p>
                              <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{lesson.title}</p>
                            </div>
                            <div className="text-right shrink-0 ml-4">
                              <p className="text-[10px] text-slate-400 mb-1.5 font-medium">{idx === 0 ? '2 hours ago' : \`\${idx} days ago\`}</p>
                              <div className="flex items-center gap-2 justify-end">
                                <span className={\`text-[10px] font-bold px-2 py-0.5 rounded-md \${
                                  lesson.difficulty === 'Beginner' ? 'bg-[#ECFDF5] text-emerald-600' :
                                  lesson.difficulty === 'Intermediate' ? 'bg-[#EFF6FF] text-blue-600' :
                                  lesson.difficulty === 'Advanced' ? 'bg-[#FAF5FF] text-purple-600' :
                                  'bg-[#FFF7ED] text-orange-600'
                                }\`}>{lesson.difficulty === 'Beginner' ? 'Easy' : lesson.difficulty === 'Intermediate' ? 'Medium' : 'Hard'}</span>
                                <span className="text-[11px] font-bold text-slate-500">+{lesson.topic === 'Quiz' ? '30' : '20'} XP</span>
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
};

export default UserDashboard;
`

fs.writeFileSync(path.join(__dirname, 'src/components/UserDashboard.tsx'), newContent, 'utf8');
