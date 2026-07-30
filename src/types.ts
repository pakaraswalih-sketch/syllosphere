export interface LessonContent {
  summary: string;
  htmlContent: string;
}

export interface QuizQuestion {
    question: string;
    options: string[];
    correctAnswer: number; // Index of the correct option
    explanation: string;
    type?: 'multiple-choice' | 'word-bank';
    wordBank?: string[];
    correctSequence?: string[];
    translation?: string;
}

export interface Lesson {
    id: number;
    title: string;
    topic: string;
    description: string;
    difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Master';
    content?: LessonContent;
    quiz?: QuizQuestion[];
    base_xp?: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: number;
}

export type Tab = 'learn' | 'quiz' | 'tutor';

export enum LogicModuleType {
  FOUNDATIONS = 'foundations',
  SYLLOGISMS = 'syllogisms',
  PROPOSITIONAL = 'propositional',
  FALLACIES = 'fallacies'
}

export interface LogicModule {
  id: string;
  type: LogicModuleType;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  order: number;
}

export interface Puzzle {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  type: 'multiple-choice' | 'true-false' | 'text-input';
}

export interface UserProgress {
  completedModules: string[];
  solvedPuzzles: string[];
  currentModuleId: string | null;
  xp: number;
  certificate_unlocked?: boolean;
  certificate_id?: string;
  completion_date?: string;
  course_name?: string;
  issued_by?: string;
}

export interface ConsultThread {
  id: string;
  user_id: string;
  user_name: string;
  lesson_id: number;
  status: 'open' | 'resolved';
  created_at: string;
  updated_at: string;
}

export interface ConsultMessage {
  id: string;
  thread_id: string;
  sender_role: 'student' | 'admin';
  message: string;
  created_at: string;
}
