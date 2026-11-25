import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ConsultMessage, Lesson } from '../types';
import { normalizeLevel } from '../lib/lessonUtils';
import { SendIcon, LoaderIcon, RefreshIcon, MessageSquareIcon, BookOpenIcon, UserIcon } from './Icons';
import { useCMS } from '../context/CMSContext';

const HelpCircle = ({ size = 24, className, ...props }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} {...props}>
    <circle cx="12" cy="12" r="10"></circle>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
    <line x1="12" y1="17" x2="12.01" y2="17"></line>
  </svg>
);

const MobileAccordion = ({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden lg:hidden mb-3">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex items-center justify-between bg-white text-left active:bg-slate-50 transition-colors">
        <div className="flex items-center gap-3">
          <div className="text-[#3466F6]">{icon}</div>
          <span className="font-bold text-[13px] text-[#0F172A] tracking-wide">{title}</span>
        </div>
        <svg className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </button>
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="px-4 pb-4 pt-2 border-t border-slate-50">{children}</div>
      </div>
    </div>
  );
};

interface LiveConsultInterfaceProps {
  lesson: Lesson;
  candidateName: string;
  lessonNumber?: number;
}

export const LiveConsultInterface: React.FC<LiveConsultInterfaceProps> = ({ lesson, candidateName, lessonNumber }) => {
  const [messages, setMessages] = useState<ConsultMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [threadId, setThreadId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initThread = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('consult_threads')
        .select('*')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      if (data) {
        setThreadId(data.id);
        fetchMessages(data.id);
      } else {
        const { data: newThread } = await supabase
          .from('consult_threads')
          .insert([{ user_id: user.id, user_name: candidateName, lesson_id: lesson.id }])
          .select()
          .single();
        if (newThread) setThreadId(newThread.id);
      }
    };
    initThread();
  }, [lesson.id, candidateName]);

  const fetchMessages = async (tId: string) => {
    const { data } = await supabase
      .from('consult_messages')
      .select('*')
      .eq('thread_id', tId)
      .order('created_at', { ascending: true });
    if (data) setMessages(data);
  };

  useEffect(() => {
    if (threadId) {
      const channel = supabase.channel(`messages-user-${threadId}`)
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'consult_messages', filter: `thread_id=eq.${threadId}` },
          (payload) => {
            const newMsg = payload.new as ConsultMessage;
            setMessages(prev => {
              if (prev.find(m => m.id === newMsg.id)) return prev;
              return [...prev, newMsg];
            });
          }
        ).subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [threadId]);

  useEffect(() => {
    // Only scroll if we are inside a fixed container on desktop, or scroll the window on mobile
    if (window.innerWidth >= 768 && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    } else {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || !threadId) return;

    setIsTyping(true);
    const { data: newMsg, error } = await supabase.from('consult_messages').insert([{
      thread_id: threadId,
      sender_role: 'student',
      message: input,
    }]).select().single();

    if (!error && newMsg) {
      setInput('');
      setMessages(prev => {
        if (prev.find(m => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });
      await supabase.from('consult_threads').update({ status: 'open' }).eq('id', threadId);
    }
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 md:h-full font-sans text-slate-800">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col md:bg-white md:rounded-[32px] md:border border-slate-100 md:shadow-sm relative md:overflow-hidden">

        {/* Chat Header */}
        <div className="px-4 py-4 md:p-8 md:border-b border-slate-100 flex items-center justify-between shrink-0 md:bg-white z-10">
          <div className="flex items-center gap-3 md:gap-5">
            <div className="w-10 h-10 md:w-14 md:h-14 bg-[#EFF6FF] text-[#3466F6] rounded-[14px] md:rounded-[20px] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
              <MessageSquareIcon className="w-5 h-5 md:w-7 md:h-7" />
            </div>
            <div>
              <h2 className="text-lg md:text-2xl font-bold text-[#0F172A] md:mb-1">Consult Instructor</h2>
              <p className="text-[#64748B] text-sm hidden md:block">Ask questions, seek clarification, and deepen your understanding<br />with guidance from your instructor.</p>
              <p className="text-[#64748B] text-[12px] md:hidden">Guidance from instructor.</p>
            </div>
          </div>

          {threadId && (
            <button onClick={() => fetchMessages(threadId)} className="flex items-center justify-center gap-2 w-10 h-10 md:w-auto md:h-auto md:px-4 md:py-2 bg-slate-50 border border-slate-200 text-[#3466F6] rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-[#EFF6FF] transition-all shrink-0">
              <RefreshIcon className="w-4 h-4" /> <span className="hidden md:block">Sync</span>
            </button>
          )}
        </div>

        {/* Mobile Accordions (Shown only below lg) */}
        <div className="lg:hidden px-4 mb-2">
          <MobileAccordion title="Lesson Context" icon={<BookOpenIcon className="w-4 h-4" />}>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Lesson</div>
                <div className="font-semibold text-[#0F172A] leading-snug text-sm">{lesson.title}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Current Section</div>
                <div className="font-medium text-[#334155] text-xs">{lesson.topic || 'Introduction'}</div>
              </div>
              <div>
                <div className="inline-block bg-[#EFF6FF] text-[#3466F6] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md mt-1">
                  {normalizeLevel(lesson.difficulty)} Sphere
                </div>
              </div>
            </div>
          </MobileAccordion>
          <MobileAccordion title="How it Works" icon={<HelpCircle className="w-4 h-4" />}>
            <ul className="space-y-3 text-xs text-[#475569]">
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5"><HelpCircle className="w-3 h-3" /></div>
                <span className="mt-0.5">Ask lesson-related questions.</span>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5"><MessageSquareIcon className="w-3 h-3" /></div>
                <span className="mt-0.5">Get expert clarifications.</span>
              </li>
              <li className="flex gap-3 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5"><BookOpenIcon className="w-3 h-3" /></div>
                <span className="mt-0.5">Deepen your understanding.</span>
              </li>
            </ul>
          </MobileAccordion>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-visible md:overflow-y-auto px-4 md:px-8 py-2 md:py-8 space-y-4 md:space-y-6 scroll-smooth md:bg-[#F8FAFC]/50 pb-6 md:pb-8">
          {/* Today Separator */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className="bg-white border border-slate-200 px-4 py-1.5 rounded-full text-[10px] uppercase font-bold text-slate-400 tracking-widest shadow-sm">
              Today
            </div>
          </div>

          {messages.length === 0 && (
            <div className="text-center text-[#64748B] py-10 fade-in">
              <p className="text-sm">Initiate secure communication with the Master Logician.</p>
              <p className="text-[10px] font-mono uppercase tracking-widest mt-2 text-[#94A3B8]">{candidateName} • Lesson {lessonNumber ?? lesson.id}</p>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_role === 'student' ? 'justify-end' : 'justify-start'}`}>

              {msg.sender_role !== 'student' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white md:bg-slate-100 flex items-center justify-center shrink-0 mr-3 md:mr-4 border border-slate-200 text-slate-400 mt-1 md:mt-2 shadow-sm md:shadow-none">
                  <UserIcon className="w-4 h-4 md:w-5 md:h-5" />
                </div>
              )}

              <div className="flex flex-col max-w-[85%]">
                <div className={`flex items-center gap-2 md:gap-3 mb-1 ${msg.sender_role === 'student' ? 'flex-row-reverse' : ''}`}>
                  <span className="text-[10px] md:text-[11px] font-bold text-[#0F172A]">
                    {msg.sender_role === 'student' ? candidateName : 'Instructor'}
                  </span>
                  <span className="text-[9px] md:text-[10px] font-medium text-slate-400">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className={`px-4 py-3 md:p-5 leading-relaxed text-[14px] md:text-[15px] shadow-sm ${msg.sender_role === 'student'
                    ? 'bg-[#3466F6] text-white rounded-2xl rounded-tr-sm'
                    : 'bg-white text-[#334155] rounded-2xl rounded-tl-sm border border-slate-200'
                  }`}>
                  <div className="whitespace-pre-wrap">{msg.message}</div>
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white text-slate-400 p-3 md:p-4 rounded-2xl rounded-tl-sm border border-slate-200 shadow-sm flex items-center gap-1 mt-2 md:mt-4">
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          )}

          {messages.length > 3 && (
            <div className="flex justify-center mt-8 pb-2 fade-in">
              <button
                onClick={() => {
                  if (window.innerWidth >= 768 && scrollRef.current) {
                    scrollRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white md:bg-slate-50 border border-slate-200 text-slate-500 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest hover:bg-slate-100 hover:text-[#0F172A] transition-all shadow-sm active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                </svg>
                Navigate to Top
              </button>
            </div>
          )}
        </div>

        {/* Sticky Composer */}
        <div className="sticky bottom-0 left-0 right-0 z-20 p-4 md:p-6 bg-[#F8FAFC] md:bg-white border-t border-slate-200 md:border-slate-100 shrink-0">
          <div className="flex flex-row md:flex-col items-end md:items-stretch gap-2 md:gap-0 relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type your question..."
              className="flex-1 md:w-full bg-white border border-slate-200 text-[#0F172A] rounded-2xl px-4 py-3 md:px-6 md:py-5 md:pr-16 focus:border-[#3466F6] focus:outline-none text-[14px] md:text-[15px] transition-all focus:ring-4 focus:ring-blue-50 resize-none shadow-sm min-h-[48px] max-h-[120px]"
              rows={1}
            />
            <div className="md:absolute md:bottom-3 md:right-4 flex justify-end items-center shrink-0">
              <button
                onClick={handleSend}
                disabled={!input.trim() || isTyping || !threadId}
                className="bg-[#3466F6] hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-[#3466F6] text-white w-12 h-12 md:w-10 md:h-10 rounded-[16px] md:rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center shrink-0"
              >
                {isTyping ? <LoaderIcon className="w-5 h-5 animate-spin" /> : <SendIcon className="w-4 h-4 md:ml-1" />}
              </button>
            </div>
          </div>
          <div className="hidden md:flex text-center mt-4 items-center justify-center gap-2 text-slate-400 text-[11px]">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
            This conversation is linked to your current lesson for better context.
          </div>
        </div>
      </div>

      {/* Context Sidebar (Desktop Only) */}
      <div className="hidden lg:flex flex-col w-[320px] shrink-0 gap-4 overflow-y-auto pr-2 pb-2 no-scrollbar">

        {/* Lesson Context */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <BookOpenIcon className="w-4 h-4 text-slate-400" />
            <h3 className="font-bold text-[#0F172A] text-xs uppercase tracking-widest">Lesson Context</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Lesson</div>
              <div className="font-semibold text-[#0F172A] leading-snug text-sm">{lesson.title}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Current Section</div>
              <div className="font-medium text-[#334155] text-xs">{lesson.topic || 'Introduction'}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Sphere</div>
              <div className="inline-block bg-[#EFF6FF] text-[#3466F6] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md">
                {normalizeLevel(lesson.difficulty)} Sphere
              </div>
            </div>
          </div>
        </div>

        {/* How Consultation Works */}
        <div className="bg-white p-5 rounded-[20px] border border-slate-100 shadow-sm">
          <h3 className="font-bold text-[#0F172A] text-sm mb-3">How it Works</h3>
          <ul className="space-y-3 text-xs text-[#475569]">
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5">
                <HelpCircle className="w-3 h-3" />
              </div>
              <span>Ask lesson-related questions.</span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5">
                <MessageSquareIcon className="w-3 h-3" />
              </div>
              <span>Get expert clarifications.</span>
            </li>
            <li className="flex gap-3 items-start">
              <div className="w-5 h-5 rounded-full bg-blue-50 text-[#3466F6] flex items-center justify-center shrink-0 mt-0.5">
                <BookOpenIcon className="w-3 h-3" />
              </div>
              <span>Deepen your understanding.</span>
            </li>
          </ul>
        </div>

      </div>

    </div>
  );
};
