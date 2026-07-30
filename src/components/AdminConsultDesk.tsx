import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ConsultThread, ConsultMessage, Lesson } from '../types';
import { ArrowLeftIcon, MessageSquareIcon, SendIcon, CheckCircleIcon, UserIcon, LoaderIcon, RefreshIcon } from './Icons';
import { useCMS } from '../context/CMSContext';

export const AdminConsultDesk = ({ 
  lessons, 
  onBack 
}: { 
  lessons: Lesson[], 
  onBack: () => void 
}) => {
  const { isAdmin } = useCMS();
  const [threads, setThreads] = useState<ConsultThread[]>([]);
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [activeThread, setActiveThread] = useState<ConsultThread | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch all threads (Only runs if Admin because of RLS)
  const fetchThreads = async () => {
    try {
      const { data, error } = await supabase
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
      
      // Setup realtime subscription for new messages in this thread
      const channel = supabase.channel(`messages-${activeThread.id}`)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'consult_messages', filter: `thread_id=eq.${activeThread.id}` },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as ConsultMessage]);
            fetchThreads(); // Refresh thread order
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeThread]);

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
        fetchThreads();
      }
    }
  };

  const handleMarkResolved = async () => {
    if (!activeThread) return;
    await supabase.from('consult_threads').update({ status: 'resolved' }).eq('id', activeThread.id);
    setActiveThread(null);
    fetchThreads();
  };

  return (
    <div className="min-h-[85vh] max-w-6xl mx-auto flex flex-col md:flex-row gap-6 p-4 md:p-6 mt-20">
      {/* Sidebar: Thread List */}
      <div className="w-full md:w-1/3 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-6 flex flex-col shadow-2xl h-[80vh]">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
          <button onClick={onBack} className="p-2 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-colors">
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-xl font-serif text-white">Consult Desk</h2>
            <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{threads.length} Threads</p>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex justify-center items-center"><LoaderIcon className="w-8 h-8 text-gold-500 animate-spin" /></div>
        ) : (
          <div className="flex-1 overflow-y-auto pr-2 space-y-3 no-scrollbar">
             {threads.length === 0 && <p className="text-center text-slate-500 text-sm py-10">No questions yet.</p>}
             {threads.map(thread => {
               const lesson = lessons.find(l => l.id === thread.lesson_id);
               return (
                 <button 
                   key={thread.id}
                   onClick={() => setActiveThread(thread)}
                   className={`w-full text-left p-4 rounded-xl border transition-all ${
                     activeThread?.id === thread.id 
                       ? 'bg-gold-500/10 border-gold-500/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]' 
                       : 'bg-slate-950/40 border-white/5 hover:border-white/10'
                   }`}
                 >
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-xs font-bold text-white flex items-center gap-2">
                        <UserIcon className="w-3 h-3 text-slate-400" />
                        {thread.user_name}
                     </span>
                     {thread.status === 'open' ? (
                       <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span>
                     ) : (
                       <span className="text-[9px] text-slate-500 border border-slate-700 px-2 py-0.5 rounded uppercase tracking-widest">Resolved</span>
                     )}
                   </div>
                   <p className="text-[10px] text-gold-400 font-mono uppercase tracking-widest truncate">{lesson?.topic || `Lesson ${thread.lesson_id}`}</p>
                 </button>
               );
             })}
          </div>
        )}
      </div>

      {/* Main Panel: Chat Interface */}
      <div className="w-full md:w-2/3 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col shadow-2xl h-[80vh] overflow-hidden">
        {activeThread ? (
          <>
            <div className="p-6 border-b border-white/5 bg-slate-900/80 flex justify-between items-center shrink-0">
               <div className="flex items-center gap-4">
                 <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-gold-700 rounded-full flex items-center justify-center font-serif font-bold text-lg text-white shadow-lg shadow-gold-500/20">
                    {activeThread.user_name.charAt(0).toUpperCase()}
                 </div>
                 <div>
                   <h3 className="text-white font-medium">{activeThread.user_name}</h3>
                   <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Student Enquiry</p>
                 </div>
               </div>
               <div className="flex gap-2">
                 <button onClick={() => fetchMessages(activeThread.id)} className="bg-slate-800 border border-slate-700 text-slate-400 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-slate-700 hover:text-white transition-all">
                   <RefreshIcon className="w-3 h-3" /> Refresh
                 </button>
                 {activeThread.status === 'open' && (
                   <button onClick={handleMarkResolved} className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500/20 transition-all">
                     <CheckCircleIcon className="w-4 h-4" /> Mark Resolved
                   </button>
                 )}
               </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.map(msg => {
                const isAdminMsg = msg.sender_role === 'admin';
                return (
                  <div key={msg.id} className={`flex ${isAdminMsg ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl p-4 ${
                      isAdminMsg 
                        ? 'bg-gold-600 text-white rounded-br-sm shadow-xl shadow-gold-600/10' 
                        : 'bg-slate-800 border border-white/5 text-slate-200 rounded-bl-sm'
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                      <span className={`text-[9px] block mt-2 text-right ${isAdminMsg ? 'text-gold-200' : 'text-slate-500'}`}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-slate-900 border-t border-white/5 shrink-0">
              <div className="flex gap-2 bg-slate-950 border border-white/10 rounded-xl p-2 focus-within:border-gold-500/50 transition-colors">
                <textarea 
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendReply(); }}}
                  placeholder="Master Logician's response..."
                  className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm text-slate-300 p-2 min-h-[44px] max-h-[120px]"
                  rows={2}
                />
                <button 
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                  className="self-end p-3 bg-gold-600 text-white rounded-lg hover:bg-gold-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <div className="w-20 h-20 bg-slate-800/50 border border-white/5 rounded-full flex items-center justify-center mb-6">
              <MessageSquareIcon className="w-8 h-8 text-slate-600" />
            </div>
            <h3 className="text-xl font-serif text-white mb-2">Consultation Desk</h3>
            <p className="text-slate-500 text-sm max-w-sm">Select a student's thread from the left to view their questions and provide your logical guidance.</p>
          </div>
        )}
      </div>
    </div>
  );
};
