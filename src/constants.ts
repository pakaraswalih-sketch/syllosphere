import { Lesson } from './types';

export const DIFFICULTY_COLORS: Record<string, string> = {
    'Beginner': 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400',
    'Intermediate': 'border-sky-500/20 bg-sky-500/5 text-sky-400',
    'Advanced': 'border-amber-500/20 bg-amber-500/5 text-amber-400',
    'Master': 'border-rose-500/20 bg-rose-500/5 text-rose-400',
};

export const LESSONS: Lesson[] = [
    // --- BEGINNER LEVEL ---
    {
        id: 1,
        title: "The Epistemology of Logic",
        topic: "Foundation of Al-Ilm",
        description: "An essential dive into the foundations of Knowledge (Al-Ilm), distinguishing between Conception, Assent, and their modes of acquisition.",
        difficulty: 'Beginner',
        content: {
            summary: "Knowledge (Al-Ilm) is the mental form obtained by the mind. It splits into Conception (Tasawwur) and Assent (Tasdiq), both of which can be either Intuitive (Badihi) or Theoretic (Nazhari).",
            htmlContent: `
                <div class="space-y-8">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2">The way of Knowledge</h1>
                        <p class="text-slate-500 font-mono text-xs uppercase tracking-widest">Core Text: Tasrih al-Mantiq | Part I</p>
                    </header>

                    <section class="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                        <h2 class="text-xl font-serif text-gold-300 border-b border-white/10 pb-2 mb-4">1. Defining Knowledge (Al-Ilm)</h2>
                        <p class="text-slate-300 mb-4 leading-relaxed">Knowledge begins the moment a mental image or form is established in the mind. This internal representation is the foundation of all logic, splitting into two primary paths:</p>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div class="p-4 bg-slate-950/50 rounded-xl border border-gold-500/10">
                                <h3 class="text-gold-400 font-bold text-xs uppercase mb-2">Conception (Al-Tasawwur)</h3>
                                <p class="text-slate-400 text-xs">The simple act of grasping an idea without forming a judgment. Ex: "Tree", "Redness".</p>
                            </div>
                            <div class="p-4 bg-slate-950/50 rounded-xl border border-gold-500/10">
                                <h3 class="text-gold-400 font-bold text-xs uppercase mb-2">Assent (Al-Tasdiq)</h3>
                                <p class="text-slate-400 text-xs">Occurs only when the mind makes a judgment regarding a descriptive relationship. Ex: "The tree is tall."</p>
                            </div>
                        </div>

                        <div class="p-6 bg-gold-500/5 border border-gold-500/20 rounded-2xl">
                            <h3 class="text-gold-300 font-bold text-sm mb-3">Requirements for Assent</h3>
                            <p class="text-slate-400 text-xs mb-3">To reach a state of Assent, the mind must first conceive of three elements:</p>
                            <ul class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <li class="bg-slate-900/60 p-3 rounded-lg border border-white/5 text-[10px]"><span class="text-gold-400 block font-bold mb-1">1. SUBJECT</span> (Al-Mahkum 'Alayh)</li>
                                <li class="bg-slate-900/60 p-3 rounded-lg border border-white/5 text-[10px]"><span class="text-gold-400 block font-bold mb-1">2. PREDICATE</span> (Al-Mahkum Bihi)</li>
                                <li class="bg-slate-900/60 p-3 rounded-lg border border-white/5 text-[10px]"><span class="text-gold-400 block font-bold mb-1">3. RELATIONSHIP</span> (Al-Nisbah)</li>
                            </ul>
                        </div>
                    </section>

                    <section class="bg-slate-900/40 p-6 rounded-2xl border border-white/5">
                        <h2 class="text-xl font-serif text-gold-300 border-b border-white/10 pb-2 mb-4">2. Modes of Acquisition</h2>
                        <p class="text-slate-300 mb-6 text-sm">Logic distinguishes knowledge by the effort required to gain it. Every thought or judgment falls into one of two categories:</p>

                        <div class="space-y-6">
                            <div>
                                <h3 class="text-emerald-400 font-bold text-sm mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-emerald-500"></div>
                                    A. Intuitive (Badīhī)
                                </h3>
                                <p class="text-slate-400 text-xs mb-4">Immediate knowledge requiring no deep reflection or proof.</p>
                                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <li class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <div class="text-gold-400 font-bold text-[10px] uppercase mb-1">Intuitive Conception</div>
                                        <div class="text-slate-300 text-xs italic">Example: Heat, cold, or basic sensations.</div>
                                    </li>
                                    <li class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <div class="text-gold-400 font-bold text-[10px] uppercase mb-1">Intuitive Assent</div>
                                        <div class="text-slate-300 text-xs italic">Example: "The whole is greater than the part."</div>
                                    </li>
                                </ul>
                            </div>

                            <div>
                                <h3 class="text-sky-400 font-bold text-sm mb-3 uppercase tracking-widest flex items-center gap-2">
                                    <div class="w-2 h-2 rounded-full bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                                    B. Theoretic (Nazharī)
                                </h3>
                                <p class="text-slate-400 text-xs mb-4">Knowledge acquired through evidence, study, and logical deduction.</p>
                                <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <li class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <div class="text-gold-400 font-bold text-[10px] uppercase mb-1">Theoretic Conception</div>
                                        <div class="text-slate-300 text-xs italic">Example: The definition of 'Angel' or 'Electron'.</div>
                                    </li>
                                    <li class="bg-slate-950/50 p-4 rounded-xl border border-white/5">
                                        <div class="text-gold-400 font-bold text-[10px] uppercase mb-1">Theoretic Assent</div>
                                        <div class="text-slate-300 text-xs italic">Example: "The Earth revolves around the Sun."</div>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "Understanding the 'Molecular structure of water' is an example of:",
                options: ["Intuitive Conception (Badīhī)", "Theoretic Conception (Nazharī)", "Intuitive Assent", "Theoretic Assent"],
                correctAnswer: 1,
                explanation: "Scientific details like molecular structures are Theoretic (Nazharī) because they require study and evidence to be conceived."
            },
            {
                question: "Knowledge acquired through study and evidence is called:",
                options: ["Intuitive (Badihi)", "Theoretic (Nazhari)", "Rational ('Aqli)", "Conventional (Wad'i)"],
                correctAnswer: 1,
                explanation: "Theoretic (Nazhari) knowledge is that which requires reflection and proof to be established in the mind."
            }
        ]
    },
    {
        id: 2,
        title: "The Anatomy of Expressions (Al-Lafz)",
        topic: "Mufrad & Murakkab Split",
        description: "Master the fundamental division of expressions. Learn the definitions of Mufrad and Murakkab, and the hierarchy of compounds.",
        difficulty: 'Beginner',
        content: {
            summary: "Al-Lafz (Expression) is categorized by how its parts correspond to its meaning. It divides into Mufrad (Single) and Murakkab (Compound).",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Lafz</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Linguistic Division</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. The Fundamental Split</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div class="p-6 bg-slate-950/60 rounded-xl border border-emerald-500/20">
                                <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest">Al-Mufrad (Single)</h3>
                                <p class="text-slate-400 text-xs">A word whose part does not signify a part of its meaning. <br/><span class="text-slate-500 italic">Ex: "Zaid" (The 'Z' has no meaning here).</span></p>
                            </div>
                            <div class="p-6 bg-slate-950/60 rounded-xl border border-sky-500/20">
                                <h3 class="text-sky-400 font-bold text-xs uppercase mb-3 tracking-widest">Al-Murakkab (Compound)</h3>
                                <p class="text-slate-400 text-xs">A phrase whose parts signify parts of its meaning. <br/><span class="text-slate-500 italic">Ex: "The sun is bright".</span></p>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">2. Compounds: Tāmm & Nāqis</h2>
                        <div class="space-y-6">
                            <div class="flex items-center gap-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <div class="w-16 h-16 bg-gold-500/10 rounded-full flex items-center justify-center text-gold-400 font-bold">T</div>
                                <div>
                                    <h4 class="text-slate-100 font-bold">Al-Tāmm (Complete)</h4>
                                    <p class="text-slate-400 text-xs">Provides a finished thought. Listener is not left waiting.</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-6 p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <div class="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center text-rose-400 font-bold">N</div>
                                <div>
                                    <h4 class="text-slate-100 font-bold">Al-Nāqis (Incomplete)</h4>
                                    <p class="text-slate-400 text-xs">An incomplete phrase (e.g., "The blue car...").</p>
                                </div>
                            </div>
                        </div>

                        <div class="mt-8 p-6 bg-slate-950/40 rounded-2xl border border-white/10">
                            <h3 class="text-gold-400 font-bold text-xs uppercase mb-4 tracking-[0.2em]">The Informative Split (of Tāmm)</h3>
                            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div class="p-4 bg-slate-900/60 rounded-xl border-l-4 border-emerald-500">
                                    <h5 class="text-emerald-400 font-bold text-xs mb-1">Khabar (Report)</h5>
                                    <p class="text-slate-500 text-[10px]">Can be described as TRUE or FALSE.</p>
                                </div>
                                <div class="p-4 bg-slate-900/60 rounded-xl border-l-4 border-amber-500">
                                    <h5 class="text-amber-400 font-bold text-xs mb-1">Inshā' (Creative)</h5>
                                    <p class="text-slate-500 text-[10px]">Commands, requests, or questions.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">3. Classification of Al-Mufrad</h2>
                        <p class="text-slate-400 text-sm mb-8">Single words are classified based on their meaning independence and time link into Nouns, Verbs, and Particles.</p>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
                                <h3 class="text-emerald-400 font-bold text-sm uppercase mb-3">Ism (Noun)</h3>
                                <p class="text-slate-400 text-xs mb-4">Independent meaning. <br/>NO link to time.</p>
                                <span class="text-slate-600 font-mono text-[10px]">Ex: Tree, Knowledge</span>
                            </div>
                            <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
                                <h3 class="text-sky-400 font-bold text-sm uppercase mb-3">Kalima (Verb)</h3>
                                <p class="text-slate-400 text-xs mb-4">Independent meaning. <br/>LINKED to time.</p>
                                <span class="text-slate-600 font-mono text-[10px]">Ex: Wrote, Knows</span>
                            </div>
                            <div class="bg-slate-950/40 p-6 rounded-3xl border border-white/5 text-center">
                                <h3 class="text-amber-400 font-bold text-sm uppercase mb-3">Adāt (Particle)</h3>
                                <p class="text-slate-400 text-xs mb-4">Meaning only when <br/>joined to others.</p>
                                <span class="text-slate-600 font-mono text-[10px]">Ex: From, In, On</span>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "What is the status of 'The door is open'?",
                options: ["Mufrad", "Murakkab Nāqis", "Murakkab Tāmm Khabar", "Murakkab Tāmm Inshā'"],
                correctAnswer: 2,
                explanation: "It is a complete statement (Tāmm) that reports a state of affairs (Khabar)."
            },
            {
                question: "Which category does 'Running' (as a verb) belong to?",
                options: ["Ism", "Kalima", "Adāt", "Murakkab"],
                correctAnswer: 1,
                explanation: "Verbs are called Kalima because they signify an action linked to time."
            }
        ]
    },
    {
        id: 3,
        title: "The Science of Signification",
        topic: "Al-Dālala",
        description: "Master the modes of Signification (Rational, Natural, Conventional) and Verbal framework.",
        difficulty: 'Beginner',
        content: {
            summary: "Signification (Dālala) is the link between Signifier and Signified, categorized into Rational, Natural, and Conventional modes.",
            htmlContent: `
                <div class="space-y-12">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Dālala</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Signification Matrix</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. The Matrix</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-1 bg-slate-800/20 p-1 rounded-2xl">
                            <div class="p-6 bg-slate-950/40 rounded-xl">
                                <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest border-b border-emerald-500/20 pb-2">Rationality ( 'Aqliyya )</h3>
                                <p class="text-slate-400 text-[11px]">Smoke pointing to fire.</p>
                            </div>
                            <div class="p-6 bg-slate-950/40 rounded-xl">
                                <h3 class="text-sky-400 font-bold text-xs uppercase mb-3 tracking-widest border-b border-sky-500/20 pb-2">Natural (Tabī'iyya)</h3>
                                <p class="text-slate-400 text-[11px]">Groan pointing to pain.</p>
                            </div>
                            <div class="p-6 bg-slate-950/40 rounded-xl">
                                <h3 class="text-amber-400 font-bold text-xs uppercase mb-3 tracking-widest border-b border-amber-500/20 pb-2">Conventional (Wad'iyya)</h3>
                                <p class="text-slate-400 text-[11px]">Red light pointing to stop.</p>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">2. Verbal Signification</h2>
                        <div class="overflow-hidden rounded-2xl border border-white/10 bg-slate-950/60">
                            <table class="w-full text-left text-xs">
                                <thead class="bg-slate-800 text-gold-400 uppercase tracking-widest font-bold text-[9px]">
                                    <tr>
                                        <th class="p-4">Type</th>
                                        <th class="p-4">Meaning Scope</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-white/5">
                                    <tr><td class="p-4 font-bold text-emerald-400">Mutābiqiyya (Matching)</td><td class="p-4">Points to the WHOLE meaning.</td></tr>
                                    <tr><td class="p-4 font-bold text-sky-400">Tadammuniyya (Inclusion)</td><td class="p-4">Points to PART of the meaning.</td></tr>
                                    <tr><td class="p-4 font-bold text-amber-400">Iltizāmiyya (Implication)</td><td class="p-4">Points to EXTERNAL linked quality.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "Using 'Human' to refer to 'capacity for speech' is which mode?",
                options: ["Matching", "Inclusion", "Implication", "Rational"],
                correctAnswer: 1,
                explanation: "Inclusion (Tadammuniyya) refers to a part of the definition."
            }
        ]
    },
    {
        id: 4,
        title: "The Logic of Categories",
        topic: "Universal & Particular",
        description: "Distinguish between Al-Kullie (Universal) and Al-Juzee (Particular) concepts, and explore Graded Universals.",
        difficulty: 'Beginner',
        content: {
            summary: "Concepts are divided into Particulars (Juzee) applying to one individual and Universals (Kullie) applying to many.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2">Universality</h1>
                        <p class="text-slate-500 font-mono text-xs uppercase tracking-widest">Mapping Concepts</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-6">1. Kullie vs. Juzee</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div class="p-5 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl">
                                <h3 class="text-emerald-400 font-bold uppercase text-xs tracking-widest mb-2">Particular (Al-Juzee)</h3>
                                <p class="text-slate-300 text-sm">Applies to exactly ONE individual. <br/><span class="text-emerald-500/60 italic">Ex: Zaid.</span></p>
                            </div>
                            <div class="p-5 bg-blue-500/10 border border-blue-500/30 rounded-2xl">
                                <h3 class="text-blue-400 font-bold uppercase text-xs tracking-widest mb-2">Universal (Al-Kullie)</h3>
                                <p class="text-slate-300 text-sm">Applies to MANY individuals. <br/><span class="text-blue-500/60 italic">Ex: Human.</span></p>
                            </div>
                        </div>
                    </section>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-6">2. Types of Universals</h2>
                        <div class="space-y-4">
                            <div class="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <h4 class="text-gold-400 font-bold">Muthavathee (Uniform)</h4>
                                <p class="text-slate-400 text-xs">Applies equally (e.g., 'Human').</p>
                            </div>
                            <div class="p-4 bg-slate-950/40 rounded-2xl border border-white/5">
                                <h4 class="text-gold-400 font-bold">Mushakkik (Graded)</h4>
                                <p class="text-slate-400 text-xs">Applies with variation in intensity (e.g., 'Light').</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "Which of these is a 'Mushakkik' (Graded) universal?",
                options: ["Humanity", "Gold", "Existence", "Stone"],
                correctAnswer: 2,
                explanation: "Existence varies in intensity between necessary and possible existence."
            }
        ]
    },
    {
        id: 5,
        title: "Semantic Relationships",
        topic: "Web of Meanings",
        description: "Master the four ways words relate to meanings: Mushtarak, Mutaradif, Manqul, and Mutabayin.",
        difficulty: 'Beginner',
        content: {
            summary: "Advanced study of shared meanings, synonyms, transferred technicalities, and disparate concepts.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase">Semantic Web</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Advanced Word Relationships</p>
                    </header>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="p-6 bg-slate-950/60 border border-gold-500/10 rounded-2xl shadow-xl">
                            <h5 class="text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-2">Mushtarak (Shared)</h5>
                            <p class="text-slate-400 text-xs mt-1">One word, many distinct meanings. <br/><span class="text-slate-500 italic">Ex: "Ain" (Eye, Spring, Gold).</span></p>
                        </div>
                        <div class="p-6 bg-slate-950/60 border border-gold-500/10 rounded-2xl shadow-xl">
                            <h5 class="text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-2">Manqul (Transferred)</h5>
                            <p class="text-slate-400 text-xs mt-1">Moved from original to technical. <br/><span class="text-slate-500 italic">Ex: "Salat" (Prayer).</span></p>
                        </div>
                        <div class="p-6 bg-slate-950/60 border border-gold-500/10 rounded-2xl shadow-xl">
                            <h5 class="text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-2">Mutaradif (Synonym)</h5>
                            <p class="text-slate-400 text-xs mt-1">Different words, same meaning. <br/><span class="text-slate-500 italic">Ex: "Lion" and "Asad".</span></p>
                        </div>
                        <div class="p-6 bg-slate-950/60 border border-gold-500/10 rounded-2xl shadow-xl">
                            <h5 class="text-gold-400 font-bold text-[10px] uppercase tracking-widest mb-2">Mutabayin (Disparate)</h5>
                            <p class="text-slate-400 text-xs mt-1">Different words, different meanings. <br/><span class="text-slate-500 italic">Ex: "Tree" and "Stone".</span></p>
                        </div>
                    </div>
                </div>
            `
        },
        quiz: [
            {
                question: "What is the relationship between 'Asad' and 'Lion'?",
                options: ["Mushtarak", "Manqul", "Mutaradif", "Mutabayin"],
                correctAnswer: 2,
                explanation: "They are synonyms sharing the same mental concept."
            }
        ]
    },

    // --- INTERMEDIATE LEVEL ---
    {
        id: 6,
        title: "The Five Universals",
        topic: "Al-Kulliyat al-Khamsah",
        description: "Explore the five universal concepts (Genus, Species, Differentia, Property, and Accident) that form the building blocks of logical definitions.",
        difficulty: 'Intermediate',
        content: {
            summary: "A Universal (Kullī) is a mental concept applicable to many individuals. The Five Universals categorize how these concepts relate to the essence of things.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Kulliyat al-Khamsah</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Five Universals</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. The Universal Framework</h2>
                        <div class="p-6 bg-slate-950/60 rounded-2xl border border-gold-500/20 mb-8">
                            <h3 class="text-gold-400 font-bold text-sm uppercase mb-3">Definition: Genus (Jins)</h3>
                            <p class="text-slate-300 leading-relaxed">
                                A <span class="text-gold-400 font-bold">Genus</span> is defined as the broad category shared by species that differ in their essence.
                            </p>
                            <div class="mt-4 p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                                <span class="text-gold-500 font-mono text-[10px] uppercase block mb-1">Classic Example</span>
                                <p class="text-slate-400 text-xs italic">"Animal" is the Genus for both Humans and Horses.</p>
                            </div>
                        </div>

                        <div class="p-6 bg-slate-950/60 rounded-2xl border border-gold-500/20 mb-8">
                            <h3 class="text-gold-400 font-bold text-sm uppercase mb-3">Definition: Differentia (Fasl)</h3>
                            <p class="text-slate-300 leading-relaxed">
                                A <span class="text-gold-400 font-bold">Differentia</span> is the unique essential marker that separates one species from all other species within the same genus.
                            </p>
                            <div class="mt-4 p-4 bg-gold-500/5 rounded-xl border border-gold-500/10">
                                <span class="text-gold-500 font-mono text-[10px] uppercase block mb-1">Classic Example</span>
                                <p class="text-slate-400 text-xs italic">"Rationality" is the Differentia for Humans.</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "Laughter is unique to humans, while walking is shared by humans and horses. How are these classified?",
                options: ["Laughter is Khāssa, Walking is 'Arad 'Amm", "Laughter is 'Arad 'Amm, Walking is Khāssa", "Both are Khāssa", "Both are 'Arad 'Amm"],
                correctAnswer: 0,
                explanation: "Khāssa (Property) is unique to one species, while 'Arad 'Amm (General Accident) is shared across multiple species."
            }
        ]
    },
    {
        id: 7,
        title: "The Four Logical Relationships",
        topic: "Al-Nisab al-Arba'ah",
        description: "Master the comparative logic used to identify how two universal concepts relate to each other.",
        difficulty: 'Intermediate',
        content: {
            summary: "Al-Nisab al-Arba'ah describes the quantitative relationship between the extensions of two universal concepts: Equality, Absolute General/Specific, Partial Overlap, and Disparity.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Nisab al-Arba'ah</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Four Logical Relationships</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
                                <h3 class="text-emerald-400 font-bold text-sm uppercase tracking-widest mb-4">Equality (Al-Tasāwī)</h3>
                                <p class="text-slate-400 text-xs leading-relaxed">When two concepts apply to the exact same set of individuals.</p>
                            </div>
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-sky-500/20">
                                <h3 class="text-sky-400 font-bold text-sm uppercase tracking-widest mb-4">Absolute General (Al-Mutlaq)</h3>
                                <p class="text-slate-400 text-xs leading-relaxed">When one concept entirely includes the other.</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "What is the relationship between 'Human' and 'Stone'?",
                options: ["Equality", "Absolute General", "Partial Overlap", "Disparity"],
                correctAnswer: 3,
                explanation: "Human and Stone share no individuals, which is Disparity (Al-Tabāyun)."
            }
        ]
    },
    {
        id: 8,
        title: "The Types of Definition",
        topic: "Al-Mu'arraf",
        description: "Explore the four primary methods of defining a concept (Hadd and Rasm).",
        difficulty: 'Intermediate',
        content: {
            summary: "Definition (Al-Mu'arraf) is the process of explaining an unknown concept using known ones. It is divided into Hadd and Rasm.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Mu'arraf</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Types of Definition</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. Essential Definitions (Al-Hadd)</h2>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
                                <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest">Hadd Tāmm (Complete)</h3>
                                <p class="text-slate-300 text-xs leading-relaxed">Uses the Proximate Genus and the Differentia. Ex: Human = "Rational Animal"</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "Defining a Human as a 'Laughing Animal' is classified as:",
                options: ["Hadd Tāmm", "Hadd Nāqis", "Rasm Tāmm", "Rasm Nāqis"],
                correctAnswer: 2,
                explanation: "Rasm Tāmm uses the Proximate Genus (Animal) and a unique Property (Capacity for laughter)."
            }
        ]
    },
    {
        id: 9,
        title: "The Proposition",
        topic: "Al-Qadiyya",
        description: "Understand the structure of logical judgments, distinguishing between Categorical and Conditional propositions.",
        difficulty: 'Intermediate',
        content: {
            summary: "A Proposition (Al-Qadiyya) is a statement that can be judged as true or false. It is divided into Hamliyya (Categorical) and Shartiyya (Conditional).",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Qadiyya</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Logical Proposition</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. Categorical Propositions (Hamliyya)</h2>
                        <div class="p-6 bg-slate-950/60 rounded-2xl border border-sky-500/20">
                            <h3 class="text-sky-400 font-bold text-xs uppercase mb-4 tracking-widest">Structure of Hamliyya</h3>
                            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div class="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
                                    <span class="text-gold-400 block font-bold text-[10px] mb-1">SUBJECT</span>
                                </div>
                                <div class="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
                                    <span class="text-gold-400 block font-bold text-[10px] mb-1">PREDICATE</span>
                                </div>
                                <div class="bg-slate-900/60 p-4 rounded-xl border border-white/5 text-center">
                                    <span class="text-gold-400 block font-bold text-[10px] mb-1">RELATION</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "In the sentence 'Gravity is a force,' what type of proposition is this?",
                options: ["Hamliyya (Categorical)", "Shartiyya (Conditional)"],
                correctAnswer: 0,
                explanation: "A direct judgment without conditions is Hamliyya."
            }
        ]
    },
    {
        id: 10,
        title: "The Modal Proposition",
        topic: "Al-Qadiyya al-Muvajjaha",
        description: "Study the modality of judgments, exploring how the 'Mode' (Jiha) defines the relationship.",
        difficulty: 'Intermediate',
        content: {
            summary: "Al-Qadiyya al-Muvajjaha (The Modal Proposition) is a categorical statement that explicitly mentions the 'Mode' (Jiha) of the relationship.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Qadiyya al-Muvajjaha</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">The Modal Proposition</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5">
                        <h2 class="text-2xl font-serif text-gold-300 border-b border-white/10 pb-3 mb-8">1. Understanding Modality (Al-Jiha)</h2>
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
                                <h3 class="text-emerald-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Necessity (Wujūb)</h3>
                            </div>
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-rose-500/20">
                                <h3 class="text-rose-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Impossibility (Imtinā')</h3>
                            </div>
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-sky-500/20">
                                <h3 class="text-sky-400 font-bold text-[10px] uppercase mb-2 tracking-widest">Possibility (Imkān)</h3>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "A proposition is called 'Muvajjaha' when:",
                options: ["It has a subject and predicate", "The 'Mode' (Jiha) is explicitly mentioned", "It is always true", "It is a conditional statement"],
                correctAnswer: 1,
                explanation: "A proposition is 'Muvajjaha' only when the Jiha is explicitly stated."
            }
        ]
    },
    {
        id: 11,
        title: "Disjunctive Propositions",
        topic: "Al-Qadiyya al-Munfasila",
        description: "Master the three types of disjunctive propositions in logic: Haqiqiyya, Māni'at al-Jamm', and Māni'at al-Khuluvv.",
        difficulty: 'Intermediate',
        content: {
            summary: "Al-Qadiyya al-Munfasila (Disjunctive Proposition) expresses a relationship of mutual exclusion or inclusion between two parts.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Al-Qadiyya al-Munfasila</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Disjunctive Propositions</p>
                    </header>

                    <section class="bg-slate-900/40 p-8 rounded-3xl border border-white/5 space-y-6">
                        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div class="p-6 bg-slate-950/60 rounded-2xl border border-emerald-500/20">
                                <h3 class="text-emerald-400 font-bold text-xs uppercase mb-3 tracking-widest">1. Haqiqiyya (Real)</h3>
                                <p class="text-slate-400 text-xs leading-relaxed">Cannot be both; cannot be neither.</p>
                            </div>
                        </div>
                    </section>
                </div>
            `
        },
        quiz: [
            {
                question: "A number is either Even or Odd. It cannot be both and cannot be neither. This is:",
                options: ["Haqiqiyya", "Māni'at al-Jamm'", "Māni'at al-Khuluvv"],
                correctAnswer: 0,
                explanation: "Haqiqiyya (Real) disjunction forbids both meeting and emptiness."
            }
        ]
    },
    {
        id: 12,
        title: "Logical Translation",
        topic: "Linguistic Logic",
        description: "Translate complex logical propositions into structured sequences using the interactive word bank.",
        difficulty: 'Intermediate',
        content: {
            summary: "Linguistic Logic focuses on the precise translation of natural language into formal logical structures.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Linguistic Logic</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Interactive Translation</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "Translate: 'Logic is a science.'",
                type: 'word-bank',
                wordBank: ["Logic", "is", "a", "science", "art", "feeling", "math"],
                correctSequence: ["Logic", "is", "a", "science"],
                translation: "Logic is a science.",
                options: [],
                correctAnswer: -1,
                explanation: "Subject (Logic) + Copula (is) + Predicate (science)."
            }
        ]
    },
    {
        id: 13,
        title: "Conditional Propositions",
        topic: "Al-Qadiyya al-Shartiyya",
        description: "Explore the structure and classification of conditional propositions (If P, then Q) in formal logic.",
        difficulty: 'Intermediate',
        content: {
            summary: "A conditional proposition (Al-Shartiyya) expresses a relationship where one statement depends on another.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Conditional Propositions</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Qadiyya al-Shartiyya</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "A conditional proposition has:",
                options: ["One term", "Two unrelated ideas", "Condition and result", "Question"],
                correctAnswer: 2,
                explanation: "A conditional proposition (If P, then Q) always consists of a condition and a result."
            }
        ]
    },

    // --- ADVANCED LEVEL ---
    {
        id: 14,
        title: "Contradiction (Al-Tanaqud)",
        topic: "The Rules of Opposition",
        description: "Master the 8 unities and the rules of logical contradiction in formal Mantiq.",
        difficulty: 'Advanced',
        content: {
            summary: "Contradiction (Al-Tanaqud) is the difference between two propositions in quality such that one must be true and the other false.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Logical Contradiction</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Tanaqud</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "What is the contradictory of: 'All students are present'?",
                options: ["No students are present", "Some students are present", "Some students are NOT present", "All students are absent"],
                correctAnswer: 2,
                explanation: "The contradictory of a Universal Affirmative is a Particular Negative."
            }
        ]
    },
    {
        id: 15,
        title: "Simple Conversion (Al-Aks)",
        topic: "The Rules of Transformation",
        description: "Learn the golden rules of flipping subjects and predicates while maintaining truth and quality.",
        difficulty: 'Advanced',
        content: {
            summary: "Simple Conversion (Al-Aks al-Mustawi) involves transposing the subject and predicate while preserving its truth and quality.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Simple Conversion</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Aks al-Mustawi</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "Convert the proposition: 'All birds are animals.'",
                options: ["All animals are birds", "Some animals are birds", "No animals are birds", "Some birds are not animals"],
                correctAnswer: 1,
                explanation: "A Universal Affirmative converts into a Particular Affirmative."
            }
        ]
    },
    {
        id: 16,
        title: "Contraposition (Aks al-Naqid)",
        topic: "The Rules of Transformation",
        description: "Master the art of swapping terms with their contradictions (Non-A / Non-B).",
        difficulty: 'Advanced',
        content: {
            summary: "Contraposition (Aks al-Naqid) involves swapping the subject and predicate with their contradictions.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Contraposition</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Aks al-Naqid</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "What is the contraposition of: 'All A is B'?",
                options: ["All B is A", "All Non-B is Non-A", "No Non-B is Non-A", "Some Non-B is Non-A"],
                correctAnswer: 1,
                explanation: "In contraposition, 'All A is B' becomes 'All Non-B is Non-A'."
            }
        ]
    },

    // --- MASTER LEVEL ---
    {
        id: 17,
        title: "Syllogisms (Al-Qiyas)",
        topic: "The First Figure (Al-Shakl al-Awwal)",
        description: "Master the structure and conditions of the most perfect syllogistic form in formal Mantiq.",
        difficulty: 'Master',
        content: {
            summary: "Al-Qiyas (Syllogism) is a logical argument where a conclusion is drawn from two premises.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Syllogisms</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Qiyas al-Iqtirani</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "Every gold is a metal. Every metal is an element. What is the conclusion?",
                options: ["Some gold is an element", "Every gold is an element", "No gold is an element", "Every metal is gold"],
                correctAnswer: 1,
                explanation: "The middle term (Metal) is removed to connect Subject (Gold) with Predicate (Element)."
            }
        ]
    },
    {
        id: 18,
        title: "Exceptional Syllogism (Al-Istithna'i)",
        topic: "Conditional Reasoning",
        description: "Understand the logic of 'If-Then' and 'Either-Or' statements in formal Mantiq.",
        difficulty: 'Master',
        content: {
            summary: "Exceptional Syllogism (Al-Istithna'i) is a form of reasoning where the conclusion is explicitly mentioned in one of the premises.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">Exceptional Syllogism</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Istithna'i</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "Scenario: 'If it rains, the ground is wet.' Condition: 'The ground is NOT wet.' What is the conclusion?",
                options: ["It is raining", "It is NOT raining", "The ground is dry", "No conclusion possible"],
                correctAnswer: 1,
                explanation: "Negating the consequent leads to the negation of the antecedent."
            }
        ]
    },
    {
        id: 19,
        title: "The Five Logical Arts",
        topic: "Al-Sina’at al-Khams",
        description: "Explore the five methods of reasoning used to achieve different goals.",
        difficulty: 'Master',
        content: {
            summary: "Al-Sina’at al-Khams (The Five Arts) are the different ways logic is applied depending on the desired outcome.",
            htmlContent: `
                <div class="space-y-10">
                    <header class="bg-slate-950/50 border border-gold-500/20 p-8 rounded-3xl text-center shadow-2xl">
                        <h1 class="text-3xl font-serif text-gold-400 mb-2 uppercase tracking-tighter">The Five Logical Arts</h1>
                        <p class="text-slate-500 font-mono text-[10px] uppercase tracking-[0.4em]">Al-Sina’at al-Khams</p>
                    </header>
                </div>
            `
        },
        quiz: [
            {
                question: "Which logical art aims for absolute certainty using axioms and sensory data?",
                options: ["Dialectic", "Demonstration (Burhan)", "Rhetoric", "Sophistry"],
                correctAnswer: 1,
                explanation: "Burhan (Demonstration) aims for absolute certainty."
            }
        ]
    }
];
