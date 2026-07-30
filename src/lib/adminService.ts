import { supabase } from './supabaseClient';
import { Lesson } from '../types';
import { LESSONS } from '../constants';

/**
 * Fetch lessons from Supabase.
 * Falls back to static LESSONS if table is empty or error occurs.
 */
export async function getLessons(): Promise<Lesson[]> {
  try {
    const { data, error } = await supabase
      .from('lessons')
      .select('*')
      .order('id', { ascending: true });

    if (error) throw error;
    
    if (data && data.length > 0) {
      return data as Lesson[];
    }
    
    return LESSONS;
  } catch (err) {
    console.error('Failed to fetch lessons from Supabase:', err);
    return LESSONS;
  }
}

/**
 * Add a new lesson to Supabase.
 */
export async function addLesson(lesson: Partial<Lesson>): Promise<Lesson | null> {
  const { data, error } = await supabase
    .from('lessons')
    .insert([lesson])
    .select()
    .single();

  if (error) {
    console.error('Failed to add lesson:', error);
    return null;
  }
  return data as Lesson;
}

/**
 * Delete a lesson from Supabase.
 */
export async function deleteLesson(id: number): Promise<boolean> {
  const { error } = await supabase
    .from('lessons')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Failed to delete lesson:', error);
    return false;
  }
  return true;
}

/**
 * Seed initial lessons to Supabase if the table is empty.
 */
export async function seedLessons(): Promise<void> {
  const { data: existing } = await supabase.from('lessons').select('id').limit(1);
  
  if (!existing || existing.length === 0) {
    const { error } = await supabase.from('lessons').insert(LESSONS);
    if (error) console.error('Seeding failed:', error);
    else console.log('Successfully seeded lessons.');
  }
}

/**
 * Log an activity event to Supabase (if the table exists)
 * Fails silently if the table doesn't exist yet
 */
export async function logActivity(
  userId: string,
  action: string,
  details?: Record<string, unknown>
): Promise<void> {
  try {
    await supabase.from('activity_logs').insert({
      id: crypto.randomUUID(),
      user_id: userId,
      action,
      details: details ?? {},
      created_at: new Date().toISOString(),
    });
  } catch {
    // Silently ignore — table may not exist yet
  }
}
