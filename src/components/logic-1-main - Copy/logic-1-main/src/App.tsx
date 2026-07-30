import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { supabase } from './lib/supabaseClient';
import { createRoot } from 'react-dom/client';
import { LESSONS, DIFFICULTY_COLORS } from './constants';
import { Lesson, LessonContent, QuizQuestion, ChatMessage, Tab } from './types';
import * as GeminiService from './services/geminiService';
import { 
  BookOpenIcon, BrainCircuitIcon, ArrowLeftIcon, 
  CheckCircleIcon, XCircleIcon, SendIcon, 
  MessageSquareIcon, LoaderIcon, SearchIcon,
  GraduationCapIcon, LightbulbIcon, Volume2Icon, TurtleIcon,
  LockIcon, MedalIcon
} from './components/Icons';
import SyllogismValidator from './components/SyllogismValidator';

// --- Types ---
type AppView = 'landing' | 'enrollment' | 'levelSelection' | 'dashboard' | 'lesson';

interface Candidate {
  name: string;
  level: string;
}

// --- Landing Component (Home) ---
const Landing = ({ onEnter }: { onEnter: () => void }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617] p-6 text-center relative">
      <div className="relative z-10 fade-in flex flex-col items-center">
        <div className="mb-10 flex items-center justify-center relative group">
          <div className="absolute inset-0 bg-gold-500/20 blur-3xl rounded-full scale-150 opacity-50 group-hover:opacity-80 transition-opacity"></div>
          <BrainCircuitIcon className="w-24 h-24 md:w-32 md:h-32 text-gold-400 relative z-10 drop-shadow-[0_0_20px_rgba(244,147,11,0.4)]" />
        </div>
        <h1 className="text-6xl md:text-8xl font-serif text-white mb-4 tracking-tight">
            SYLLOSPHERE
        </h1>
        <p className="text-slate-500 font-mono tracking-[0.2em] uppercase mb-12 text-xs">
            Logic Verification System
        </p>
        <button 
            onClick={onEnter}
            className="px-10 py-4 border border-white/10 text-white font-medium rounded-xl transition-all hover:bg-white hover:text-slate-950 hover:scale-105 active:scale-95"
        >
            ENTER SYSTEM
        </button>
      </div>
    </div>
  );
};

// --- Enrollment Component ---
const Enrollment = ({ onConfirm, onBack }: { onConfirm: (name: string) => void, onBack: () => void }) => {
  const [name, setName] = useState('');
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) onConfirm(name);
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#020617] p-6">
        <div className="w-full max-w-md fade-in">
            <div className="bg-slate-900/40 p-8 rounded-3xl border border-white/5 shadow-2xl">
                <h2 className="text-2xl font-serif text-white mb-6 text-center">Identity Registration</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <input 
                            required
                            type="text" 
                            className="w-full bg-slate-950/50 border border-white/10 p-4 rounded-xl text-white focus:border-gold-500 outline-none transition-all placeholder:text-slate-700 text-center"
                            placeholder="Enter Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                    </div>
                    <button type="submit" className="w-full py-4 bg-gold-600 text-white font-bold rounded-xl hover:bg-gold-500 transition-all uppercase tracking-widest text-xs">
                        CONFIRM
                    </button>
                    <button 
                        type="button"
                        onClick={onBack}
                        className="w-full text-slate-600 hover:text-slate-400 text-[10px] uppercase tracking-widest transition-colors"
                    >
                        Cancel
                    </button>
                </form>
            </div>
        </div>
    </div>
  );
};

