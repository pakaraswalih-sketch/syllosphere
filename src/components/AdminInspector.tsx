import React, { useState } from 'react';
import { useCMS } from '../context/CMSContext';
import { Lesson } from '../types';
import AdminLessonManager from './AdminLessonManager';
import { BookOpenIcon, SettingsIcon, XIcon } from 'lucide-react';

export function AdminInspector({ lessons, onRefreshLessons }: { lessons: Lesson[], onRefreshLessons: () => void }) {
  const { data, updateContent, isAdmin } = useCMS();
  const [isOpen, setIsOpen] = useState(false);
  const [showLessonManager, setShowLessonManager] = useState(false);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  if (!isAdmin) return null;

  return (
    <>
      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-sky-600 hover:bg-sky-500 text-white rounded-full flex items-center justify-center shadow-2xl shadow-sky-500/30 z-[9999] transition-transform hover:scale-110 active:scale-95 border-2 border-white/10"
        title="Admin Settings"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
      </button>

      {/* Inspector Panel */}
      {isOpen && (
        <div className="fixed top-0 right-0 w-80 sm:w-96 h-screen bg-slate-950/95 backdrop-blur-xl border-l border-white/10 shadow-2xl z-[9998] flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-sky-900/10">
            <div>
              <h3 className="text-white font-bold tracking-widest text-sm mb-1 uppercase">Admin CMS Inspector</h3>
              <p className="text-slate-400 text-[10px] uppercase tracking-widest">Edit raw placeholder strings</p>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <XIcon size={20} />
            </button>
          </div>

          <div className="p-4 border-b border-white/5 flex flex-col gap-2">
            <button 
              onClick={() => setShowLessonManager(true)}
              className="w-full bg-gold-600 hover:bg-gold-500 text-white text-[10px] font-bold uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-gold-900/20 flex items-center justify-center gap-2 transition-all"
            >
              <BookOpenIcon size={14} /> Manage Lessons
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
            {Object.entries(data).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => {
              // We mostly care about inputs/placeholders and non-text elements, but let's just list all to be safe.
              const isEditing = editValues[key] !== undefined;
              const displayVal = isEditing ? editValues[key] : value;

              return (
                <div key={key} className="bg-slate-900/60 p-4 rounded-xl border border-white/5">
                  <label className="text-[10px] text-sky-400 font-mono mb-2 block">{key}</label>
                  <input 
                    type="text" 
                    value={displayVal}
                    onChange={(e) => setEditValues(prev => ({ ...prev, [key]: e.target.value }))}
                    onBlur={() => {
                        // Save on blur if changed
                        if (editValues[key] && editValues[key] !== value) {
                            updateContent(key, editValues[key]);
                        }
                    }}
                    className="w-full bg-slate-950 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-sky-500/50 transition-colors"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
      {/* Lesson Manager Modal Overlay */}
      {showLessonManager && (
        <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl h-[80vh]">
            <AdminLessonManager 
              lessons={lessons} 
              onRefresh={onRefreshLessons} 
              onClose={() => setShowLessonManager(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
}
