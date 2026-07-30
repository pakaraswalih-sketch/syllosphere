import React from 'react';
import { BrainCircuitIcon } from './Icons';
import { useGlassHighlight } from '../hooks/useGlassHighlight';

interface FloatingHeaderProps {
  candidateName?: string;
  activeLevel?: string;
  onLogout?: () => void;
  onDashboard?: () => void;
  onAdminConsult?: () => void;
  onSettings?: () => void;
  isAdmin?: boolean;
  avatarUrl?: string | null;
}

const FloatingHeader: React.FC<FloatingHeaderProps> = ({ candidateName, activeLevel, onLogout, onDashboard, onAdminConsult, onSettings, isAdmin, avatarUrl }) => {
  const { containerRef, highlightRef, handleMouseMove, handleMouseEnter, handleMouseLeave } = useGlassHighlight();

  return (
    <div 
      ref={containerRef as React.RefObject<HTMLDivElement>}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="fixed top-[1cm] left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/60 backdrop-blur-md border border-white/10 rounded-[15px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] overflow-hidden group hover:bg-slate-900/70 transition-colors"
    >
      <div 
        ref={highlightRef}
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_120px_at_var(--x,0)_var(--y,0),_rgba(255,255,255,0.06),_transparent_100%)] opacity-0 transition-opacity duration-500"
      />
      {/* Brand */}
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gold-500/10 rounded-xl border border-gold-500/20 flex items-center justify-center">
          <BrainCircuitIcon className="w-6 h-6 text-gold-400" />
        </div>
        <div>
          <h1 className="text-xl font-serif text-white tracking-widest uppercase">SylloSphere</h1>
          <p className="text-[9px] text-gold-500 font-mono uppercase tracking-[0.3em]">Validation Protocol</p>
        </div>
      </div>

      {/* User Info / Context */}
      <div className="flex items-center gap-6">
        {activeLevel && (
          <div className="flex items-center gap-2">
             <div className="h-px w-6 bg-gold-500/30"></div>
             <span className="text-xs font-mono text-gold-400 uppercase tracking-widest">{activeLevel} Sphere</span>
             <div className="h-px w-6 bg-gold-500/30"></div>
          </div>
        )}

        {candidateName && (
          <div className="flex items-center gap-4 pl-6 border-l border-white/10">
            {isAdmin && onAdminConsult && (
              <button
                onClick={onAdminConsult}
                className="text-[9px] text-emerald-400 hover:text-emerald-300 font-mono uppercase tracking-widest transition-colors border border-emerald-500/20 px-3 py-1.5 rounded-lg hover:border-emerald-500/40 hover:bg-emerald-500/5 shadow-lg shadow-emerald-500/10"
              >
                Consult Desk
              </button>
            )}
            {onDashboard && (
              <button
                onClick={onDashboard}
                className="text-[9px] text-gold-400 hover:text-gold-300 font-mono uppercase tracking-widest transition-colors border border-gold-500/20 px-3 py-1.5 rounded-lg hover:border-gold-500/40 hover:bg-gold-500/5"
              >
                My Dashboard
              </button>
            )}
            {onSettings && !isAdmin && (
              <button
                onClick={onSettings}
                className="text-[9px] text-slate-400 hover:text-white font-mono uppercase tracking-widest transition-colors border border-white/10 px-3 py-1.5 rounded-lg hover:border-white/30 hover:bg-white/5"
              >
                Settings
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs text-white font-medium">{candidateName}</p>
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">Active Candidate</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 font-mono text-xs uppercase overflow-hidden">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  candidateName.charAt(0)
                )}
              </div>
            </div>
            {onLogout && (
              <button
                onClick={onLogout}
                className="text-[9px] text-slate-500 hover:text-rose-400 font-mono uppercase tracking-widest transition-colors border border-white/5 px-3 py-1.5 rounded-lg hover:border-rose-500/20"
              >
                Sign Out
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingHeader;
