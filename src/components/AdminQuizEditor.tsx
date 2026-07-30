import React, { useState } from 'react';
import { QuizQuestion } from '../types';
import { PlusIcon, TrashIcon, CheckIcon, XIcon, SaveIcon } from 'lucide-react';

interface AdminQuizEditorProps {
  initialQuiz: QuizQuestion[];
  onSave: (quiz: QuizQuestion[]) => void;
  onCancel: () => void;
}

const AdminQuizEditor: React.FC<AdminQuizEditorProps> = ({ initialQuiz, onSave, onCancel }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([...initialQuiz]);

  const handleUpdateQuestion = (index: number, updated: Partial<QuizQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updated };
    setQuestions(newQuestions);
  };

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    setQuestions(newQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        type: 'multiple-choice',
        question: 'New Question?',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: 'Explanation for the answer.'
      }
    ]);
  };

  const handleOptionChange = (qIndex: number, optIndex: number, value: string) => {
    const newQuestions = [...questions];
    const options = [...(newQuestions[qIndex].options || [])];
    options[optIndex] = value;
    newQuestions[qIndex].options = options;
    setQuestions(newQuestions);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-y-auto pr-2 rounded-xl border border-gold-500/20 p-4">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <h3 className="text-xl font-serif text-gold-400">Quiz Editor (Admin)</h3>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-slate-700 flex items-center gap-2">
            <XIcon size={14} /> Cancel
          </button>
          <button onClick={() => onSave(questions)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-500 flex items-center gap-2 shadow-lg shadow-emerald-900/20">
            <SaveIcon size={14} /> Save Quiz
          </button>
        </div>
      </div>

      <div className="space-y-8 pb-10">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="bg-slate-800/50 p-5 rounded-2xl border border-white/5 relative group">
            <button 
              onClick={() => handleDeleteQuestion(qIndex)}
              className="absolute top-4 right-4 p-2 bg-rose-500/10 text-rose-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500/20"
              title="Delete Question"
            >
              <TrashIcon size={16} />
            </button>

            <div className="mb-4">
              <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-2">Question {qIndex + 1}</label>
              <textarea 
                value={q.question}
                onChange={e => handleUpdateQuestion(qIndex, { question: e.target.value })}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-white text-sm focus:border-gold-500/50 focus:outline-none min-h-[80px]"
              />
            </div>

            {q.type !== 'word-bank' && (
              <div className="space-y-3 mb-4">
                <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest">Options</label>
                {q.options?.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-3">
                    <button 
                      onClick={() => handleUpdateQuestion(qIndex, { correctAnswer: optIndex })}
                      className={`p-2 rounded-lg border ${q.correctAnswer === optIndex ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-white/10 text-slate-600 hover:border-white/30'}`}
                      title={q.correctAnswer === optIndex ? "Correct Answer" : "Mark as Correct"}
                    >
                      <CheckIcon size={14} />
                    </button>
                    <input 
                      type="text"
                      value={opt}
                      onChange={e => handleOptionChange(qIndex, optIndex, e.target.value)}
                      className={`flex-1 bg-slate-950 border rounded-xl p-2.5 text-sm focus:outline-none ${q.correctAnswer === optIndex ? 'border-emerald-500/30 text-emerald-100' : 'border-white/10 text-slate-300'}`}
                    />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[10px] uppercase font-mono text-slate-500 tracking-widest mb-2">Explanation (shown after answer)</label>
              <textarea 
                value={q.explanation || ''}
                onChange={e => handleUpdateQuestion(qIndex, { explanation: e.target.value })}
                className="w-full bg-slate-950 border border-emerald-500/20 rounded-xl p-3 text-emerald-100/70 text-sm focus:border-emerald-500/50 focus:outline-none min-h-[60px]"
              />
            </div>
          </div>
        ))}

        <button 
          onClick={handleAddQuestion}
          className="w-full py-4 border-2 border-dashed border-gold-500/30 rounded-2xl text-gold-500 hover:bg-gold-500/5 hover:border-gold-500/50 transition-colors flex flex-col items-center justify-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gold-500/10 flex items-center justify-center">
            <PlusIcon size={16} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Add Custom Question</span>
        </button>
      </div>
    </div>
  );
};

export default AdminQuizEditor;
