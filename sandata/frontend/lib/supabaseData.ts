import type { LeaderboardEntry, User } from '@/lib/types';
import { avatarPathFromChoice, ui } from '@/lib/assets';
import { supabase, type ProfileRow } from '@/lib/supabase';

const profileColumns = 'id, username, avatar_url, avatar_key, level, xp, total_xp, day_streak, week_streak, rank_title, quizzes_completed, accuracy';

function avatarKey(row: ProfileRow) {
  const value = row.avatar_url || row.avatar_key || ui.avatars.barong;
  return value.startsWith('/assets/') ? value : avatarPathFromChoice(value);
}

export function profileToUser(row: ProfileRow, email = ''): User {
  return {
    id: row.id,
    username: row.username || 'Shield Agent',
    email,
    avatar: avatarKey(row),
    totalXP: row.total_xp ?? 0,
    xp: row.xp ?? 0,
    level: row.level ?? 1,
    rank: row.rank_title || 'Aspirant',
    dayStreak: row.day_streak ?? 0,
    weekStreak: row.week_streak ?? 0,
    badges: [],
    completedModules: [],
    quizzesCompleted: row.quizzes_completed ?? 0,
    accuracy: row.accuracy ?? 0,
  };
}

export function profilesToLeaderboard(rows: ProfileRow[]): LeaderboardEntry[] {
  return rows.map((row, index) => ({
    id: row.id,
    rankNumber: index + 1,
    username: row.username || 'Shield Agent',
    avatar: avatarKey(row),
    totalXP: row.total_xp ?? 0,
    level: row.level ?? 1,
    rank: row.rank_title || 'Aspirant',
  }));
}

export async function fetchSupabaseLeaderboard(limit = 50) {
  if (!supabase) return [];

  const { data, error } = await supabase
    .from('profiles')
    .select(profileColumns)
    .order('total_xp', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return profilesToLeaderboard((data || []) as ProfileRow[]);
}

async function getOrCreateProfile(userId: string, email: string, username?: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data: existing, error: selectError } = await supabase
    .from('profiles')
    .select(profileColumns)
    .eq('id', userId)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existing) return profileToUser(existing as ProfileRow, email);

  const fallbackName = username || email.split('@')[0] || 'Shield Agent';
  const { data, error } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      username: fallbackName,
      avatar_key: 'character_1',
      avatar_url: ui.avatars.barong,
      rank_title: 'Aspirant',
    })
    .select(profileColumns)
    .single();

  if (error) throw error;
  return profileToUser(data as ProfileRow, email);
}

export async function signInWithSupabase(email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Unable to start Supabase session.');

  const username = typeof data.user.user_metadata?.username === 'string' ? data.user.user_metadata.username : undefined;
  const user = await getOrCreateProfile(data.user.id, data.user.email || email, username);
  return { token: data.session.access_token, user };
}

export async function registerWithSupabase(username: string, email: string, password: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { username } },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Unable to create Supabase user.');

  const user = await getOrCreateProfile(data.user.id, data.user.email || email, username);
  return {
    token: data.session?.access_token || '',
    user,
    needsEmailConfirmation: !data.session,
  };
}

export async function updateSupabaseAvatar(userId: string, avatar: string) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const avatarUrl = avatarPathFromChoice(avatar);
  const { error } = await supabase
    .from('profiles')
    .update({ avatar_key: avatar, avatar_url: avatarUrl })
    .eq('id', userId);

  if (error) throw error;
}

export async function updateSupabaseQuizStats(user: User, xpAwarded: number, scorePercent: number) {
  if (!supabase) throw new Error('Supabase is not configured.');

  const nextTotalXP = user.totalXP + xpAwarded;
  const nextXP = (user.xp || 0) + xpAwarded;
  const nextQuizzes = user.quizzesCompleted + 1;
  const nextAccuracy = user.quizzesCompleted > 0
    ? Math.round(((user.accuracy * user.quizzesCompleted) + scorePercent) / nextQuizzes)
    : scorePercent;

  const { data, error } = await supabase
    .from('profiles')
    .update({
      total_xp: nextTotalXP,
      xp: nextXP,
      quizzes_completed: nextQuizzes,
      accuracy: nextAccuracy,
    })
    .eq('id', user.id)
    .select(profileColumns)
    .single();

  if (error) throw error;
  return profileToUser(data as ProfileRow, user.email);
}
