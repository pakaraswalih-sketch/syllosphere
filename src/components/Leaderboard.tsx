import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  TrophyIcon, SearchIcon, AwardIcon, BrainCircuitIcon, 
  ChevronLeftIcon, ChevronRightIcon, TrendingUpIcon,
  LayoutDashboardIcon, LogOutIcon, BookOpenIcon
} from './Icons';
import { Header } from './Header';

// Types
export interface LeaderboardUser {
  user_id: string;
  user_name: string;
  completed_count: number;
  xp: number;
  current_streak: number;
  current_level: string;
  updated_at: string;
  rank?: number;
}

interface LeaderboardProps {
  currentUser: {
    id: string;
    name: string;
  };
  onDashboard: () => void;
  onLessons: () => void;
  isAdmin?: boolean;
}

// In-Memory Leaderboard Cache for instant page transitions (0ms)
let cachedLeaderboardData: LeaderboardUser[] | null = null;

const Leaderboard: React.FC<LeaderboardProps> = React.memo(({ currentUser, onDashboard, onLessons, isAdmin = false }) => {
  const [users, setUsers] = useState<LeaderboardUser[]>(() => cachedLeaderboardData || []);
  const [loading, setLoading] = useState<boolean>(() => !cachedLeaderboardData);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<'all' | 'month' | 'week'>('all');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(20);

  useEffect(() => {
    let isMounted = true;

    const fetchUserAndLeaderboard = async () => {
      if (!cachedLeaderboardData) {
        setLoading(true);
      }
      try {
        // Issue session & direct database query in parallel for ultra-fast load (<30ms)
        const sessionPromise = supabase.auth.getSession();
        const progressPromise = supabase
          .from('user_progress')
          .select('user_id, user_name, completed_lessons, xp, current_streak, active_level, updated_at, avatar_url')
          .order('xp', { ascending: false })
          .limit(100);

        const [{ data: sessionData }, { data: progressData, error: progressErr }] = await Promise.all([
          sessionPromise,
          progressPromise
        ]);

        if (sessionData?.session?.user && isMounted) {
          setCurrentUserId(sessionData.session.user.id);
        }

        if (!progressErr && progressData && progressData.length > 0) {
          const formatted: LeaderboardUser[] = progressData.map((row: any) => ({
            user_id: row.user_id,
            user_name: row.user_name || 'Anonymous Learner',
            completed_count: Array.isArray(row.completed_lessons) ? row.completed_lessons.length : 0,
            xp: row.xp || (Array.isArray(row.completed_lessons) ? row.completed_lessons.length * 10 : 0),
            current_streak: row.current_streak || 1,
            current_level: row.active_level || 'Beginner',
            updated_at: row.updated_at || new Date().toISOString(),
            avatar_url: row.avatar_url || null
          }));

          formatted.sort((a, b) => b.xp - a.xp);

          if (isMounted) {
            cachedLeaderboardData = formatted;
            setUsers(formatted);
            setError(null);
            setLoading(false);
          }
          return;
        }

        // Fallback to RPC if direct table query is unavailable
        const { data: rpcData, error: rpcErr } = await supabase.rpc('get_leaderboard');
        if (rpcErr) throw rpcErr;

        if (isMounted && rpcData) {
          cachedLeaderboardData = rpcData;
          setUsers(rpcData);
          setError(null);
        }
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        if (isMounted && !cachedLeaderboardData) {
          setError(err.message || 'Failed to load leaderboard.');
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUserAndLeaderboard();
    return () => { isMounted = false; };
  }, []);

  // Filter users based on search and time filter
  const filteredUsers = useMemo(() => {
    let result = users;

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u => u.user_name.toLowerCase().includes(q));
    }

    // Time filter (using updated_at)
    if (timeFilter !== 'all') {
      const now = new Date();
      result = result.filter(u => {
        const d = new Date(u.updated_at);
        if (timeFilter === 'week') {
          const diffDays = (now.getTime() - d.getTime()) / (1000 * 3600 * 24);
          return diffDays <= 7;
        } else if (timeFilter === 'month') {
          return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        return true;
      });
    }

    return result;
  }, [users, searchQuery, timeFilter]);

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);
  const currentUsers = filteredUsers.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // Effective current user identification
  const effectiveUserId = currentUser.id || currentUserId || '';

  // Current User Stats
  const currentUserIndex = filteredUsers.findIndex(u => u.user_id === effectiveUserId || (effectiveUserId === '' && u.user_name === currentUser.name));
  const currentUserStats = currentUserIndex !== -1 ? filteredUsers[currentUserIndex] : null;
  const currentRank = currentUserIndex !== -1 ? currentUserIndex + 1 : 0;

  // Nearby ranks
  const nearbyRanks = useMemo(() => {
    if (currentUserIndex === -1) return filteredUsers.slice(0, 5);
    let start = Math.max(0, currentUserIndex - 2);
    let end = Math.min(filteredUsers.length, start + 5);
    if (end - start < 5) {
      start = Math.max(0, end - 5);
    }
    return filteredUsers.slice(start, end).map((u, i) => ({
      ...u,
      rank: start + i + 1
    }));
  }, [filteredUsers, currentUserIndex]);

  // Next Rank Logic
  const nextRankStats = currentUserIndex > 0 ? filteredUsers[currentUserIndex - 1] : null;
  const xpToNextRank = nextRankStats && currentUserStats ? nextRankStats.xp - currentUserStats.xp + 10 : 10;

  const getRankMedal = (rank: number, isCurrentUser: boolean) => {
    if (rank === 1) {
      return (
        <div className="flex items-center justify-center w-8">
          <div className="relative flex flex-col items-center">
            <svg className="w-6 h-8 text-amber-400 fill-current" viewBox="0 0 24 30">
              <path d="M0 0h24v24l-12 6-12-6z"/>
            </svg>
            <span className="absolute top-1 left-0 right-0 text-center font-extrabold text-[10px] text-white">1</span>
          </div>
        </div>
      );
    }
    if (rank === 2) {
      return (
        <div className="flex items-center justify-center w-8">
          <div className="relative flex flex-col items-center">
            <svg className="w-6 h-8 text-slate-400 fill-current" viewBox="0 0 24 30">
              <path d="M0 0h24v24l-12 6-12-6z"/>
            </svg>
            <span className="absolute top-1 left-0 right-0 text-center font-extrabold text-[10px] text-white">2</span>
          </div>
        </div>
      );
    }
    if (rank === 3) {
      return (
        <div className="flex items-center justify-center w-8">
          <div className="relative flex flex-col items-center">
            <svg className="w-6 h-8 text-amber-700 fill-current" viewBox="0 0 24 30">
              <path d="M0 0h24v24l-12 6-12-6z"/>
            </svg>
            <span className="absolute top-1 left-0 right-0 text-center font-extrabold text-[10px] text-white">3</span>
          </div>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-center w-8">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${isCurrentUser ? 'bg-[#3466F6] text-white' : 'bg-slate-100 text-slate-500'}`}>
          {rank}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="animate-pulse flex flex-col items-center">
          <BrainCircuitIcon className="w-12 h-12 text-[#3466F6] mb-4" />
          <p className="text-[#3466F6] font-semibold">Loading Leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 min-h-screen flex items-center justify-center bg-[#F8FAFC] p-8">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-rose-100 text-center max-w-lg">
          <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUpIcon className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] mb-2">Setup Required</h2>
          <p className="text-slate-600 mb-6">{error}</p>
        </div>
      </div>
    );
  }

  const top3 = filteredUsers.slice(0, 3);

  return (
    <div className="fixed inset-0 flex flex-col bg-[#F8FAFC] font-sans text-[#0F172A] overflow-hidden z-40 w-full max-w-[100vw] box-border">
      
      <Header userName={currentUser.name} isAdmin={isAdmin} />


      {/* Scrollable Content */}
      <div className="flex-1 bg-[#F8FAFC] overflow-y-auto overflow-x-hidden w-full max-w-[100vw] relative z-10 box-border">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-100/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4 -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/40 rounded-full blur-[100px] translate-y-1/3 -translate-x-1/4 -z-10 pointer-events-none"></div>

        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-3 md:py-4 box-border">
          
          {/* DESKTOP CONTENT VIEW */}
          <div className="hidden md:block">
            {/* Header Title Section */}
            <div className="mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-0.5">Leaderboard</h1>
              <p className="text-slate-500 text-xs font-medium">See how you compare with other learners across the platform.</p>
            </div>

            {/* Section 1: Your Rank Card */}
            {currentUserStats && (
              <div className="bg-white rounded-[16px] px-5 py-3 shadow-sm border border-slate-100 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 lg:gap-12 w-full">
                  {/* Avatar & Name */}
                  <div className="flex items-center gap-3 min-w-[180px]">
                    <div className="w-12 h-12 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center font-bold text-lg border-2 border-blue-100 shrink-0">
                      {currentUserStats.user_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-slate-400 tracking-widest uppercase mb-0.5">YOUR RANK</span>
                      <h3 className="text-base font-bold text-[#0F172A] leading-tight">{currentUserStats.user_name}</h3>
                      <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5">
                        <svg className="w-3 h-3 text-[#3466F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                        <span className="font-semibold">{currentUserStats.current_level} Level</span>
                      </div>
                    </div>
                  </div>

                  {/* Vertical Separator */}
                  <div className="hidden md:block w-px h-8 bg-slate-100"></div>

                  {/* Rank Column */}
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Rank</span>
                    <span className="text-xl font-extrabold text-[#3466F6]">#{currentRank}</span>
                  </div>

                  {/* Vertical Separator */}
                  <div className="hidden md:block w-px h-8 bg-slate-100"></div>

                  {/* Lessons Completed */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <BookOpenIcon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#0F172A] leading-tight">{currentUserStats.completed_count}</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Lessons Completed</span>
                    </div>
                  </div>

                  {/* Vertical Separator */}
                  <div className="hidden md:block w-px h-8 bg-slate-100"></div>

                  {/* Streak */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[10px] bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-bold text-[#0F172A] leading-tight">{currentUserStats.current_streak} Days</span>
                      <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Current Streak</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Top 3 Students (Podium) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 items-end">
              {/* Rank 2 - Left */}
              {top3[1] && (
                <div className="bg-white rounded-[16px] px-3 pt-5 pb-4 shadow-sm border border-slate-100 flex-1 relative flex flex-col items-center justify-center min-h-[140px] md:order-1 order-2">
                  {/* Silver Ribbon Badge */}
                  <div className="absolute top-2.5 left-3 flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-5 h-7 text-slate-400 fill-current drop-shadow-sm" viewBox="0 0 24 30">
                        <path d="M0 0h24v24l-12 6-12-6z"/>
                      </svg>
                      <span className="absolute top-0.5 left-0 right-0 text-center font-extrabold text-[9px] text-white">2</span>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-slate-50 border-2 border-slate-100 shadow-sm flex items-center justify-center text-xl font-extrabold text-slate-400 mb-2 shrink-0">
                    {top3[1].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] leading-tight">{top3[1].user_name}</h3>
                  <p className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded mt-0.5">{top3[1].current_level} Level</p>
                  <div className="mt-2 px-2.5 py-0.5 bg-[#EFF6FF] text-[#3466F6] rounded-full text-[10px] font-bold border border-blue-100">
                    {top3[1].xp} XP
                  </div>
                </div>
              )}
              
              {/* Rank 1 - Center (Slightly larger) */}
              {top3[0] && (
                <div className="bg-white rounded-[20px] px-5 pt-6 pb-5 shadow-md border-2 border-amber-300 flex-1 relative flex flex-col items-center justify-center min-h-[160px] md:order-2 order-1 z-10">
                  {/* Gold Trophy Badge */}
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-amber-400 border-2 border-amber-200 flex items-center justify-center shadow-md">
                      <TrophyIcon className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-100 shadow-sm flex items-center justify-center text-2xl font-black text-amber-500 mb-2 shrink-0">
                    {top3[0].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-extrabold text-base text-[#0F172A] leading-tight">{top3[0].user_name}</h3>
                  <p className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded mt-0.5">{top3[0].current_level} Level</p>
                  <div className="mt-3 px-3 py-1 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 rounded-full text-[11px] font-extrabold border border-amber-200 shadow-sm">
                    {top3[0].xp} XP
                  </div>
                </div>
              )}

              {/* Rank 3 - Right */}
              {top3[2] && (
                <div className="bg-white rounded-[16px] px-3 pt-5 pb-4 shadow-sm border border-slate-100 flex-1 relative flex flex-col items-center justify-center min-h-[140px] md:order-3 order-3">
                  {/* Bronze Ribbon Badge */}
                  <div className="absolute top-2.5 left-3 flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-5 h-7 text-amber-700 fill-current drop-shadow-sm" viewBox="0 0 24 30">
                        <path d="M0 0h24v24l-12 6-12-6z"/>
                      </svg>
                      <span className="absolute top-0.5 left-0 right-0 text-center font-extrabold text-[9px] text-white">3</span>
                    </div>
                  </div>
                  
                  <div className="w-12 h-12 rounded-full bg-orange-50 border-2 border-orange-100 shadow-sm flex items-center justify-center text-xl font-extrabold text-orange-400 mb-2 shrink-0">
                    {top3[2].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h3 className="font-bold text-sm text-[#0F172A] leading-tight">{top3[2].user_name}</h3>
                  <p className="text-[9px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded mt-0.5">{top3[2].current_level} Level</p>
                  <div className="mt-2 px-2.5 py-0.5 bg-[#EFF6FF] text-[#3466F6] rounded-full text-[10px] font-bold border border-blue-100">
                    {top3[2].xp} XP
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Filters & Search */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-1 bg-[#F1F5F9] p-0.5 rounded-full border border-slate-200/60">
                <button 
                  onClick={() => setTimeFilter('all')} 
                  className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all ${timeFilter === 'all' ? 'bg-[#3466F6] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
                >
                  All Time
                </button>
                <button 
                  onClick={() => setTimeFilter('month')} 
                  className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all ${timeFilter === 'month' ? 'bg-[#3466F6] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setTimeFilter('week')} 
                  className={`px-4 py-1 rounded-full text-[11px] font-bold transition-all ${timeFilter === 'week' ? 'bg-[#3466F6] text-white shadow-sm' : 'text-slate-500 hover:text-[#0F172A]'}`}
                >
                  This Week
                </button>
              </div>

              <div className="relative w-full md:w-72">
                <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon className="w-3.5 h-3.5" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full py-1.5 pl-9 pr-4 text-[11px] font-semibold text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3466F6]/10 focus:border-[#3466F6] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Section 4: Main Content Grid (Table + Sidebar Cards) */}
            <div className="flex flex-col lg:flex-row gap-4 items-start">
              
              {/* Leaderboard Table Area (~75% width) */}
              <div className="hidden md:flex flex-1 bg-white rounded-[16px] shadow-sm border border-slate-100 overflow-hidden flex-col w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[500px]">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50">
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level</th>
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lessons</th>
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP</th>
                        <th className="py-2.5 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Streak</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentUsers.map((user, idx) => {
                        const rank = (currentPage - 1) * rowsPerPage + idx + 1;
                        const isCurrentUser = user.user_id === effectiveUserId || (effectiveUserId === '' && user.user_name === currentUser.name);
                        
                        return (
                          <tr key={user.user_id} className={`border-b border-slate-50 transition-colors ${isCurrentUser ? 'bg-blue-50/80' : 'hover:bg-slate-50/60'}`}>
                            <td className="py-1.5 px-4">
                              {getRankMedal(rank, isCurrentUser)}
                            </td>
                            <td className="py-1.5 px-4 flex items-center gap-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[9px] shrink-0 ${isCurrentUser ? 'bg-[#3466F6] text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {user.user_name.charAt(0).toUpperCase()}
                              </div>
                              <span className={`font-semibold text-xs ${isCurrentUser ? 'text-[#3466F6]' : 'text-[#0F172A]'}`}>
                                {user.user_name} {isCurrentUser && <span className="font-normal text-[9px] text-[#3466F6]/80 ml-1">(You)</span>}
                              </span>
                            </td>
                            <td className="py-1.5 px-4 text-[11px] font-semibold text-slate-600">{user.current_level}</td>
                            <td className="py-1.5 px-4 text-[11px] font-semibold text-slate-600">{user.completed_count}</td>
                            <td className="py-1.5 px-4 text-[11px] font-bold text-[#3466F6]">{user.xp} XP</td>
                            <td className="py-1.5 px-4 text-[11px] text-orange-500 font-semibold">
                              <div className="flex items-center gap-1">
                                <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                                <span>{user.current_streak} days</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {currentUsers.length === 0 && (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500 text-sm font-semibold">
                            No students found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Pagination */}
                <div className="p-2 px-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-slate-500 font-bold">
                  <div>
                    Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min(currentPage * rowsPerPage, filteredUsers.length)} of {filteredUsers.length} students
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-0.5 text-slate-400 hover:text-[#0F172A] disabled:opacity-30 transition-colors border border-slate-200 rounded hover:bg-slate-50"
                      >
                        <ChevronLeftIcon className="w-3 h-3" />
                      </button>
                      <div className="flex items-center gap-0.5">
                        {[...Array(Math.min(5, totalPages))].map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button 
                              key={pageNum}
                              onClick={() => setCurrentPage(pageNum)}
                              className={`w-5 h-5 rounded flex items-center justify-center font-extrabold transition-all text-[9px] ${currentPage === pageNum ? 'bg-[#3466F6] text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                            >
                              {pageNum}
                            </button>
                          );
                        })}
                        {totalPages > 5 && <span className="px-0.5 text-slate-400">...</span>}
                        {totalPages > 5 && (
                          <button 
                            onClick={() => setCurrentPage(totalPages)}
                            className={`w-5 h-5 rounded flex items-center justify-center font-extrabold transition-all text-[9px] ${currentPage === totalPages ? 'bg-[#3466F6] text-white shadow-sm' : 'hover:bg-slate-100 text-slate-600'}`}
                          >
                            {totalPages}
                          </button>
                        )}
                      </div>
                      <button 
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-0.5 text-slate-400 hover:text-[#0F172A] disabled:opacity-30 transition-colors border border-slate-200 rounded hover:bg-slate-50"
                      >
                        <ChevronRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-[10px]">Rows per page:</span>
                      <select 
                        value={rowsPerPage} 
                        onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                        className="bg-transparent border border-slate-200 rounded py-0.5 px-1 font-bold text-[#0F172A] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#3466F6]"
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Columns (~25% width) */}
              <div className="w-full lg:w-[280px] flex flex-col gap-3 shrink-0">
                
                {/* Your Position Card */}
                <div className="bg-white rounded-[16px] p-4 shadow-sm border border-slate-100 w-full">
                  <h3 className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Your Position</h3>
                  <div className="flex flex-col gap-0 relative pl-1">
                    {/* Connecting Line */}
                    <div className="absolute left-[24px] top-3 bottom-3 w-0.5 bg-slate-100"></div>
                    
                    {nearbyRanks.map((user) => {
                      const isYou = user.user_id === effectiveUserId || (effectiveUserId === '' && user.user_name === currentUser.name);
                      return (
                        <div key={user.user_id} className={`flex items-center gap-2 p-0.5 rounded-lg transition-all ${isYou ? 'bg-blue-50/80' : ''}`}>
                          <div className={`w-6 text-right text-[10px] font-bold flex items-center justify-end ${isYou ? 'text-[#3466F6]' : 'text-slate-400'}`}>
                            {isYou ? <span className="mr-0.5 text-[8px]">👉</span> : ''}
                            <span>{user.rank}</span>
                          </div>
                          
                          {/* Circle Dot with Connecting line alignment */}
                          <div className="relative flex items-center justify-center w-2.5 h-2.5 z-10 shrink-0">
                            <div className={`w-1.5 h-1.5 rounded-full border border-white ${isYou ? 'bg-[#3466F6] ring-2 ring-blue-100' : 'bg-slate-300'}`}></div>
                          </div>

                          <div className={`w-5 h-5 rounded-full flex items-center justify-center font-extrabold text-[8px] shrink-0 ${isYou ? 'bg-[#EFF6FF] text-[#3466F6]' : 'bg-slate-100 text-slate-500'}`}>
                            {user.user_name.charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex-1 text-[10px] font-semibold truncate ${isYou ? 'text-[#3466F6]' : 'text-[#0F172A]'}`}>
                            {isYou ? `You (${user.user_name})` : user.user_name}
                          </div>
                          <div className={`text-[10px] font-extrabold ${isYou ? 'text-[#3466F6]' : 'text-slate-500'}`}>
                            {user.xp} XP
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Motivation Card */}
                {currentUserIndex > 0 && (
                  <div className="bg-[#3466F6] rounded-[16px] p-4 text-white relative overflow-hidden w-full shadow-[0_8px_20px_rgba(52,102,246,0.25)]">
                    {/* Subtle White circle with trending up icon */}
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <TrendingUpIcon className="w-4 h-4 text-[#3466F6]" />
                    </div>
                    
                    <h3 className="text-base font-bold mb-1 leading-tight">
                      Only {xpToNextRank} XP<br/>to reach Rank #{currentRank - 1}
                    </h3>
                    <p className="text-blue-100 text-[10px] mb-3">Complete one lesson to climb higher.</p>
                    
                    <button 
                      onClick={onLessons}
                      className="w-full bg-white text-[#3466F6] font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-blue-50 transition-all text-[11px] shadow-sm uppercase tracking-wider"
                    >
                      Start a Lesson <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Top Victory Card for #1 Rank */}
                {currentUserIndex === 0 && (
                  <div className="bg-amber-400 rounded-[16px] p-4 text-white relative overflow-hidden w-full shadow-[0_8px_20px_rgba(245,158,11,0.25)]">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mb-2 shadow-sm">
                      <TrophyIcon className="w-4 h-4 text-amber-500" />
                    </div>
                    
                    <h3 className="text-base font-bold mb-1 leading-tight">
                      You are Rank #1!
                    </h3>
                    <p className="text-amber-50 text-[10px] mb-3">Keep learning to maintain your lead.</p>
                    
                    <button 
                      onClick={onLessons}
                      className="w-full bg-white text-amber-500 font-bold py-2 rounded-lg flex items-center justify-center gap-1.5 hover:bg-amber-50 transition-all text-[11px] shadow-sm uppercase tracking-wider"
                    >
                      Keep Learning <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                
              </div>
            </div>
          </div>
          {/* MOBILE CONTENT VIEW */}
          <div className="block md:hidden space-y-6 w-full max-w-[100vw] box-border overflow-x-hidden pb-10">
            {/* Page Title */}
            <div>
              <h1 className="text-3xl font-extrabold text-[#0F172A] mb-1">Leaderboard</h1>
              <p className="text-slate-500 text-xs font-semibold leading-relaxed">See how you compare with other learners across the platform.</p>
            </div>

            {/* Section 1: Your Rank Card (Mobile Profile Card) */}
            {currentUserStats && (
              <div className="bg-white rounded-[24px] p-6 shadow-sm border border-slate-100/60 flex flex-col w-full">
                {/* Top Row: Avatar & Username + Level */}
                <div className="flex items-center gap-4 w-full">
                  <div className="w-16 h-16 rounded-full bg-[#EFF6FF] text-[#3466F6] flex items-center justify-center font-bold text-2xl border border-blue-100 shrink-0">
                    {currentUserStats.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-[#0F172A] leading-tight">{currentUserStats.user_name}</h3>
                    <div className="flex items-center gap-1 bg-[#EFF6FF] text-[#3466F6] px-2.5 py-1 rounded-md text-xs font-bold w-max mt-1.5">
                      <svg className="w-3.5 h-3.5 text-[#3466F6]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                      <span>{currentUserStats.current_level} Level</span>
                    </div>
                  </div>
                </div>

                {/* Divider Line */}
                <div className="w-full h-px bg-slate-100 my-5"></div>

                {/* Bottom Row: 3 Stats Grid */}
                <div className="grid grid-cols-3 w-full gap-2 text-center items-center">
                  {/* Stat 1: Rank */}
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Rank</span>
                    <span className="text-xl font-bold text-[#3466F6] mt-1">#{currentRank}</span>
                  </div>

                  {/* Stat 2: Lessons Completed */}
                  <div className="flex flex-col items-center border-l border-slate-100">
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                      <BookOpenIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-base font-bold text-[#0F172A]">{currentUserStats.completed_count}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1.5 leading-tight">Lessons Completed</span>
                  </div>

                  {/* Stat 3: Streak */}
                  <div className="flex flex-col items-center border-l border-slate-100">
                    <div className="flex items-center gap-1.5 justify-center mt-0.5">
                      <svg className="w-4 h-4 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                      <span className="text-base font-bold text-[#0F172A]">{currentUserStats.current_streak} Days</span>
                    </div>
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider text-center mt-1.5 leading-tight">Current Streak</span>
                  </div>
                </div>
              </div>
            )}

            {/* Section 2: Top 3 Cards (Podium - Side-by-Side in Single Row) */}
            <div className="flex items-end gap-2 w-full justify-between pt-4 pb-2">
              {/* Rank 2 (Silver) */}
              {top3[1] && (
                <div className="bg-white rounded-[16px] p-2.5 pt-6 pb-4 shadow-sm border border-slate-100/60 flex-1 min-w-0 flex flex-col items-center relative text-center">
                  {/* Silver Ribbon Badge */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-5.5 h-7.5 text-slate-400 fill-current drop-shadow-sm" viewBox="0 0 24 30">
                        <path d="M0 0h24v24l-12 6-12-6z"/>
                      </svg>
                      <span className="absolute top-0.5 left-0 right-0 text-center font-extrabold text-[8px] text-white">2</span>
                    </div>
                  </div>
                  
                  <div className="w-11 h-11 rounded-full bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-sm font-bold text-slate-400 mb-2 shrink-0">
                    {top3[1].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-[11px] text-[#0F172A] truncate w-full">{top3[1].user_name}</h4>
                  <p className="text-[8px] font-semibold text-slate-500 bg-slate-50 px-1 py-0.5 rounded mt-0.5 truncate w-full">{top3[1].current_level} Level</p>
                  <div className="mt-3 px-2 py-0.5 bg-[#EFF6FF] text-[#3466F6] rounded-full text-[9px] font-bold border border-blue-100 shrink-0">
                    {top3[1].xp} XP
                  </div>
                </div>
              )}

              {/* Rank 1 (Gold) - Highlighted & Lifted */}
              {top3[0] && (
                <div className="bg-white rounded-[20px] p-3 pt-7 pb-5 shadow-md border-2 border-amber-300 flex-1 min-w-0 flex flex-col items-center relative z-10 text-center -translate-y-1">
                  {/* Gold Trophy Badge */}
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-amber-400 border border-amber-200 flex items-center justify-center shadow-md">
                      <TrophyIcon className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                  
                  <div className="w-13 h-13 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center text-lg font-black text-amber-500 mb-2 shrink-0">
                    {top3[0].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-extrabold text-[12px] text-[#0F172A] truncate w-full">{top3[0].user_name}</h4>
                  <p className="text-[8px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded mt-0.5 truncate w-full">{top3[0].current_level} Level</p>
                  <div className="mt-3 px-2 py-0.5 bg-gradient-to-r from-amber-100 to-amber-50 text-amber-600 rounded-full text-[9px] font-extrabold border border-amber-200 shadow-sm shrink-0">
                    {top3[0].xp} XP
                  </div>
                </div>
              )}

              {/* Rank 3 (Bronze) */}
              {top3[2] && (
                <div className="bg-white rounded-[16px] p-2.5 pt-6 pb-4 shadow-sm border border-slate-100/60 flex-1 min-w-0 flex flex-col items-center relative text-center">
                  {/* Bronze Ribbon Badge */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col items-center">
                    <div className="relative">
                      <svg className="w-5.5 h-7.5 text-amber-700 fill-current drop-shadow-sm" viewBox="0 0 24 30">
                        <path d="M0 0h24v24l-12 6-12-6z"/>
                      </svg>
                      <span className="absolute top-0.5 left-0 right-0 text-center font-extrabold text-[8px] text-white">3</span>
                    </div>
                  </div>
                  
                  <div className="w-11 h-11 rounded-full bg-orange-50 border-2 border-orange-100 flex items-center justify-center text-sm font-bold text-orange-400 mb-2 shrink-0">
                    {top3[2].user_name.charAt(0).toUpperCase()}
                  </div>
                  <h4 className="font-bold text-[11px] text-[#0F172A] truncate w-full">{top3[2].user_name}</h4>
                  <p className="text-[8px] font-semibold text-slate-500 bg-slate-50 px-1 py-0.5 rounded mt-0.5 truncate w-full">{top3[2].current_level} Level</p>
                  <div className="mt-3 px-2 py-0.5 bg-[#EFF6FF] text-[#3466F6] rounded-full text-[9px] font-bold border border-blue-100 shrink-0">
                    {top3[2].xp} XP
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Filters & Search */}
            <div className="space-y-3">
              {/* Filters */}
              <div className="flex items-center gap-1.5 w-full">
                <button 
                  onClick={() => setTimeFilter('all')} 
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all border text-center ${
                    timeFilter === 'all' 
                      ? 'bg-[#3466F6] text-white border-[#3466F6] shadow-sm' 
                      : 'bg-white text-slate-500 border-slate-200 hover:text-[#0F172A]'
                  }`}
                >
                  All Time
                </button>
                <button 
                  onClick={() => setTimeFilter('month')} 
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all border text-center ${
                    timeFilter === 'month' 
                      ? 'bg-[#3466F6] text-white border-[#3466F6] shadow-sm' 
                      : 'bg-white text-slate-500 border-slate-200 hover:text-[#0F172A]'
                  }`}
                >
                  This Month
                </button>
                <button 
                  onClick={() => setTimeFilter('week')} 
                  className={`flex-1 py-2 rounded-full text-xs font-bold transition-all border text-center ${
                    timeFilter === 'week' 
                      ? 'bg-[#3466F6] text-white border-[#3466F6] shadow-sm' 
                      : 'bg-white text-slate-500 border-slate-200 hover:text-[#0F172A]'
                  }`}
                >
                  This Week
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400">
                  <SearchIcon className="w-4 h-4" />
                </div>
                <input 
                  type="text" 
                  placeholder="Search student..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-full py-2.5 pl-11 pr-4 text-xs font-semibold text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#3466F6]/10 focus:border-[#3466F6] transition-all shadow-sm"
                />
              </div>
            </div>

            {/* Section 4: Leaderboard Table Area */}
            <div className="bg-white rounded-[24px] shadow-sm border border-slate-100/60 overflow-hidden flex flex-col w-full">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Rank</th>
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Level</th>
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Lessons</th>
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">XP</th>
                      <th className="py-3 px-4 text-[9px] font-bold text-slate-400 uppercase tracking-widest">Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentUsers.map((user, idx) => {
                      const rank = (currentPage - 1) * rowsPerPage + idx + 1;
                      const isCurrentUser = user.user_id === effectiveUserId || (effectiveUserId === '' && user.user_name === currentUser.name);
                      
                      return (
                        <tr key={user.user_id} className={`border-b border-slate-50 transition-colors ${isCurrentUser ? 'bg-blue-50/80' : 'hover:bg-slate-50/60'}`}>
                          <td className="py-3 px-4">
                            {getRankMedal(rank, isCurrentUser)}
                          </td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${isCurrentUser ? 'bg-[#3466F6] text-white' : 'bg-slate-100 text-slate-500'}`}>
                              {user.user_name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`font-semibold text-xs truncate max-w-[100px] ${isCurrentUser ? 'text-[#3466F6]' : 'text-[#0F172A]'}`}>
                              {user.user_name} {isCurrentUser && <span className="font-normal text-[10px] text-[#3466F6]/80">(You)</span>}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-600">{user.current_level}</td>
                          <td className="py-3 px-4 text-xs font-semibold text-slate-600">{user.completed_count}</td>
                          <td className="py-3 px-4 text-xs font-bold text-[#3466F6]">{user.xp} XP</td>
                          <td className="py-3 px-4 text-xs text-orange-500 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3 text-orange-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path></svg>
                            <span>{user.current_streak} days</span>
                          </td>
                        </tr>
                      );
                    })}
                    {currentUsers.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-10 text-center text-slate-500 text-xs font-semibold">
                          No students found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="p-3 border-t border-slate-100 flex flex-col items-center gap-2.5 text-[10px] text-slate-500 font-bold bg-slate-50/20">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === 1}
                      className="p-1 text-slate-400 hover:text-[#0F172A] disabled:opacity-30 border border-slate-200 rounded"
                    >
                      <ChevronLeftIcon className="w-3.5 h-3.5" />
                    </button>
                    <span>Page {currentPage} of {totalPages}</span>
                    <button 
                      onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); document.querySelector('.overflow-y-auto')?.scrollTo({ top: 0, behavior: 'smooth' }); }}
                      disabled={currentPage === totalPages}
                      className="p-1 text-slate-400 hover:text-[#0F172A] disabled:opacity-30 border border-slate-200 rounded"
                    >
                      <ChevronRightIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1.5">
                    <span>Rows per page:</span>
                    <select 
                      value={rowsPerPage} 
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="bg-transparent border border-slate-200 rounded py-0.5 px-1 font-bold text-[#0F172A] cursor-pointer focus:outline-none"
                    >
                      <option value={10}>10</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Section 5: Nearby Rankings (Your Position) */}
            <div className="bg-white rounded-[24px] p-5 shadow-sm border border-slate-100/60 w-full">
              <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3.5">Your Position</h3>
              <div className="flex flex-col gap-1 relative pl-1">
                <div className="absolute left-[36px] top-4 bottom-4 w-0.5 bg-slate-100"></div>
                
                {nearbyRanks.map((user) => {
                  const isYou = user.user_id === effectiveUserId || (effectiveUserId === '' && user.user_name === currentUser.name);
                  return (
                    <div key={user.user_id} className={`flex items-center gap-3 p-1.5 rounded-xl transition-all ${isYou ? 'bg-blue-50/80' : ''}`}>
                      <div className={`w-8 text-right text-xs font-bold flex items-center justify-end ${isYou ? 'text-[#3466F6]' : 'text-slate-400'}`}>
                        {isYou ? <span className="mr-1">👉</span> : ''}
                        <span>{user.rank}</span>
                      </div>
                      
                      <div className="relative flex items-center justify-center w-3 h-3 z-10 shrink-0">
                        <div className={`w-2 h-2 rounded-full border border-white ${isYou ? 'bg-[#3466F6] ring-2 ring-blue-100' : 'bg-slate-300'}`}></div>
                      </div>

                      <div className={`w-7 h-7 rounded-full flex items-center justify-center font-extrabold text-[10px] shrink-0 ${isYou ? 'bg-[#EFF6FF] text-[#3466F6]' : 'bg-slate-100 text-slate-500'}`}>
                        {user.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className={`flex-1 text-xs font-semibold truncate ${isYou ? 'text-[#3466F6]' : 'text-[#0F172A]'}`}>
                        {isYou ? `You (${user.user_name})` : user.user_name}
                      </div>
                      <div className={`text-xs font-extrabold ${isYou ? 'text-[#3466F6]' : 'text-slate-500'}`}>
                        {user.xp} XP
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Section 6: Motivation Card */}
            {currentUserIndex > 0 && (
              <div className="bg-[#3466F6] rounded-[24px] p-6 text-white relative overflow-hidden shadow-[0_10px_25px_rgba(52,102,246,0.25)] w-full">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <TrendingUpIcon className="w-6 h-6 text-[#3466F6]" />
                </div>
                
                <h3 className="text-xl font-bold mb-1.5 leading-tight">
                  Only {xpToNextRank} XP<br/>to reach Rank #{currentRank - 1}
                </h3>
                <p className="text-blue-100 text-xs mb-6">Complete one lesson to climb higher.</p>
                
                <button 
                  onClick={onLessons}
                  className="w-full bg-white text-[#3466F6] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all text-xs shadow-sm uppercase tracking-wider"
                >
                  Start a Lesson <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}

            {currentUserIndex === 0 && (
              <div className="bg-amber-400 rounded-[24px] p-6 text-white relative overflow-hidden shadow-[0_10px_25px_rgba(245,158,11,0.25)] w-full">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
                  <TrophyIcon className="w-6 h-6 text-amber-500" />
                </div>
                
                <h3 className="text-xl font-bold mb-1.5 leading-tight">
                  You are Rank #1!
                </h3>
                <p className="text-amber-50 text-xs mb-6">Keep learning to maintain your lead.</p>
                
                <button 
                  onClick={onLessons}
                  className="w-full bg-white text-amber-500 font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-50 transition-all text-xs shadow-sm uppercase tracking-wider"
                >
                  Keep Learning <ChevronRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
});

export default Leaderboard;
