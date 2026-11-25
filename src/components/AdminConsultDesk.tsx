import React, { useState, useEffect, useRef, useMemo } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ConsultThread, ConsultMessage, Lesson } from '../types';
import {
  ArrowLeftIcon, MessageSquareIcon, SendIcon, CheckCircleIcon, LoaderIcon,
  RefreshIcon, SearchIcon, BrainCircuitIcon, LayoutDashboardIcon, BookOpenIcon,
  TrophyIcon, AwardIcon, SettingsIcon
} from './Icons';
import { useCMS } from '../context/CMSContext';
import { Header } from './Header';

export const AdminConsultDesk = ({ 
  lessons, 
  onBack,
  candidateName = 'Admin',
  avatarUrl = null
}: { 
  lessons: Lesson[], 
  onBack: () => void,
  candidateName?: string,
  avatarUrl?: string | null
}) => {
  const { isAdmin } = useCMS();
  const [threads, setThreads] = useState<ConsultThread[]>([]);
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ConsultThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'resolved'>('all');
  const [loading, setLoading] = useState(true);
  const [mobileShowChat, setMobileShowChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Map each lesson strictly by numeric ID so thread -> lesson title never collides or depends on ordering
  const lessonsById = useMemo(() => {
    const map = new Map<number, Lesson>();
    lessons.forEach((l) => {
      map.set(Number(l.id), l);
    });
    return map;
  }, [lessons]);

  const getLessonTitle = (thread: ConsultThread): string => {
    if (thread.lesson_id === null || thread.lesson_id === undefined) {
      return 'General Enquiry';
    }
    const lesson = lessonsById.get(Number(thread.lesson_id));
    return lesson?.title?.trim() || 'General Enquiry';
  };

  // Fetch all threads (Only runs if Admin because of RLS)
  const fetchThreads = async () => {
    try {
      const { data } = await supabase
        .from('consult_threads')
        .select('*')
        .order('updated_at', { ascending: false });
        
      if (data) setThreads(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchThreads();
  }, [isAdmin]);

  // Fetch messages for a specific thread
  const fetchMessages = async (threadId: string) => {
    const { data } = await supabase
      .from('consult_messages')
      .select('*')
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });
    
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (activeThread) {
      fetchMessages(activeThread.id);
      
      const channel = supabase.channel(`messages-${activeThread.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'consult_messages', filter: `thread_id=eq.${activeThread.id}` },
          (payload) => {
            const incoming = payload.new as ConsultMessage;
            setMessages((prev) => {
              if (prev.find(m => m.id === incoming.id)) return prev;
              return [...prev, incoming];
            });
            fetchThreads();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeThread?.id]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeThread) return;
    
    const { data: newMsg, error } = await supabase.from('consult_messages').insert([{
      thread_id: activeThread.id,
      sender_role: 'admin',
      message: replyText
    }]).select().single();

    if (!error && newMsg) {
      setReplyText('');
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      if (activeThread.status === 'resolved') {
        await supabase.from('consult_threads').update({ status: 'open' }).eq('id', activeThread.id);
        setActiveThread({ ...activeThread, status: 'open' });
        fetchThreads();
      }
    }
  };

  const handleMarkResolved = async () => {
    if (!activeThread) return;
    await supabase.from('consult_threads').update({ status: 'resolved' }).eq('id', activeThread.id);
    setActiveThread(null);
    setMobileShowChat(false);
    fetchThreads();
  };

  const handleSelectThread = (thread: ConsultThread) => {
    setActiveThread(thread);
    setMobileShowChat(true);
  };

  const handleMobileBack = () => {
    setMobileShowChat(false);
    setActiveThread(null);
  };

  const openCount = useMemo(() => threads.filter(t => t.status === 'open').length, [threads]);

  const filteredThreads = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return threads.filter(thread => {
      if (statusFilter !== 'all' && thread.status !== statusFilter) return false;
      if (!q) return true;
      const lessonTitle = getLessonTitle(thread).toLowerCase();
      return (
        thread.user_name.toLowerCase().includes(q) ||
        lessonTitle.includes(q)
      );
    });
  }, [threads, searchQuery, statusFilter, lessonsById]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans text-[#0F172A] overflow-x-hidden">

      {/* Desktop / Tablet Sidebar — consistent menu order */}
      <aside className="hidden md:flex w-64 border-r border-[#E2E8F0] bg-white flex-col shrink-0">
        <div className="p-6 pb-8 flex items-center gap-3 cursor-pointer" onClick={() => window.location.hash = '#userDashboard'}>
          <div className="w-10 h-10 bg-[#3466F6] rounded-xl flex items-center justify-center text-white shrink-0">
            <BrainCircuitIcon className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-[17px] font-bold tracking-[0.1em] text-[#0F172A] font-serif leading-none mb-1">SYLLOSPHERE</h1>
            <p className="text-[7px] font-bold text-[#64748B] tracking-widest uppercase">Master Logic. Ace Every Exam.</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1.5">
          <button onClick={() => window.location.hash = '#userDashboard'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <LayoutDashboardIcon className="w-5 h-5" /> Dashboard
          </button>
          <button onClick={() => window.location.hash = '#levelSelection'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <BookOpenIcon className="w-5 h-5" /> Lessons
          </button>
          <button onClick={() => window.location.hash = '#leaderboard'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <TrophyIcon className="w-5 h-5" /> Leaderboard
          </button>
          <button onClick={() => window.location.hash = '#certificate'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <AwardIcon className="w-5 h-5" /> Certificates
          </button>
          <button onClick={() => window.location.hash = '#adminConsult'} className="w-full flex items-center justify-between px-4 py-3.5 bg-[#EFF6FF] text-[#3466F6] rounded-[16px] font-bold text-sm transition-all">
            <span className="flex items-center gap-3">
              <MessageSquareIcon className="w-5 h-5" /> Consult Desk
            </span>
            {openCount > 0 && (
              <span className="text-[10px] font-bold bg-[#3466F6] text-white px-2 py-0.5 rounded-full">{openCount}</span>
            )}
          </button>
          <button onClick={() => window.location.hash = '#settings'} className="w-full flex items-center gap-3 px-4 py-3.5 text-[#64748B] hover:bg-slate-50 hover:text-[#0F172A] rounded-[16px] font-medium text-sm transition-all">
            <SettingsIcon className="w-5 h-5" /> Settings
          </button>
        </nav>
      </aside>

      {/* Right Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Header userName={candidateName} variant="dashboard" isAdmin={isAdmin} avatarUrl={avatarUrl} />

        {/* Content */}
        <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full px-3 sm:px-5 lg:px-8 py-4 md:py-6 min-h-0 overflow-hidden">
          
          {/* Page Title Bar */}
          <div className="mb-4 flex items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <button onClick={onBack} className="p-2 bg-white text-[#64748B] rounded-xl hover:bg-slate-50 hover:text-[#0F172A] transition-colors border border-[#E2E8F0] shadow-sm shrink-0" aria-label="Back to dashboard">
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div className="min-w-0">
                <h1 className="text-[20px] md:text-[24px] font-bold text-[#0F172A] leading-tight truncate">Consult Desk</h1>
                <p className="text-[11px] md:text-[12px] text-[#64748B] font-medium">
                  {threads.length} conversation{threads.length !== 1 ? 's' : ''} {openCount > 0 ? `• ${openCount} unread` : '• All resolved'}
                </p>
              </div>
            </div>
            <button
              onClick={fetchThreads}
              className="bg-white border border-[#E2E8F0] text-[#64748B] px-3 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#EFF6FF] hover:text-[#3466F6] hover:border-[#3466F6]/30 transition-all shadow-sm shrink-0"
            >
              <RefreshIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Sync Threads</span>
            </button>
          </div>

          {/* Two-Panel Consultation Workspace */}
          <div className="flex-1 flex gap-4 md:gap-5 min-h-0 overflow-hidden">
            
            {/* Thread List Panel */}
            <div className={`w-full md:w-[320px] lg:w-[360px] bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col shrink-0 overflow-hidden ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-3.5 border-b border-[#E2E8F0] bg-[#F8FAFC] space-y-2.5 shrink-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-[#94A3B8]">
                    <SearchIcon className="w-4 h-4" />
                  </div>
                  <input 
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search student or lesson..." 
                    className="w-full pl-9 pr-3 py-2 bg-white border border-[#E2E8F0] rounded-xl text-sm text-[#0F172A] placeholder-[#94A3B8] focus:outline-none focus:border-[#3466F6] focus:ring-2 focus:ring-[#3466F6]/10 transition-colors"
                  />
                </div>
                <div className="flex items-center gap-1.5">
                  {(['all', 'open', 'resolved'] as const).map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setStatusFilter(tab)}
                      className={`flex-1 py-1.5 px-2 rounded-lg text-[11px] font-bold capitalize transition-all ${
                        statusFilter === tab
                          ? 'bg-[#3466F6] text-white shadow-sm'
                          : 'bg-white text-[#64748B] border border-[#E2E8F0] hover:text-[#0F172A]'
                      }`}
                    >
                      {tab === 'open' ? 'Unread' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="flex-1 flex justify-center items-center">
                  <LoaderIcon className="w-7 h-7 text-[#3466F6] animate-spin" />
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto">
                  {filteredThreads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                      <div className="w-14 h-14 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-4">
                        <MessageSquareIcon className="w-6 h-6 text-[#3466F6]" />
                      </div>
                      <p className="text-[#64748B] text-sm font-medium">No matching conversations.</p>
                    </div>
                  )}
                  {filteredThreads.map(thread => {
                    const isSelected = activeThread?.id === thread.id;
                    const isOpen = thread.status === 'open';
                    const lessonTitle = getLessonTitle(thread);
                    return (
                      <button 
                        key={thread.id}
                        onClick={() => handleSelectThread(thread)}
                        className={`w-full text-left px-4 py-3.5 border-b border-[#F1F5F9] transition-all border-l-[3px] ${
                          isSelected 
                            ? 'bg-[#EFF6FF] border-l-[#3466F6]' 
                            : isOpen
                              ? 'bg-white hover:bg-[#F8FAFC] border-l-transparent'
                              : 'bg-[#F8FAFC]/60 hover:bg-[#F1F5F9]/60 border-l-transparent'
                        }`}
                      >
                        <div className="flex justify-between items-center gap-2 mb-1.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? 'bg-[#3466F6] text-white'
                                : isOpen
                                  ? 'bg-[#EFF6FF] text-[#3466F6] border border-blue-100'
                                  : 'bg-[#E2E8F0] text-[#64748B]'
                            }`}>
                              {thread.user_name.charAt(0).toUpperCase()}
                            </div>
                            <span className={`text-[13px] truncate ${
                              isSelected || isOpen ? 'font-bold text-[#0F172A]' : 'font-medium text-[#475569]'
                            }`}>
                              {thread.user_name}
                            </span>
                          </div>
                          {isOpen ? (
                            <span className="inline-flex items-center gap-1.5 text-[9px] font-bold text-[#3466F6] bg-[#EFF6FF] border border-blue-100 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#3466F6]"></span> Unread
                            </span>
                          ) : (
                            <span className="text-[9px] text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className={`text-[11px] font-semibold truncate pl-[42px] ${
                          isSelected ? 'text-[#1D4ED8]' : isOpen ? 'text-[#3466F6]' : 'text-[#64748B]'
                        }`}>
                          {lessonTitle}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Chat Panel */}
            <div className={`flex-1 min-w-0 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden ${mobileShowChat ? 'flex' : 'hidden md:flex'}`}>
              {activeThread ? (
                <>
                  {/* Chat Header */}
                  <div className="px-4 md:px-6 py-3.5 border-b border-[#E2E8F0] bg-white flex justify-between items-center gap-3 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                      <button onClick={handleMobileBack} className="md:hidden p-1.5 text-[#64748B] hover:text-[#0F172A] transition-colors shrink-0" aria-label="Back to thread list">
                        <ArrowLeftIcon className="w-4 h-4" />
                      </button>
                      <div className="w-10 h-10 bg-[#3466F6] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
                        {activeThread.user_name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-[14px] font-bold text-[#0F172A] truncate">{activeThread.user_name}</h3>
                          {activeThread.status === 'resolved' && (
                            <span className="text-[9px] text-[#059669] font-bold bg-[#ECFDF5] border border-[#A7F3D0] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
                              Resolved
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#3466F6] font-semibold truncate">
                          {getLessonTitle(activeThread)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button 
                        onClick={() => fetchMessages(activeThread.id)} 
                        className="bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#EFF6FF] hover:text-[#3466F6] hover:border-[#3466F6]/30 transition-all"
                      >
                        <RefreshIcon className="w-3 h-3" /> <span className="hidden sm:inline">Refresh</span>
                      </button>
                      {activeThread.status === 'open' && (
                        <button 
                          onClick={handleMarkResolved} 
                          className="bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-[#D1FAE5] transition-all"
                        >
                          <CheckCircleIcon className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Mark Resolved</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Messages Area */}
                  <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-[#FAFBFC]">
                    {messages.map(msg => {
                      const isAdminMsg = msg.sender_role === 'admin';
                      return (
                        <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] md:max-w-[72%] rounded-2xl px-4 py-3 break-words ${
                            isAdminMsg 
                              ? 'bg-[#3466F6] text-white rounded-br-md shadow-md shadow-blue-500/10' 
                              : 'bg-white border border-[#E2E8F0] text-[#334155] rounded-bl-md shadow-sm'
                          }`}>
                            <p className="text-[13px] md:text-[14px] leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                            <span className={`text-[9px] block mt-1.5 text-right ${isAdminMsg ? 'text-blue-200' : 'text-[#94A3B8]'}`}>
                              {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Reply Input */}
                  <div className="p-3 md:p-4 bg-white border-t border-[#E2E8F0] shrink-0">
                    <div className="flex gap-2 items-end bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-2 focus-within:border-[#3466F6] focus-within:ring-2 focus-within:ring-[#3466F6]/15 transition-all">
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                        placeholder="Type your response..."
                        className="flex-1 bg-transparent border-none resize-none focus:outline-none text-[13px] md:text-[14px] text-[#0F172A] p-2 min-h-[44px] max-h-[120px] placeholder-[#94A3B8]"
                        rows={2}
                      />
                      <button 
                        onClick={handleSendReply}
                        disabled={!replyText.trim()}
                        className="self-end p-2.5 bg-[#3466F6] text-white rounded-lg hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-sm shrink-0"
                        aria-label="Send reply"
                      >
                        <SendIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                  <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-5">
                    <MessageSquareIcon className="w-8 h-8 text-[#3466F6]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0F172A] mb-2">Consultation Desk</h3>
                  <p className="text-[#64748B] text-sm max-w-sm leading-relaxed">
                    Select a student's thread from the left to view their questions and provide guidance.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
