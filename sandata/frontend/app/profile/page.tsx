'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { XPBar } from '@/components/XPBar';
import { BadgeCard } from '@/components/BadgeCard';
import { StatChip } from '@/components/StatChip';
import api from '@/lib/api';
import { badgeCatalog, getLevelProgress } from '@/lib/data';
import { cn } from '@/lib/cn';
import { useStore } from '@/store/useStore';
import { avatarChoices, avatarIconImage, ui } from '@/lib/assets';
import { hasSupabaseConfig } from '@/lib/supabase';
import { updateSupabaseAvatar } from '@/lib/supabaseData';

export default function ProfilePage() {
  const { user, setUser } = useStore();
  const [tab, setTab] = useState<'badges' | 'achievements'>('badges');
  const [editing, setEditing] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState('');

  useEffect(() => {
    api.get('/user/me').then((res) => setUser(res.data)).catch(() => undefined);
  }, [setUser]);

  const activeUser = user || {
    id: '',
    username: 'Shield Agent',
    email: '',
    avatar: 'character_1',
    totalXP: 0,
    xp: 0,
    levelXPGoal: 2000,
    level: 1,
    rank: 'Aspirant',
    dayStreak: 0,
    weekStreak: 0,
    badges: [],
    completedModules: [],
    quizzesCompleted: 0,
    accuracy: 0,
  };
  const xp = getLevelProgress(activeUser.totalXP, activeUser.level);
  const levelValue = activeUser.xp ?? Math.max(0, activeUser.totalXP - xp.current);
  const levelMax = activeUser.levelXPGoal ?? Math.max(1, xp.next - xp.current);
  const activeAvatarId = avatarChoices.find((choice) => choice.id === activeUser.avatar || choice.src === activeUser.avatar || choice.icon === activeUser.avatar)?.id || activeUser.avatar || 'character_1';
  const previewAvatar = editing ? selectedAvatar || activeAvatarId : activeAvatarId;
  const badgeImages: Record<string, string> = {
    phishing_fighter: ui.badges.phishing,
    quiz_master: ui.badges.quiz,
    streak_warrior: ui.badges.streak,
    sharp_observer: ui.badges.sharp,
    community_helper: ui.badges.community,
  };

  useEffect(() => {
    if (editing) setSelectedAvatar(activeAvatarId);
  }, [activeAvatarId, editing]);

  async function saveAvatar() {
    const avatar = selectedAvatar || activeUser.avatar || 'character_1';
    try {
      if (hasSupabaseConfig && activeUser.id) await updateSupabaseAvatar(activeUser.id, avatar);
      else await api.patch('/user/avatar', { avatar });
      setUser({ ...activeUser, avatar });
      setEditing(false);
      toast.success('Avatar updated');
    } catch {
      toast.error('Could not update avatar');
    }
  }

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <div className="mb-5 flex items-center justify-between">
          <Link href="/dashboard" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ube-royal shadow-sm" aria-label="Back to dashboard">
            <Image src={ui.icons.arrowLeft} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </Link>
          <button type="button" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ube-royal shadow-sm" aria-label="Settings">
            <Image src={ui.icons.settings} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </button>
        </div>

        <section className="app-card p-5 text-ube-royal sm:p-6">
          <div className="grid gap-6 md:grid-cols-[220px_1fr]">
            <div className="text-center">
              <div className="relative mx-auto grid h-36 w-36 place-items-center overflow-hidden rounded-full border-4 border-ube-deep bg-lavender shadow-pixel">
                <Image src={avatarIconImage(previewAvatar)} alt="" width={120} height={160} className="h-28 w-auto object-contain object-center" />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAvatar(activeAvatarId);
                    setEditing((current) => !current);
                  }}
                  className="absolute bottom-1 right-1 grid h-10 w-10 place-items-center rounded-full bg-mango text-ube-royal shadow"
                  aria-label="Edit avatar"
                >
                  <span className="font-pixel text-[10px]">E</span>
                </button>
              </div>
              {editing ? (
                <div className="mt-5">
                  <div className="grid grid-cols-5 gap-2">
                  {avatarChoices.map((choice) => {
                    const active = avatarIconImage(selectedAvatar || activeAvatarId) === choice.icon;
                    return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => setSelectedAvatar(choice.id)}
                      className={cn('relative grid h-14 place-items-center overflow-hidden rounded-lg border transition', active ? 'border-ube-deep bg-ube-deep text-white shadow-pixel' : 'border-ube-soft/30 bg-white hover:bg-lavender')}
                      aria-label={`Choose ${choice.label}`}
                    >
                      <Image src={choice.icon} alt="" width={42} height={56} className="h-12 w-auto object-contain object-center" />
                      {active ? <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-mango font-pixel text-[7px] text-ube-royal">OK</span> : null}
                    </button>
                    );
                  })}
                  </div>
                  <button
                    type="button"
                    onClick={saveAvatar}
                    className="pixel-button mt-4 w-full rounded-lg bg-gradient-to-b from-ube-soft to-ube-deep px-4 py-3 font-pixel text-[10px] text-white"
                  >
                    Save Avatar
                  </button>
                </div>
              ) : null}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="font-pixel text-xl leading-9">{activeUser.username}</h1>
                <span className="rounded-full bg-ube-deep px-3 py-1 font-pixel text-[10px] text-white">{activeUser.rank}</span>
              </div>
              <div className="mt-5">
                <XPBar value={levelValue} max={levelMax} level={activeUser.level} />
              </div>
              <div className="mt-5 grid grid-cols-4 gap-2">
                <StatChip icon={ui.progress.xp} value={activeUser.totalXP.toLocaleString()} label="Spirit Shards" />
                <StatChip icon={ui.icons.book} value={activeUser.completedModules?.length || 0} label="Modules" />
                <StatChip icon={ui.icons.check} value={activeUser.quizzesCompleted} label="Quizzes" />
                <StatChip icon={ui.icons.stats} value={`${activeUser.accuracy}%`} label="Accuracy" />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-5 inline-grid grid-cols-2 rounded-xl bg-white p-1 shadow-sm">
            {(['badges', 'achievements'] as const).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setTab(item)}
                className={cn('rounded-lg px-4 py-2 text-sm font-bold capitalize', tab === item ? 'bg-ube-deep text-white' : 'text-ube-royal')}
              >
                {item}
              </button>
            ))}
          </div>

          {tab === 'badges' ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
              {badgeCatalog.map((badge) => (
                <BadgeCard
                  key={badge.key}
                  name={badge.name}
                  description={badge.description}
                  color={badge.color}
                  image={badgeImages[badge.key]}
                  unlocked={activeUser.badges.includes(badge.key)}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-5 text-ube-royal shadow-pixel">
              <h2 className="font-pixel text-[13px] leading-6">Achievements</h2>
              <p className="mt-3 text-sm font-semibold text-slate-dark">Completed modules and badge unlocks will appear here as your training history grows.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
