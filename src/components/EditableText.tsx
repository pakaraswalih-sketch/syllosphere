import React, { useState, useRef, useEffect } from 'react';
import { useCMS } from '../context/CMSContext';

interface EditableTextProps {
  contentKey: string;
  fallback: string;
  as?: React.ElementType; 
  className?: string; 
  disableIcon?: boolean; // Used to hide icon for hero section, etc.
}

export function EditableText({ contentKey, fallback, as: Component = 'span', className = '', disableIcon = false }: EditableTextProps) {
  const { get, updateContent, isAdmin } = useCMS();
  const currentVal = get(contentKey, fallback);
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempVal, setTempVal] = useState(currentVal);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus when editing starts
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to end
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  if (!isAdmin) {
    return <>{currentVal}</>;
  }

  // If disableIcon is true, just render normal text without inline edit wrapper 
  // (Admins can still edit these directly from the bottom right gear Inspector)
  if (disableIcon) {
    return <>{currentVal}</>;
  }

  const handleSave = () => {
    if (tempVal !== currentVal) {
      updateContent(contentKey, tempVal);
    }
    setIsEditing(false);
  };

  return (
    <Component className={`relative group inline-block ${className}`}>
      {currentVal}
      
      {/* Edit Pencil Icon (Visible on Hover) — use span to avoid nested <button> error */}
      {!isEditing && (
        <span 
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setTempVal(currentVal);
            setIsEditing(true);
          }}
          onKeyDown={(e) => { if (e.key === 'Enter') { setTempVal(currentVal); setIsEditing(true); } }}
          className="absolute -top-3 -right-5 w-6 h-6 bg-sky-600 hover:bg-sky-500 text-white rounded-full sm:hidden group-hover:flex items-center justify-center shadow-lg z-[50] cursor-pointer select-none"
          title="Edit Text"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
        </span>
      )}

      {/* Editing Popup Overlay */}
      {isEditing && (
        <div 
           className="absolute top-full left-0 mt-2 w-64 md:w-80 bg-slate-900 border border-sky-500/50 shadow-2xl shadow-sky-900/20 rounded-xl p-3 z-[9999]"
           onClick={e => e.stopPropagation()} // Prevent closing/triggering parents
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] text-sky-400 font-mono tracking-widest uppercase">{contentKey}</span>
            <button onClick={() => setIsEditing(false)} className="text-slate-500 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          
          <textarea
            ref={inputRef}
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            className="w-full bg-slate-950 border border-white/10 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-sky-500 min-h-[60px] resize-y mb-2"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSave();
              }
            }}
          />
          
          <div className="flex gap-2">
            <button 
              onClick={handleSave}
              className="flex-1 bg-sky-600 hover:bg-sky-500 text-white text-[10px] font-bold uppercase tracking-widest py-2 rounded-lg transition-colors"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </Component>
  );
}
