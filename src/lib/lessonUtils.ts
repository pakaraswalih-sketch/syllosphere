import { Lesson } from '../types';

export const LEVEL_ORDER = ['Beginner', 'Intermediate', 'Advanced', 'Master'] as const;

export function normalizeLevel(difficulty?: string): string {
  const normalized = (difficulty || '').trim().toLowerCase();
  if (normalized === 'beginner') return 'Beginner';
  if (normalized === 'intermediate') return 'Intermediate';
  if (normalized === 'advanced') return 'Advanced';
  if (normalized === 'master' || normalized === 'expert') return 'Master';
  return (difficulty || '').trim();
}

function getLevelRank(difficulty?: string): number {
  const canonical = normalizeLevel(difficulty);
  const idx = LEVEL_ORDER.indexOf(canonical as (typeof LEVEL_ORDER)[number]);
  return idx === -1 ? LEVEL_ORDER.length : idx;
}

function getOrderValue(lesson: Lesson): number {
  const raw = lesson.order_index as unknown;
  if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
  if (typeof raw === 'string' && raw.trim() !== '' && Number.isFinite(Number(raw))) {
    return Number(raw);
  }
  return lesson.id;
}

/**
 * Sort lessons deterministically across all four levels:
 * Beginner -> Intermediate -> Advanced -> Master, then by order_index (or id).
 */
export function sortLessons(lessons: Lesson[]): Lesson[] {
  return [...lessons].sort((a, b) => {
    const rankA = getLevelRank(a.difficulty);
    const rankB = getLevelRank(b.difficulty);
    if (rankA !== rankB) return rankA - rankB;

    const orderA = getOrderValue(a);
    const orderB = getOrderValue(b);
    if (orderA !== orderB) return orderA - orderB;
    return a.id - b.id;
  });
}

/**
 * Compute sequential 1-based display numbers across all four levels without restarting.
 */
export function getLessonNumberMap(lessons: Lesson[]): Map<number, number> {
  const sorted = sortLessons(lessons);
  const map = new Map<number, number>();
  sorted.forEach((lesson, idx) => {
    map.set(lesson.id, idx + 1);
  });
  return map;
}

/**
 * Get the dynamic sequential 1-based display number for a given lesson ID.
 */
export function getLessonDisplayNumber(lessons: Lesson[], lessonId: number): number | null {
  return getLessonNumberMap(lessons).get(lessonId) ?? null;
}
