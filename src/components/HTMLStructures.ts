export interface BlockTemplate {
  id: string;
  name: string;
  description: string;
  isTopLevel?: boolean; // true = always a new top-level block; false/undefined = goes inside last section
  html: string;
}

export const HTML_BLOCK_TEMPLATES: BlockTemplate[] = [
  {
    id: 'header',
    name: 'Header Banner',
    description: 'Centered title with subtitle',
    isTopLevel: true,
    html: `<header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl mb-4">
  <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">HEADING TITLE</h1>
  <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">SUBTITLE TEXT</p>
</header>`
  },
  {
    id: 'text-outer',
    name: 'Text (Outside)',
    description: 'Standalone paragraph — top-level, outside any section',
    html: `<p class="text-slate-300 leading-relaxed my-4">Enter your standalone paragraph text here. This block sits outside any section.</p>`
  },
  {
    id: 'section',
    name: 'Standard Section',
    description: 'Container with heading + paragraph',
    isTopLevel: true,
    html: `<section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5 mb-4">
  <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-6">Section Heading</h2>
  <p class="text-slate-300 leading-relaxed mb-6">Enter your main content here.</p>
</section>`
  },
  {
    id: 'section-2col',
    name: 'Section + 2 Columns',
    description: 'Section with two cards inside',
    isTopLevel: true,
    html: `<section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5 mb-4">
  <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-6">Section Heading</h2>
  <p class="text-slate-300 leading-relaxed mb-6">Enter your content here.</p>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div class="p-6 bg-slate-950/60 rounded-xl border border-emerald-500/20">
      <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest">CARD ONE</h3>
      <p class="text-slate-400 text-xs">Description for the first card goes here.</p>
    </div>
    <div class="p-6 bg-slate-950/60 rounded-xl border border-sky-500/20">
      <h3 class="text-sky-400 font-bold text-xs uppercase mb-3 tracking-widest">CARD TWO</h3>
      <p class="text-slate-400 text-xs">Description for the second card goes here.</p>
    </div>
  </div>
</section>`
  },
  {
    id: 'section-3col',
    name: 'Section + 3 Columns',
    description: 'Section with three cards inside',
    isTopLevel: true,
    html: `<section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5 mb-4">
  <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-6">Section Heading</h2>
  <p class="text-slate-300 leading-relaxed mb-6">Enter your content here.</p>
  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
    <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
      <h3 class="text-emerald-400 font-bold text-sm uppercase mb-3">Item 1</h3>
      <p class="text-slate-400 text-xs">Detail about item 1.</p>
    </div>
    <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
      <h3 class="text-sky-400 font-bold text-sm uppercase mb-3">Item 2</h3>
      <p class="text-slate-400 text-xs">Detail about item 2.</p>
    </div>
    <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
      <h3 class="text-amber-400 font-bold text-sm uppercase mb-3">Item 3</h3>
      <p class="text-slate-400 text-xs">Detail about item 3.</p>
    </div>
  </div>
</section>`
  },
  {
    id: 'icon-rows',
    name: 'Icon Row List',
    description: 'Stack of circle icon + text rows',
    html: `<div class="space-y-4 mb-4">
  <div class="flex items-center gap-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
    <div class="w-16 h-16 shrink-0 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-400 font-bold">1</div>
    <div>
      <h4 class="text-slate-100 font-bold mb-1">Row Concept 1</h4>
      <p class="text-slate-400 text-xs">Important details related to concept 1.</p>
    </div>
  </div>
  <div class="flex items-center gap-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
    <div class="w-16 h-16 shrink-0 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 font-bold">2</div>
    <div>
      <h4 class="text-slate-100 font-bold mb-1">Row Concept 2</h4>
      <p class="text-slate-400 text-xs">Important details related to concept 2.</p>
    </div>
  </div>
</div>`
  },
  {
    id: 'text-inner',
    name: 'Text (Inside)',
    description: 'Paragraph that goes inside the current section',
    html: `<p class="text-slate-300 leading-relaxed mt-4">Enter your paragraph text here. This will be added inside the current section.</p>`
  },
  {
    id: 'grid-2col',
    name: '2 Columns',
    description: 'Two side-by-side cards (adds inside section)',
    html: `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
  <div class="p-6 bg-slate-950/60 rounded-xl border border-emerald-500/20">
    <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest">CARD ONE</h3>
    <p class="text-slate-400 text-xs">Description for the first card goes here.</p>
  </div>
  <div class="p-6 bg-slate-950/60 rounded-xl border border-sky-500/20">
    <h3 class="text-sky-400 font-bold text-xs uppercase mb-3 tracking-widest">CARD TWO</h3>
    <p class="text-slate-400 text-xs">Description for the second card goes here.</p>
  </div>
</div>`
  },
  {
    id: 'grid-3col',
    name: '3 Columns',
    description: 'Three side-by-side cards (adds inside section)',
    html: `<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
  <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
    <h3 class="text-emerald-400 font-bold text-sm uppercase mb-3">Item 1</h3>
    <p class="text-slate-400 text-xs">Detail about item 1.</p>
  </div>
  <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
    <h3 class="text-sky-400 font-bold text-sm uppercase mb-3">Item 2</h3>
    <p class="text-slate-400 text-xs">Detail about item 2.</p>
  </div>
  <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
    <h3 class="text-amber-400 font-bold text-sm uppercase mb-3">Item 3</h3>
    <p class="text-slate-400 text-xs">Detail about item 3.</p>
  </div>
</div>`
  },
  {
    id: 'text-outer',
    name: 'Text (standalone)',
    description: 'Paragraph outside any section',
    isTopLevel: true,
    html: `<p class="text-slate-300 leading-relaxed my-4 px-2">Enter your standalone paragraph text here.</p>`
  },
  {
    id: 'text-inner',
    name: 'Text (inside section)',
    description: 'Paragraph that goes inside the last section',
    html: `<p class="text-slate-300 leading-relaxed mt-4">Enter your inner paragraph text here.</p>`
  },
  {
    id: 'custom-tool',
    name: 'Custom / Blank',
    description: 'Empty editable container',
    html: `<div class="p-6 bg-slate-900/60 rounded-2xl border border-dashed border-white/20 mb-4" style="min-height:80px">
  <p class="text-slate-300">Custom block. Edit or replace this content.</p>
</div>`
  }
];
