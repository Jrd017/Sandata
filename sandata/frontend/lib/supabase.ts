import { createClient } from '@supabase/supabase-js';

export type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  avatar_key: string | null;
  level: number | null;
  xp: number | null;
  total_xp: number | null;
  day_streak: number | null;
  week_streak: number | null;
  rank_title: string | null;
  quizzes_completed: number | null;
  accuracy: number | null;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl as string, supabaseAnonKey as string, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
      },
    })
  : null;
