import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useCMS } from '../context/CMSContext';
import { HTML_BLOCK_TEMPLATES } from './HTMLStructures';

interface EditableHTMLProps {
  contentKey: string;
  fallbackHTML: string;
  className?: string;
  lessonNumber?: number;
}

// Given raw HTML string, parse into an array of block objects with stable IDs
let _blockIdCounter = 0;
const newBlockId = () => `block-${++_blockIdCounter}`;

interface Block { id: string; html: string; }

function parseHtmlToBlocks(html: string): Block[] {
  const div = document.createElement('div');
  div.innerHTML = html.trim();
  const root = div.children.length === 1 ? div.firstElementChild! : div;
  const elems = Array.from(root.children);
  if (elems.length > 0) {
    return elems.map(c => ({ id: newBlockId(), html: c.outerHTML }));
  }
  return [{ id: newBlockId(), html }];
}

// ---- Admin Toolbar ----
const AdminToolbar = ({
  isEditing,
  lessonId,
  onOpen,
  onSave,
  onCancel,
}: {
  isEditing: boolean;
  lessonId: string;
  onOpen?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
}) => {
  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between mb-8 shadow-xl">
      <div className="flex flex-col mb-4 md:mb-0">
        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-[0.2em] mb-1">Admin Edit Mode</span>
        <h2 className="text-white text-lg font-bold">Editing Lesson {lessonId}</h2>
      </div>
      <div className="flex items-center gap-3 w-full md:w-auto">
        {!isEditing ? (
          <button
            onClick={onOpen}
            className="w-full md:w-auto bg-sky-600 hover:bg-sky-500 text-white text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-lg shadow-sky-900/50 flex items-center justify-center gap-2 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            Open Site Builder
          </button>
        ) : (
          <>
            <button
              onClick={onCancel}
              className="flex-1 md:flex-none bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl border border-slate-700 transition-all text-center"
            >
              Exit Editor
            </button>
            <button
              onClick={onSave}
              className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-500 text-white text-xs uppercase tracking-widest font-bold px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              Save Changes
            </button>
          </>
        )}
      </div>
    </div>
  );
};

