import React, { useState } from 'react';
import { Lesson } from '../types';
import { addLesson, deleteLesson, seedLessons } from '../lib/adminService';
import { PlusIcon, TrashIcon, XIcon, LoaderIcon, DatabaseIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminLessonManagerProps {
  lessons: Lesson[];
  onRefresh: () => void;
  onClose: () => void;
}

const AdminLessonManager: React.FC<AdminLessonManagerProps> = ({ lessons, onRefresh, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newLesson, setNewLesson] = useState<Partial<Lesson>>({
    title: '',
    topic: '',
    description: '',
    difficulty: 'Beginner',
    content: { summary: '', htmlContent: '' },
    quiz: []
  });

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const added = await addLesson(newLesson);
    if (added) {
      toast.success('Lesson added successfully!');
      setIsAdding(false);
      setNewLesson({
        title: '',
        topic: '',
        description: '',
        difficulty: 'Beginner',
        content: { summary: '', htmlContent: '' },
        quiz: []
      });
      onRefresh();
    } else {
      toast.error('Failed to add lesson.');
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this lesson? This cannot be undone.')) return;
    
    setLoading(true);
    const success = await deleteLesson(id);
    if (success) {
      toast.success('Lesson deleted.');
      onRefresh();
    } else {
      toast.error('Failed to delete lesson.');
    }
    setLoading(false);
  };

  const handleSeed = async () => {
    if (!confirm('This will copy the default 18 lessons to your database. Continue?')) return;
    setLoading(true);
    await seedLessons();
    onRefresh();
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden rounded-xl border border-gold-500/20 shadow-2xl">
      <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-950/50">
        <div>
          <h3 className="text-xl font-serif text-gold-400">Lesson Manager</h3>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mt-1">Manage database lessons</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleSeed}
            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2 transition-colors border border-white/5"
            title="Seed defaults"
          >
            <DatabaseIcon size={14} /> Seed
          </button>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-white transition-colors">
            <XIcon size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar">
        {isAdding ? (
          <form onSubmit={handleAdd} className="bg-slate-800/50 p-6 rounded-2xl border border-gold-500/30 space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-2">Create New Lesson</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Title</label>
                <input 
                  required
                  value={newLesson.title}
                  onChange={e => setNewLesson({...newLesson, title: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 focus:outline-none"
                  placeholder="e.g. Intro to Logic"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Topic</label>
                <input 
                  required
                  value={newLesson.topic}
                  onChange={e => setNewLesson({...newLesson, topic: e.target.value})}
                  className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 focus:outline-none"
                  placeholder="e.g. Foundations"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Description</label>
              <textarea 
                required
                value={newLesson.description}
                onChange={e => setNewLesson({...newLesson, description: e.target.value})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 focus:outline-none min-h-[80px]"
                placeholder="Brief summary..."
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-slate-500 uppercase font-mono tracking-widest">Difficulty</label>
              <select 
                value={newLesson.difficulty}
                onChange={e => setNewLesson({...newLesson, difficulty: e.target.value as any})}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 focus:outline-none"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Master">Master</option>
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsAdding(false)}
                className="flex-1 py-3 bg-slate-900 text-slate-400 rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gold-600 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest hover:bg-gold-500 transition-colors shadow-lg shadow-gold-600/20 disabled:opacity-50"
              >
                {loading ? <LoaderIcon className="w-4 h-4 animate-spin mx-auto" /> : 'Confirm Add'}
              </button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 border-2 border-dashed border-gold-500/20 rounded-2xl text-gold-500 hover:bg-gold-500/5 hover:border-gold-500/40 transition-all flex items-center justify-center gap-2 group"
          >
            <PlusIcon size={16} className="group-hover:scale-110 transition-transform" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Add New Lesson</span>
          </button>
        )}

        <div className="space-y-2">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="group flex items-center justify-between p-4 bg-slate-950/40 border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center text-[10px] font-mono text-slate-500">
                  {lesson.id}
                </div>
                <div>
                  <h5 className="text-white text-sm font-medium">{lesson.title}</h5>
                  <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">{lesson.topic} • {lesson.difficulty}</p>
                </div>
              </div>
              <button 
                onClick={() => handleDelete(lesson.id)}
                className="p-2 text-slate-600 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                title="Delete Lesson"
              >
                <TrashIcon size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminLessonManager;
