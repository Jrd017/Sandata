'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { LeaderboardRow } from '@/components/LeaderboardRow';
import api from '@/lib/api';
import { cn } from '@/lib/cn';
import { fallbackLeaderboard } from '@/lib/data';
import type { LeaderboardEntry } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { avatarImage, ui } from '@/lib/assets';
import { hasSupabaseConfig, supabase } from '@/lib/supabase';
import { fetchSupabaseLeaderboard } from '@/lib/supabaseData';

export default function LeaderboardPage() {
  const { user } = useStore();
  const [scope, setScope] = useState<'local' | 'national'>('local');
  const [entries, setEntries] = useState<LeaderboardEntry[]>(fallbackLeaderboard);

  const loadLeaderboard = useCallback(async () => {
    try {
      if (hasSupabaseConfig) {
        const rows = await fetchSupabaseLeaderboard(50);
        setEntries(rows.length ? rows : fallbackLeaderboard);
        return;
      }

      const res = await api.get(`/leaderboard?scope=${scope}`);
      setEntries(res.data);
    } catch {
      setEntries(fallbackLeaderboard);
    }
  }, [scope]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  useEffect(() => {
    if (!hasSupabaseConfig || !supabase) return undefined;

    const client = supabase;
    const channel = client
      .channel('profiles-leaderboard')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadLeaderboard();
      })
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [loadLeaderboard]);

  const topThree = useMemo(() => entries.slice(0, 3), [entries]);
  const list = useMemo(() => entries.slice(3, 20), [entries]);

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <section className="mx-auto max-w-5xl rounded-[18px] bg-gradient-to-b from-[#3a197d] to-[#1d0d46] p-4 text-white shadow-[0_24px_60px_rgba(60,33,119,0.24)] sm:p-5">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-pixel text-2xl leading-10 text-white">Leaderboard</h1>
            <p className="mt-2 text-sm font-semibold text-white/75">Ranked by verified Spirit Shards.</p>
          </div>
          <div className="grid grid-cols-2 rounded-lg bg-white/10 p-1">
            {(['local', 'national'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScope(item)}
                className={cn('rounded-md px-5 py-2 text-sm font-bold capitalize', scope === item ? 'bg-gradient-to-b from-ube-soft to-ube-deep text-white shadow' : 'text-white/75')}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-3 items-end gap-2 md:gap-4">
          {topThree.map((entry, index) => (
            <div
              key={entry.id}
              className={cn('min-w-0 text-center', index === 0 ? 'order-2 -translate-y-4 md:-translate-y-6' : index === 1 ? 'order-1' : 'order-3')}
            >
              <Image src={index === 0 ? ui.crowns.gold : index === 1 ? ui.crowns.silver : ui.crowns.bronze} alt="" width={74} height={74} className="mx-auto h-10 w-10 object-contain sm:h-14 sm:w-14" />
              <div className="mx-auto mt-2 grid h-16 w-16 place-items-end overflow-hidden rounded-full bg-white/12 sm:h-24 sm:w-24">
                <Image src={avatarImage(entry.avatar)} alt="" width={92} height={122} className="h-20 w-auto object-contain object-bottom sm:h-28" />
              </div>
              <div className={cn('mx-auto mt-2 rounded-t-lg px-4 py-2 font-pixel text-base text-white shadow-pixel sm:rounded-t-xl sm:px-8 sm:py-3 sm:text-xl', index === 0 ? 'bg-gold text-ube-royal' : index === 1 ? 'bg-ube-soft' : 'bg-[#bf6d35]')}>{entry.rankNumber}</div>
              <h2 className="mt-1 truncate text-xs font-bold sm:text-base">{entry.username}</h2>
              <p className="mt-1 font-pixel text-[10px] text-gold">{entry.totalXP.toLocaleString()} Shards</p>
            </div>
          ))}
        </div>

        <div className="mt-7 grid gap-3">
          {list.map((entry) => (
            <LeaderboardRow key={entry.id} entry={entry} active={entry.id === user?.id || entry.username.includes('(You)')} />
          ))}
          {user && !entries.some((entry) => entry.id === user.id) ? (
            <LeaderboardRow
              active
              entry={{
                id: user.id,
                rankNumber: entries.length + 1,
                username: user.username,
                avatar: user.avatar,
                totalXP: user.totalXP,
                level: user.level,
                rank: user.rank,
              }}
            />
          ) : null}
        </div>
        </section>
      </main>
    </div>
  );
}