// ---- Editor Tools Grid ----
const EditorToolsGrid = ({
  onAddBlock,
}: {
  onAddBlock: (h: string, templateId: string) => void;
}) => {
  const getIcon = (id: string) => {
    if (id.includes('header')) return <svg className="w-5 h-5 text-rose-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>;
    if (id.includes('section')) return <svg className="w-5 h-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/></svg>;
    if (id.includes('grid') || id.includes('col')) return <svg className="w-5 h-5 text-amber-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>;
    if (id.includes('icon')) return <svg className="w-5 h-5 text-sky-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>;
    if (id.includes('text')) return <svg className="w-5 h-5 text-emerald-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="21" y1="10" x2="3" y2="10"/><line x1="21" y1="6" x2="3" y2="6"/><line x1="21" y1="14" x2="3" y2="14"/><line x1="21" y1="18" x2="3" y2="18"/></svg>;
    return <svg className="w-5 h-5 text-slate-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/></svg>;
  };

  return (
    <div className="mb-8">
      {/* Block hover highlight styles */}
      <style>{`
        .edit-block { position: relative; transition: outline 0.15s; border-radius: 12px; }
        .edit-block:hover { outline: 2px dashed rgba(14,165,233,0.4); }
        .edit-block-controls { display: none; position: absolute; top: 6px; right: 6px; z-index: 50; flex-direction: column; gap: 3px; }
        .edit-block:hover .edit-block-controls { display: flex; }
      `}</style>
      <h3 className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-4 border-b border-slate-200 pb-2">Add Building Blocks</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
        {HTML_BLOCK_TEMPLATES.map((t) => (
          <button
            key={t.id}
            onClick={(e) => { e.preventDefault(); onAddBlock(t.html, t.id); }}
            className="flex items-center gap-3 p-4 bg-white border border-slate-200 rounded-xl hover:border-sky-300 hover:shadow-md hover:-translate-y-0.5 transition-all group text-left"
          >
            <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:bg-sky-50 transition-colors">
              {getIcon(t.id)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[#0F172A] font-bold text-xs uppercase tracking-wide truncate">{t.name}</div>
              <div className="text-slate-500 text-[10px] truncate">{t.description}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

// ---- Single editable block ----
const EditBlock = ({
  html,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onDelete,
  onChange,
}: {
  html: string;
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onChange: (html: string) => void;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [extraPadding, setExtraPadding] = useState(0); // px of extra bottom padding

  // Set initial content — only once on mount
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = html;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Vertical resize drag logic
  const startDrag = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startPad = extraPadding;

    const onMove = (me: MouseEvent) => {
      const delta = me.clientY - startY;
      setExtraPadding(Math.max(0, startPad + delta));
    };
    const onUp = () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      // Persist padding change into HTML via onBlur equivalent
      if (ref.current) onChange(ref.current.innerHTML);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [extraPadding, onChange]);

  const btnCls = "w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold transition-all";

  return (
    <div ref={wrapRef} className="edit-block" style={{ paddingBottom: extraPadding > 0 ? `${extraPadding}px` : undefined }}>
      {/* Per-block controls — shown on hover via CSS */}
      <div className="edit-block-controls">
        <button
          onMouseDown={(e) => { e.preventDefault(); onMoveUp(); }}
          disabled={index === 0}
          className={`${btnCls} bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed`}
          title="Move Block Up"
        >▲</button>
        <button
          onMouseDown={(e) => { e.preventDefault(); onMoveDown(); }}
          disabled={index === total - 1}
          className={`${btnCls} bg-indigo-600/90 hover:bg-indigo-500 disabled:opacity-25 disabled:cursor-not-allowed`}
          title="Move Block Down"
        >▼</button>
        <button
          onMouseDown={(e) => { e.preventDefault(); onDelete(); }}
          className={`${btnCls} bg-rose-600/90 hover:bg-rose-500`}
          title="Delete Block"
        >✕</button>
      </div>

      {/* Actual editable content area */}
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        onBlur={() => { if (ref.current) onChange(ref.current.innerHTML); }}
        className="outline-none min-h-[20px]"
      />

      {/* Vertical resize handle at bottom */}
      <div
        onMouseDown={startDrag}
        className="absolute bottom-0 left-0 right-0 h-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-ns-resize"
        title="Drag to resize height"
        style={{ userSelect: 'none' }}
      >
        <div className="w-12 h-1 bg-sky-500/60 rounded-full" />
      </div>
    </div>
  );
};


// ---- Main component ----
export function EditableHTML({ contentKey, fallbackHTML, className = '', lessonNumber }: EditableHTMLProps) {
  const { get, updateContent, isAdmin } = useCMS();
  const rawHtml = get(contentKey, fallbackHTML);

  const [isEditing, setIsEditing] = useState(false);
  const [blocks, setBlocks] = useState<Block[]>([]);

  // Enter edit mode — parse existing HTML into block array
  const handleEnterEdit = useCallback(() => {
    setBlocks(parseHtmlToBlocks(rawHtml));
    setIsEditing(true);
  }, [rawHtml]);

  // Save — serialise blocks back to HTML and persist
  const handleSave = useCallback(() => {
    const newHtml = blocks.map(b => b.html).join('\n');
    if (newHtml !== rawHtml) {
      updateContent(contentKey, newHtml);
    }
    setIsEditing(false);
  }, [blocks, rawHtml, contentKey, updateContent]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
    setBlocks([]);
  }, []);

  const moveBlock = useCallback((from: number, to: number) => {
    setBlocks(prev => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  }, []);

  const deleteBlock = useCallback((index: number) => {
    setBlocks(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateBlock = useCallback((index: number, html: string) => {
    setBlocks(prev => {
      const next = [...prev];
      next[index] = { ...next[index], html };
      return next;
    });
  }, []);

  // Section IDs that create a new top-level block
  const SECTION_IDS = new Set(['header', 'section', 'section-2col', 'section-3col']);
  const lessonIdStr = lessonNumber !== undefined ? String(lessonNumber) : (contentKey.split('.')[1] || 'Content');

  const addBlock = useCallback((html: string, templateId: string) => {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = html.trim();
    const blockEl = wrapper.firstElementChild ?? wrapper;
    const isNewSection = SECTION_IDS.has(templateId);

    if (!isNewSection) {
      // Append into the last section if one exists
      setBlocks(prev => {
        if (prev.length === 0) {
          return [...prev, { id: newBlockId(), html: blockEl.outerHTML }];
        }
        const lastBlock = prev[prev.length - 1];
        const lastWrapper = document.createElement('div');
        lastWrapper.innerHTML = lastBlock.html;
        const lastEl = lastWrapper.firstElementChild;

        if (lastEl && (lastEl.tagName === 'SECTION' || lastEl.tagName === 'DIV')) {
          lastEl.insertAdjacentHTML('beforeend', blockEl.outerHTML);
          const updatedHtml = lastEl.outerHTML;
          const next = [...prev];
          // Give a new ID so React remounts with fresh content
          next[next.length - 1] = { id: newBlockId(), html: updatedHtml };
          return next;
        }
        // No section found, add as new block
        return [...prev, { id: newBlockId(), html: blockEl.outerHTML }];
      });
    } else {
      // New section — always top-level
      setBlocks(prev => [...prev, { id: newBlockId(), html: blockEl.outerHTML }]);
    }
  }, []); // SECTION_IDS is stable

  // ---- Main Output ----
  return (
    <div className="w-full">
      {isAdmin && (
        <AdminToolbar 
          isEditing={isEditing} 
          lessonId={lessonIdStr} 
          onOpen={handleEnterEdit}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
      
      {!isEditing ? (
        <div className={`relative group ${className}`}>
          <div dangerouslySetInnerHTML={{ __html: rawHtml }} />
        </div>
      ) : (
        <div className={`relative ${className}`}>
          <EditorToolsGrid onAddBlock={addBlock} />
          <div className="space-y-4">
            {blocks.map((block, i) => (
              <EditBlock
                key={block.id}
                html={block.html}
                index={i}
                total={blocks.length}
                onMoveUp={() => moveBlock(i, i - 1)}
                onMoveDown={() => moveBlock(i, i + 1)}
                onDelete={() => deleteBlock(i)}
                onChange={(newHtml) => updateBlock(i, newHtml)}
              />
            ))}
            {blocks.length === 0 && (
              <div className="p-12 border-2 border-dashed border-slate-300 rounded-2xl text-center text-slate-500 font-medium">
                Use the tools above to add your first building block.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
