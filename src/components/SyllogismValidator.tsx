import React, { useState } from 'react';
import { CheckCircleIcon, XCircleIcon } from './Icons';

const SyllogismValidator: React.FC = () => {
  const [minorQuality, setMinorQuality] = useState<'affirmative' | 'negative'>('affirmative');
  const [majorQuantity, setMajorQuantity] = useState<'universal' | 'particular'>('universal');
  const [result, setResult] = useState<{ isValid: boolean; message: string } | null>(null);

  const validate = () => {
    if (minorQuality === 'affirmative' && majorQuantity === 'universal') {
      setResult({
        isValid: true,
        message: "Valid! The first figure conditions are met: Minor is affirmative and Major is universal."
      });
    } else {
      setResult({
        isValid: false,
        message: "Invalid! Rules broken. Remember: First Figure requires an Affirmative Minor and a Universal Major."
      });
    }
  };

  return (
    <div className="bg-slate-900/60 border border-gold-500/20 rounded-3xl p-8 shadow-2xl max-w-md mx-auto my-10 space-y-6">
      <h2 className="text-xl font-serif text-gold-400 text-center uppercase tracking-widest">First Figure Validator</h2>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Minor Premise Quality</label>
          <select 
            value={minorQuality} 
            onChange={(e) => setMinorQuality(e.target.value as any)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
          >
            <option value="affirmative">Affirmative (Mujaba)</option>
            <option value="negative">Negative (Saliba)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Major Premise Quantity</label>
          <select 
            value={majorQuantity} 
            onChange={(e) => setMajorQuantity(e.target.value as any)}
            className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-gold-500/50 outline-none transition-all"
          >
            <option value="universal">Universal (Kulliyya)</option>
            <option value="particular">Particular (Juz'iyya)</option>
          </select>
        </div>
      </div>

      <button 
        onClick={validate}
        className="w-full bg-gold-600 hover:bg-gold-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-gold-600/20 transition-all uppercase tracking-widest text-xs"
      >
        Validate Syllogism
      </button>

      {result && (
        <div className={`p-4 rounded-2xl border flex items-start gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${result.isValid ? 'bg-emerald-900/20 border-emerald-500/30 text-emerald-400' : 'bg-rose-900/20 border-rose-500/30 text-rose-400'}`}>
          {result.isValid ? <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" /> : <XCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />}
          <p className="text-xs leading-relaxed font-medium">
            <span className="font-bold uppercase mr-2">{result.isValid ? 'Success:' : 'Error:'}</span>
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
};

export default SyllogismValidator;
