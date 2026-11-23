import React, { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ConsultThread, ConsultMessage, Lesson } from '../types';
import {
  ArrowLeftIcon, MessageSquareIcon, SendIcon, CheckCircleIcon,
  LoaderIcon, RefreshIcon, XCircleIcon, SearchIcon
} from './Icons';
import { useCMS } from '../context/CMSContext';

interface ThreadWithMeta extends ConsultThread {
  unread_count?: number;
  last_message_preview?: string;
  last_message_at?: string;
  user_email?: string;
}

export const AdminConsultUpgraded = ({
  lessons,
  onBack
}: {
  lessons: Lesson[],
  onBack: () => void
}) => {
  const { isAdmin } = useCMS();
  const [threads, setThreads] = useState<ThreadWithMeta[]>([]);
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ThreadWithMeta | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchThreads = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const { data } = await supabase
        .from('consult_threads')
        .select('*')
        .order('last_message_at', { ascending: false, nullsFirst: false });
      if (data) setThreads(data as ThreadWithMeta[]);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) fetchThreads();
  }, [isAdmin, fetchThreads]);

  // Realtime: listen for new threads
  useEffect(() => {
    if (!isAdmin) return;
    const channel = supabase.channel('admin-threads-feed')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'consult_threads' }, () => {
        fetchThreads();
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isAdmin, fetchThreads]);

  // Fetch messages for selected thread & mark as read
  const openThread = async (thread: ThreadWithMeta) => {
    setActiveThread(thread);
    const { data } = await supabase
      .from('consult_messages')
      .select('*')
      .eq('thread_id', thread.id)
      .order('created_at', { ascending: true });
    if (data) setMessages(data as ConsultMessage[]);

    // Mark thread as read (call DB function)
    await supabase.rpc('mark_thread_read', { p_thread_id: thread.id });
    // Optimistically clear unread badge
    setThreads(prev => prev.map(t => t.id === thread.id ? { ...t, unread_count: 0 } : t));
    setTimeout(scrollToBottom, 100);
  };

  // Realtime: messages for the active thread
  useEffect(() => {
    if (!activeThread) return;
    const channel = supabase.channel(`admin-msgs-${activeThread.id}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'consult_messages', filter: `thread_id=eq.${activeThread.id}` },
        (payload) => {
          setMessages(prev => {
            if (prev.find(m => m.id === payload.new.id)) return prev;
            return [...prev, payload.new as ConsultMessage];
          });
          fetchThreads();
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [activeThread, fetchThreads]);

  const handleSendReply = async () => {
    if (!replyText.trim() || !activeThread || sending) return;
    setSending(true);
    const msgText = replyText.trim();
    setReplyText('');
    try {
      const { data: newMsg, error } = await supabase
        .from('consult_messages')
        .insert([{ thread_id: activeThread.id, sender_role: 'admin', message: msgText }])
        .select().single();
      if (error) throw error;
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg as ConsultMessage];
      });
      if (activeThread.status === 'resolved') {
        await supabase.from('consult_threads').update({ status: 'open' }).eq('id', activeThread.id);
        fetchThreads();
      }
      setTimeout(scrollToBottom, 100);
    } finally {
      setSending(false);
    }
  };

  const handleMarkResolved = async () => {
    if (!activeThread) return;
    await supabase.from('consult_threads').update({ status: 'resolved' }).eq('id', activeThread.id);
    setActiveThread(prev => prev ? { ...prev, status: 'resolved' } : prev);
    fetchThreads();
  };

  const totalUnread = threads.reduce((s, t) => s + (t.unread_count || 0), 0);
  const filteredThreads = search
    ? threads.filter(t =>
        (t.user_name || '').toLowerCase().includes(search.toLowerCase()) ||
        (t.user_email || '').toLowerCase().includes(search.toLowerCase())
      )
    : threads;

  return (
    <div className="min-h-screen bg-[#020617] pt-20 md:pt-24 px-4 md:px-6 pb-6 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6 h-[calc(100vh-7rem)]">

        {/* ── LEFT: Thread List ────────────────────────────── */}
        <div className="w-full md:w-80 shrink-0 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-5 border-b border-white/5 shrink-0">
            <div className="flex items-center gap-3 mb-4">
              <button onClick={onBack} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white hover:bg-slate-700 transition-colors">
                <ArrowLeftIcon className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <h2 className="text-base font-bold text-white">Consult Inbox</h2>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  {threads.length} threads{totalUnread > 0 ? ` · ${totalUnread} unread` : ''}
                </p>
              </div>
              <button onClick={fetchThreads} className="p-2 bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors">
                <RefreshIcon className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Search */}
            <div className="relative">
              <SearchIcon className="w-3.5 h-3.5 text-slate-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search student..."
                className="w-full bg-slate-800/50 border border-white/5 rounded-lg py-2 pl-8 pr-3 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/40 transition-colors"
              />
            </div>
          </div>

          {/* Thread List */}
          <div className="flex-1 overflow-y-auto no-scrollbar">
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <LoaderIcon className="w-6 h-6 text-blue-500 animate-spin" />
              </div>
            ) : filteredThreads.length === 0 ? (
              <p className="text-center text-slate-600 text-xs py-10">No conversations yet.</p>
            ) : (
              filteredThreads.map(thread => {
                const lesson = lessons.find(l => l.id === thread.lesson_id);
                const isActive = activeThread?.id === thread.id;
                const hasUnread = (thread.unread_count || 0) > 0;
                return (
                  <button
                    key={thread.id}
                    onClick={() => openThread(thread)}
                    className={`w-full text-left px-4 py-3.5 border-b border-white/5 transition-all ${
                      isActive ? 'bg-blue-600/10' : hasUnread ? 'bg-slate-800/50 hover:bg-slate-800' : 'hover:bg-slate-800/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                        isActive ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                      }`}>
                        {thread.user_name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className={`text-sm truncate ${hasUnread ? 'font-bold text-white' : 'font-medium text-slate-200'}`}>
                            {thread.user_name || 'Unknown Student'}
                          </p>
                          <span className="text-[10px] text-slate-600 shrink-0">
                            {thread.last_message_at
                              ? new Date(thread.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : new Date(thread.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-1 mt-0.5">
                          <p className={`text-xs truncate ${hasUnread ? 'text-slate-300' : 'text-slate-500'}`}>
                            {thread.last_message_preview || (lesson ? `Lesson ${lesson.id}: ${lesson.title}` : 'Lesson query')}
                          </p>
                          {hasUnread && (
                            <span className="shrink-0 w-5 h-5 bg-blue-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                              {thread.unread_count}
                            </span>
                          )}
                        </div>
                        <div className="mt-1">
                          <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-full ${
                            thread.status === 'open'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-slate-700 text-slate-500'
                          }`}>
                            {thread.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* ── RIGHT: Chat Panel ─────────────────────────────── */}
        <div className="flex-1 bg-slate-900/50 border border-white/5 rounded-2xl flex flex-col overflow-hidden">
          {activeThread ? (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-white/5 bg-slate-900/80 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center font-bold text-white">
                    {activeThread.user_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <h3 className="text-white font-bold">{activeThread.user_name || 'Unknown Student'}</h3>
                    <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                      {lessons.find(l => l.id === activeThread.lesson_id)?.title || `Lesson ${activeThread.lesson_id}`}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {activeThread.status === 'open' && (
                    <button
                      onClick={handleMarkResolved}
                      className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                    >
                      <CheckCircleIcon className="w-3.5 h-3.5" /> Resolved
                    </button>
                  )}
                  {activeThread.status === 'resolved' && (
                    <span className="flex items-center gap-1.5 bg-slate-800 border border-white/5 text-slate-500 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest">
                      <XCircleIcon className="w-3.5 h-3.5" /> Closed
                    </span>
                  )}
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
                {messages.length === 0 && (
                  <p className="text-center text-slate-600 text-sm py-8">No messages yet.</p>
                )}
                {messages.map(msg => {
                  const isAdminMsg = msg.sender_role === 'admin';
                  return (
                    <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                      {!isAdminMsg && (
                        <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300 mr-2 mt-1 shrink-0">
                          {activeThread.user_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                        isAdminMsg
                          ? 'bg-blue-600 text-white rounded-br-sm shadow-lg shadow-blue-600/10'
                          : 'bg-slate-800 border border-white/5 text-slate-200 rounded-bl-sm'
                      }`}>
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        <div className={`flex items-center justify-end gap-1.5 mt-1.5`}>
                          <span className={`text-[9px] ${isAdminMsg ? 'text-blue-200' : 'text-slate-500'}`}>
                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isAdminMsg && (
                            <CheckCircleIcon className="w-2.5 h-2.5 text-blue-200" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-3 bg-slate-900/90 border-t border-white/5 shrink-0">
                <div className="flex gap-2 bg-slate-800 border border-white/10 rounded-xl p-2 focus-within:border-blue-500/40 transition-colors">
                  <textarea
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); } }}
                    placeholder="Type your reply… (Enter to send)"
                    className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-slate-200 p-2 min-h-[40px] max-h-[120px] placeholder:text-slate-600"
                    rows={2}
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                    className="self-end p-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-all"
                  >
                    {sending ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <SendIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
              <div className="w-20 h-20 bg-slate-800/50 border border-white/5 rounded-full flex items-center justify-center mb-6">
                <MessageSquareIcon className="w-8 h-8 text-slate-600" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
              <p className="text-slate-500 text-sm max-w-sm">Choose a student thread from the left panel to view the full message history and reply.</p>
              {totalUnread > 0 && (
                <p className="text-blue-400 text-sm font-bold mt-4">{totalUnread} unread message{totalUnread > 1 ? 's' : ''}</p>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminConsultUpgraded;