// --- Level Selection Component ---
const LevelSelection = ({ 
  unlockedLevels, 
  onSelectLevel, 
  onBack 
}: { 
  unlockedLevels: string[], 
  onSelectLevel: (level: string) => void,
  onBack: () => void
}) => {
  const [popupMessage, setPopupMessage] = useState<string | null>(null);
  const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];

  const handleLevelClick = (level: string) => {
    if (unlockedLevels.includes(level)) {
      onSelectLevel(level);
    } else {
      setPopupMessage("Complete the previous level to unlock this.");
      setTimeout(() => setPopupMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen p-8 max-w-4xl mx-auto flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-gold-500/10 blur-[120px] rounded-full animate-pulse-slow"></div>
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-gold-600/10 blur-[120px] rounded-full animate-pulse-slow delay-1000"></div>

      <header className="mb-20 text-center z-10 fade-in">
        <h1 className="text-5xl md:text-6xl font-serif text-white mb-6 tracking-tight drop-shadow-sm">Course Levels</h1>
        <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-gold-500 to-transparent mx-auto rounded-full"></div>
      </header>

      <div className="grid grid-cols-2 gap-12 md:gap-20 w-full max-w-3xl z-10 fade-in">
        {levels.map((level, index) => {
          const isUnlocked = unlockedLevels.includes(level);
          return (
            <button
              key={level}
              onClick={() => handleLevelClick(level)}
              className={`flex flex-col items-center group transition-all duration-500 ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative">
                {/* Outer Ring */}
                <div className={`absolute -inset-4 rounded-full transition-all duration-500 ${
                  isUnlocked 
                    ? 'bg-gold-500/0 group-hover:bg-gold-500/10 border-2 border-transparent group-hover:border-gold-500/20 scale-110' 
                    : 'bg-transparent'
                }`}></div>

                {/* Main Badge */}
                <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-10 ${
                  isUnlocked 
                    ? 'bg-gradient-to-br from-amber-300 via-gold-500 to-amber-600 scale-105 group-hover:scale-110 group-hover:-translate-y-2 shadow-gold-500/40' 
                    : 'bg-slate-800/50 border-4 border-slate-700/50 opacity-50 grayscale'
                }`}>
                  {/* Inner Shine */}
                  {isUnlocked && (
                    <div className="absolute inset-2 rounded-full border border-white/20 bg-gradient-to-tl from-transparent to-white/10"></div>
                  )}

                  {isUnlocked ? (
                    <MedalIcon size={72} className="text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.3)]" />
                  ) : (
                    <div className="relative">
                      <MedalIcon size={72} className="text-slate-600" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <LockIcon size={36} className="text-slate-400" />
                      </div>
                    </div>
                  )}

                  {/* Status Indicator */}
                  {isUnlocked && (
                    <div className="absolute -bottom-2 right-4 bg-emerald-500 text-white p-2 rounded-full shadow-xl border-4 border-[#020617] transform translate-y-1/4">
                      <CheckCircleIcon size={20} />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-10 flex flex-col items-center">
                <span className={`text-xl font-bold uppercase tracking-[0.2em] transition-all duration-300 ${
                  isUnlocked ? 'text-gold-400 group-hover:text-gold-200 group-hover:tracking-[0.3em]' : 'text-slate-600'
                }`}>
                  {level}
                </span>
                {isUnlocked ? (
                  <div className="h-0.5 w-0 group-hover:w-full bg-gold-500 mt-2 transition-all duration-500 rounded-full"></div>
                ) : (
                  <span className="text-[10px] text-slate-700 mt-2 font-mono uppercase tracking-widest">Locked</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {popupMessage && (
        <div className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-gold-500/30 text-gold-200 px-10 py-5 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-8 fade-in duration-500 z-50 flex items-center gap-4">
          <div className="w-10 h-10 bg-gold-500/20 rounded-full flex items-center justify-center">
            <LockIcon size={20} className="text-gold-500" />
          </div>
          <span className="text-sm font-bold uppercase tracking-widest">{popupMessage}</span>
        </div>
      )}

      <button 
        onClick={onBack}
        className="mt-24 text-slate-600 hover:text-gold-500 text-[10px] uppercase tracking-[0.4em] transition-all font-mono group flex items-center gap-3"
      >
        <div className="w-8 h-px bg-slate-800 group-hover:bg-gold-500/50 transition-all"></div>
        Return to Identity
        <div className="w-8 h-px bg-slate-800 group-hover:bg-gold-500/50 transition-all"></div>
      </button>
    </div>
  );
};

// --- Dashboard Component (Lesson Page) ---
const Dashboard = ({ 
  candidate, 
  activeLevel,
  onSelectLesson, 
  onBackToLevels,
  completedLessonIds
}: { 
  candidate: Candidate, 
  activeLevel: string,
  onSelectLesson: (id: number) => void, 
  onBackToLevels: () => void,
  completedLessonIds: number[]
}) => {
  const levelLessons = useMemo(() => {
    return LESSONS.filter(l => l.difficulty === activeLevel);
  }, [activeLevel]);

  return (
    <div className="min-h-screen p-8 max-w-5xl mx-auto relative">
      {/* Background Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-gold-500/5 blur-[100px] rounded-full -z-10"></div>

      <header className="mb-20 flex flex-col items-center fade-in relative">
        <div className="absolute top-0 left-0 md:left-4">
             <button onClick={onBackToLevels} className="p-3 bg-slate-900 border border-gold-500/20 rounded-2xl text-gold-400 hover:bg-gold-600 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 group shadow-xl">
                <ArrowLeftIcon className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Levels
             </button>
        </div>
        <div className="text-center">
          <h1 className="text-5xl font-serif text-white mb-3 tracking-tight uppercase drop-shadow-sm">{activeLevel} Sphere</h1>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-gold-500/50"></div>
            <p className="text-gold-500/60 text-[10px] font-mono uppercase tracking-[0.4em]">Verification Modules</p>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-gold-500/50"></div>
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center gap-16 mb-32">
        {/* Group lessons in rows of 3 */}
        {Array.from({ length: Math.ceil(levelLessons.length / 3) }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex flex-wrap justify-center gap-10 md:gap-24 w-full fade-in" style={{ animationDelay: `${rowIndex * 0.1}s` }}>
            {levelLessons.slice(rowIndex * 3, rowIndex * 3 + 3).map((lesson, idx) => {
              const isCompleted = completedLessonIds.includes(lesson.id);
              const globalIdx = rowIndex * 3 + idx;
              const isUnlocked = globalIdx === 0 || completedLessonIds.includes(levelLessons[globalIdx - 1].id);
              
              return (
                <button 
                  key={lesson.id} 
                  onClick={() => isUnlocked && onSelectLesson(lesson.id)}
                  className={`flex flex-col items-center w-36 md:w-48 group transition-all duration-500 ${!isUnlocked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="relative">
                    {/* Hover Glow */}
                    {isUnlocked && (
                      <div className="absolute -inset-4 bg-gold-500/0 group-hover:bg-gold-500/10 rounded-full blur-xl transition-all duration-500"></div>
                    )}

                    {/* Badge Container */}
                    <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 relative z-10 ${
                      isCompleted 
                        ? 'bg-gradient-to-br from-amber-300 via-gold-500 to-amber-600 border-4 border-white/20 group-hover:scale-110 group-hover:-translate-y-2 shadow-gold-500/30' 
                        : isUnlocked 
                          ? 'bg-slate-900 border-4 border-gold-500/40 group-hover:border-gold-500 group-hover:scale-110 group-hover:-translate-y-2 shadow-lg' 
                          : 'bg-slate-800/50 border-4 border-slate-700/50 opacity-40 grayscale'
                    }`}>
                      {/* Inner Shine for unlocked/completed */}
                      {isUnlocked && (
                        <div className="absolute inset-2 rounded-full border border-white/10 bg-gradient-to-tl from-transparent to-white/5"></div>
                      )}

                      {isCompleted ? (
                        <div className="relative">
                          <MedalIcon size={48} className="text-white drop-shadow-lg" />
                          <div className="absolute -top-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-[#020617]">
                            <CheckCircleIcon size={14} />
                          </div>
                        </div>
                      ) : isUnlocked ? (
                        <MedalIcon size={48} className="text-gold-400 group-hover:text-gold-200 transition-colors" />
                      ) : (
                        <LockIcon size={36} className="text-slate-600" />
                      )}
                    </div>
                  </div>

                  <div className="mt-8 text-center px-2">
                    <span className={`text-[11px] font-bold uppercase tracking-[0.2em] transition-all duration-300 block ${
                      isUnlocked ? 'text-slate-200 group-hover:text-gold-400' : 'text-slate-600'
                    }`}>
                      {lesson.title}
                    </span>
                    {isCompleted && (
                      <span className="text-[9px] text-emerald-500 font-mono uppercase tracking-widest mt-1 block">Verified</span>
                    )}
                    {!isUnlocked && (
                      <span className="text-[9px] text-slate-700 font-mono uppercase tracking-widest mt-1 block">Locked</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};



// --- Lesson View Component ---
const LessonView = ({ lesson, candidate, onBack, onComplete }: { lesson: Lesson; candidate: Candidate; onBack: () => void; onComplete: () => void }) => {
  const [activeTab, setActiveTab] = useState<Tab>('learn');
  const [content, setContent] = useState<LessonContent | null>(lesson.content || null);
  const [quiz, setQuiz] = useState<QuizQuestion[] | null>(lesson.quiz || null);
  const [chatService, setChatService] = useState<GeminiService.ChatService | null>(null);
  const [focusMode, setFocusMode] = useState(false);
  
  const [loadingStates, setLoadingStates] = useState({ 
    content: !lesson.content, 
    quiz: !lesson.quiz && activeTab === 'quiz',
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
  }, [lesson]);

  useEffect(() => { 
    if (!content && !loadingStates.content && !errors.content) fetchContent(); 
  }, [fetchContent, content, loadingStates.content, errors.content]);

  useEffect(() => {
    if (activeTab === 'quiz' && !quiz && !loadingStates.quiz && !errors.quiz) fetchQuiz();
    if (activeTab === 'tutor' && !chatService) setChatService(new GeminiService.ChatService());
  }, [activeTab, quiz, chatService, fetchQuiz, loadingStates.quiz, errors.quiz]);

  return (
    <div className={`min-h-screen flex flex-col max-w-5xl mx-auto md:p-6 p-4 transition-all duration-500 ${focusMode ? 'max-w-3xl' : ''}`}>
      {!focusMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 border-b border-white/5 pb-4 fade-in">
          <div className="flex items-center gap-4">
            <button onClick={onBack} className="p-2 bg-gold-600/10 border border-gold-500/20 rounded-xl text-gold-400 hover:bg-gold-600 hover:text-white transition-all shadow-[0_0_15px_rgba(234,179,8,0.1)]"><ArrowLeftIcon /></button>
            <div>
              <h2 className="text-2xl font-serif text-white">{lesson.title}</h2>
              <p className="text-xs text-gold-500/60 uppercase tracking-widest font-mono">Sphere: {lesson.topic}</p>
            </div>
          </div>
          <div className="flex gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5 backdrop-blur-md overflow-x-auto no-scrollbar">
            <TabButton active={activeTab === 'learn'} onClick={() => setActiveTab('learn')} icon={<BookOpenIcon className="w-4 h-4" />} label="Theory" />
            <TabButton active={activeTab === 'quiz'} onClick={() => setActiveTab('quiz')} icon={<GraduationCapIcon className="w-4 h-4" />} label="Validate" />
            <TabButton active={activeTab === 'tutor'} onClick={() => setActiveTab('tutor')} icon={<MessageSquareIcon className="w-4 h-4" />} label="Consult" />
          </div>
        </div>
      )}

      <div className={`flex-1 bg-slate-900/40 border border-white/5 rounded-3xl p-6 md:p-10 min-h-[500px] shadow-2xl relative overflow-hidden transition-all duration-500 ${focusMode ? 'bg-slate-950/80 border-gold-500/10' : ''}`}>
        {focusMode && (
          <button 
            onClick={() => setFocusMode(false)}
            className="absolute top-6 right-6 p-2 text-slate-600 hover:text-gold-400 transition-colors z-20"
            title="Exit Focus Mode"
          >
            <XCircleIcon className="w-6 h-6" />
          </button>
        )}
        
        {activeTab === 'learn' && (
          <div className="fade-in max-w-3xl mx-auto h-full">
            {!focusMode && (
              <div className="flex justify-end mb-4">
                <button 
                  onClick={() => setFocusMode(true)}
                  className="text-[10px] text-slate-500 hover:text-gold-400 font-mono uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                  <LightbulbIcon className="w-3 h-3" />
                  Enter Focus Mode
                </button>
              </div>
            )}
            {loadingStates.content ? <LoadingState message="Decoding verification protocols..." /> :
             errors.content ? <ErrorRetry onRetry={fetchContent} /> :
             content ? <>
                {!focusMode && (
                  <div className="mb-8 p-6 bg-gold-900/10 border border-gold-500/20 rounded-2xl text-gold-200/90 italic text-sm leading-relaxed">
                    <span className="text-gold-500 font-bold not-italic mr-2">LOGIC_SUMMARY:</span>{content.summary}
                  </div>
                )}
                <div className={`markdown-content text-slate-300 ${focusMode ? 'prose-lg' : ''}`} dangerouslySetInnerHTML={{ __html: content.htmlContent }} />
                {lesson.id === 18 && (
                  <div className="mt-12 pt-12 border-t border-white/5">
                    <SyllogismValidator />
                  </div>
                )}
             </> : <div className="flex items-center justify-center h-full"><button onClick={fetchContent} className="text-gold-400 uppercase font-bold text-xs tracking-widest">Re-Initialize Link</button></div>}
          </div>
        )}

        {activeTab === 'quiz' && (
          <div className="fade-in max-w-2xl mx-auto w-full h-full">
            {loadingStates.quiz ? <LoadingState message="Generating integrity checks..." /> :
             errors.quiz ? <ErrorRetry onRetry={fetchQuiz} /> :
             quiz ? <QuizInterface questions={quiz} onComplete={onComplete} /> : null}
          </div>
        )}

        {activeTab === 'tutor' && (
          <div className="fade-in h-full">
            {chatService && <TutorInterface chatService={chatService} candidateName={candidate.name} lessonContext={lesson.topic} />}
          </div>
        )}
      </div>
      
      {/* Reset Tool for stuck sessions */}
      <div className="mt-4 flex justify-end">
          <button 
            onClick={() => {
                setLoadingStates({ content: false, quiz: false });
                setErrors({ content: false, quiz: false });
                setContent(null);
                setQuiz(null);
                fetchContent();
            }}
            className="text-[10px] text-slate-600 hover:text-gold-500 font-mono uppercase tracking-widest transition-colors flex items-center gap-2"
          >
              <LoaderIcon className="w-3 h-3" />
              Recycle Logical Stream
          </button>
      </div>
    </div>
  );
};

// --- Sub Components ---
const TabButton = ({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-5 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 shrink-0 ${active ? 'bg-gold-600 text-white shadow-lg shadow-gold-600/30 scale-105' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}>
    {icon}<span className="hidden md:inline">{label}</span>
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

const QuizInterface = ({ questions, onComplete }: { questions: QuizQuestion[]; onComplete: () => void }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([]);

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
    const correct = idx === question.correctAnswer;
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
    setShowResult(false);
    if (currentIndex === questions.length - 1) {
      onComplete();
    }
    setCurrentIndex(prev => prev + 1);
  };

  if (currentIndex >= questions.length) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center fade-in py-10">
        <div className="w-24 h-24 bg-gold-500/10 rounded-full flex items-center justify-center mb-6 border border-gold-500/20"><GraduationCapIcon className="w-12 h-12 text-gold-400" /></div>
        <h3 className="text-3xl font-serif text-white mb-2">Evaluation Complete</h3>
        <p className="text-slate-500 font-mono text-xs uppercase tracking-widest mb-8">Verification Accuracy: {score} / {questions.length}</p>
        <button onClick={() => { setCurrentIndex(0); setScore(0); }} className="bg-gold-600 hover:bg-gold-500 text-white px-10 py-4 rounded-xl font-bold uppercase tracking-widest text-xs transition-all shadow-xl shadow-gold-600/20">Restart Protocol</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Progress Bar */}
      <div className="w-full h-2 bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div 
          className="h-full bg-gold-500 transition-all duration-500" 
          style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">
            {question.type === 'word-bank' ? 'Tap what you hear' : question.question}
          </h2>
        </div>

        {question.type === 'word-bank' ? (
          <div className="flex flex-col flex-1">
            {/* Character and Audio */}
            <div className="flex items-center gap-6 mb-12">
              <div className="w-24 h-24 bg-gold-500/20 rounded-full flex items-center justify-center relative">
                <BrainCircuitIcon className="w-12 h-12 text-gold-400" />
                <div className="absolute -right-2 top-0 bg-slate-900 border border-white/10 p-2 rounded-xl shadow-xl">
                   <div className="flex gap-2">
                      <button className="p-2 bg-gold-600 rounded-lg text-white hover:bg-gold-500 transition-colors">
                        <Volume2Icon size={20} />
                      </button>
                      <button className="p-2 bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <TurtleIcon size={20} />
                      </button>
                   </div>
                </div>
              </div>
              <div className="flex-1 p-4 bg-slate-800/50 rounded-2xl border border-white/5 relative">
                <div className="absolute left-0 top-1/2 -translate-x-full -translate-y-1/2 w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-r-[15px] border-r-slate-800/50"></div>
                <p className="text-slate-400 italic text-sm">"Listen carefully to the logical sequence..."</p>
              </div>
            </div>

            {/* Selection Area */}
            <div className="min-h-[100px] border-y border-white/10 py-6 mb-8 flex flex-wrap gap-2 items-center">
              {selectedWords.map((word, idx) => (
                <button 
                  key={`selected-${idx}`}
                  onClick={() => handleRemoveWord(word, idx)}
                  className="px-4 py-2 bg-slate-900 border border-gold-500/30 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-all animate-in fade-in zoom-in duration-200"
                >
                  {word}
                </button>
              ))}
              {selectedWords.length === 0 && (
                <div className="w-full text-center text-slate-600 font-mono text-[10px] uppercase tracking-widest">Select words below</div>
              )}
            </div>

            {/* Word Bank */}
            <div className="flex flex-wrap gap-3 justify-center mb-12">
              {availableWords.map((word, idx) => (
                <button 
                  key={`bank-${idx}`}
                  onClick={() => handleWordClick(word, idx)}
                  className="px-5 py-3 bg-slate-800 border border-white/10 text-white rounded-xl text-sm font-medium hover:bg-slate-700 active:scale-95 transition-all shadow-lg"
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4 flex-1">
            {question.options.map((opt, idx) => {
              let styles = "border-white/5 bg-white/5 hover:border-gold-500/40 hover:bg-gold-500/5";
              if (showResult) {
                if (idx === question.correctAnswer) styles = "border-emerald-500/40 bg-emerald-900/10 text-emerald-300";
                else if (idx === selectedOption) styles = "border-rose-500/40 bg-rose-900/10 text-rose-300";
                else styles = "border-white/5 opacity-30 grayscale";
              } else if (selectedOption === idx) styles = "border-gold-500 bg-gold-900/10 text-gold-200";
              return (
                <button key={idx} onClick={() => handleSelectOption(idx)} disabled={showResult} className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 group ${styles}`}>
                  <div className="flex items-center"><span className="w-8 h-8 rounded-lg bg-black/20 flex items-center justify-center font-mono text-[10px] mr-5 border border-white/5 group-hover:border-gold-500/30 transition-colors">{String.fromCharCode(65 + idx)}</span><span className="text-sm font-medium">{opt}</span></div>
                </button>
              );
            })}
          </div>
        )}

        {/* Action Area */}
        <div className="mt-auto pt-6">
          {!showResult ? (
            <button 
              onClick={question.type === 'word-bank' ? handleCheckWordBank : undefined}
              disabled={question.type === 'word-bank' ? selectedWords.length === 0 : selectedOption === null}
              className={`w-full py-5 rounded-2xl text-[10px] font-bold uppercase tracking-[0.3em] transition-all border ${
                (question.type === 'word-bank' ? selectedWords.length > 0 : selectedOption !== null)
                ? 'bg-gold-600 text-white border-gold-500 shadow-xl shadow-gold-600/20' 
                : 'bg-slate-800 text-slate-500 border-white/5 cursor-not-allowed'
              }`}
            >
              Check Protocol
            </button>
          ) : (
            <div className={`p-6 rounded-2xl border animate-in slide-in-from-bottom-4 duration-300 ${isCorrect ? 'border-emerald-500/20 bg-emerald-900/10' : 'border-rose-500/20 bg-rose-900/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {isCorrect ? <CheckCircleIcon className="text-emerald-500" /> : <XCircleIcon className="text-rose-500" />}
                  <div>
                    <h4 className={`font-bold text-lg ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isCorrect ? 'Excellent! Meaning:' : 'Incorrect. Target:'}
                    </h4>
                    {question.translation && (
                      <p className="text-white font-medium">{question.translation}</p>
                    )}
                  </div>
                </div>
              </div>
              <p className="text-slate-400 text-xs mb-6 leading-relaxed">{question.explanation}</p>
              <button 
                onClick={handleNext} 
                className={`w-full py-4 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                  isCorrect ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-rose-600 hover:bg-rose-500'
                } text-white`}
              >
                Continue
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const TutorInterface = ({ chatService, candidateName, lessonContext }: { chatService: GeminiService.ChatService, candidateName: string, lessonContext: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: 'init', role: 'model', text: `Candidate **${candidateName}**, connection established. Initializing inquiry parameters for **${lessonContext}**. What is your query?`, timestamp: Date.now() }]);
    }
  }, [lessonContext, candidateName, messages.length]);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', timestamp: Date.now() }]);
    await chatService.sendMessageStream(input, (text) => { setMessages(prev => prev.map(m => m.id === modelMsgId ? { ...m, text } : m)); });
    setIsTyping(false);
  };

  return (
    <div className="flex flex-col h-[600px] -m-6 md:-m-10">
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-3xl leading-relaxed text-sm shadow-xl ${msg.role === 'user' ? 'bg-gold-600 text-white rounded-tr-none' : 'bg-slate-950/60 text-slate-300 rounded-tl-none border border-white/5'}`}>
              <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2 font-bold">{msg.role === 'user' ? 'Candidate' : 'Syllosphere_AI'}</div>
              {msg.text ? <div className="markdown-content prose prose-invert prose-sm" dangerouslySetInnerHTML={{ __html: msg.text.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} /> :
                <div className="flex gap-1.5 h-6 items-center px-2"><div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"></div><div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce delay-150"></div><div className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce delay-300"></div></div>}
            </div>
          </div>
        ))}
      </div>
      <div className="p-8 bg-slate-950/80 backdrop-blur-md border-t border-white/5">
        <div className="flex gap-4 max-w-3xl mx-auto">
          <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Type inquiry for verification..." className="flex-1 bg-slate-900/80 border border-white/10 text-white rounded-2xl px-6 py-4 focus:border-gold-500/50 focus:outline-none text-sm transition-all focus:ring-1 focus:ring-gold-500/10" />
          <button onClick={handleSend} disabled={!input.trim() || isTyping} className="bg-gold-600 hover:bg-gold-500 disabled:opacity-30 text-white px-6 py-4 rounded-2xl shadow-lg shadow-gold-600/30 transition-all active:scale-95 flex items-center justify-center">
            {isTyping ? <LoaderIcon className="w-5 h-5" /> : <SendIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  const [view, setView] = useState<AppView>('landing');
  const [candidate, setCandidate] = useState<Candidate>({ name: '', level: 'Novice' });
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<number[]>([]);
  const [activeLevel, setActiveLevel] = useState<string>('Beginner');
  const [isSyncing, setIsSyncing] = useState(false);

  const unlockedLevels = useMemo(() => {
    const levels = ['Beginner', 'Intermediate', 'Advanced', 'Master'];
    const unlocked = ['Beginner'];
    
    for (let i = 0; i < levels.length - 1; i++) {
      const currentLevel = levels[i];
      const nextLevel = levels[i + 1];
      const levelLessons = LESSONS.filter(l => l.difficulty === currentLevel);
      const allCompleted = levelLessons.every(l => completedLessonIds.includes(l.id));
      
      if (allCompleted && levelLessons.length > 0) {
        unlocked.push(nextLevel);
      } else {
        break;
      }
    }
    return unlocked;
  }, [completedLessonIds]);

  // Supabase: ഉപയോക്താവ് ലോഗിൻ ചെയ്യുമ്പോൾ progress ലോഡ് ചെയ്യുക
  const loadProgressFromSupabase = async (name: string) => {
    setIsSyncing(true);
    try {
      const { data, error } = await supabase
        .from('user_progress')
        .select('completed_lessons')
        .eq('user_name', name)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase load error:', error);
      } else if (data && data.completed_lessons) {
        setCompletedLessonIds(data.completed_lessons);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Supabase: Lesson complete ആകുമ്പോൾ save ചെയ്യുക
  const saveProgressToSupabase = async (name: string, newCompletedIds: number[]) => {
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert(
          { user_name: name, completed_lessons: newCompletedIds, updated_at: new Date().toISOString() },
          { onConflict: 'user_name' }
        );

      if (error) {
        console.error('Supabase save error:', error);
      }
    } catch (err) {
      console.error('Failed to save progress:', err);
    }
  };

  const handleEnrollment = async (name: string) => { 
    setCandidate({ ...candidate, name }); 
    await loadProgressFromSupabase(name);
    setView('levelSelection'); 
  };

  const handleSelectLevel = (level: string) => {
    setActiveLevel(level);
    setView('dashboard');
  };

  const activeLesson = useMemo(() => LESSONS.find(l => l.id === activeLessonId), [activeLessonId]);

  const handleCompleteLesson = () => {
    if (activeLessonId && !completedLessonIds.includes(activeLessonId)) {
      const newIds = [...completedLessonIds, activeLessonId];
      setCompletedLessonIds(newIds);
      // Supabase-ൽ save ചെയ്യുക
      if (candidate.name) {
        saveProgressToSupabase(candidate.name, newIds);
      }
    }
  };

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-gold-500/30">
      {view === 'landing' && <Landing onEnter={() => setView('enrollment')} />}
      {view === 'enrollment' && <Enrollment onConfirm={handleEnrollment} onBack={() => setView('landing')} />}
      {view === 'levelSelection' && (
        <LevelSelection 
          unlockedLevels={unlockedLevels} 
          onSelectLevel={handleSelectLevel} 
          onBack={() => setView('enrollment')} 
        />
      )}
      {(view === 'dashboard' || view === 'lesson') && (
        activeLesson ? (
          <LessonView 
            lesson={activeLesson} 
            candidate={candidate} 
            onBack={() => setActiveLessonId(null)} 
            onComplete={handleCompleteLesson}
          />
        ) : (
          <Dashboard 
            candidate={candidate} 
            activeLevel={activeLevel}
            onSelectLesson={setActiveLessonId} 
            onBackToLevels={() => setView('levelSelection')} 
            completedLessonIds={completedLessonIds}
          />
        )
      )}
    </div>
  );
}

