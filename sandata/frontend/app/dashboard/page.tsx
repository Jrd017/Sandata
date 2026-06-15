'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/Navbar';
import { XPBar } from '@/components/XPBar';
import { StatChip } from '@/components/StatChip';
import { MissionCard } from '@/components/MissionCard';
import { ModuleCard } from '@/components/ModuleCard';
import { MusicToggle } from '@/components/MusicToggle';
import api from '@/lib/api';
import { fallbackMissions, fallbackModules, getLevelProgress } from '@/lib/data';
import { getDailyTip, scamTips, type DailyTip } from '@/lib/dailyTips';
import type { LearningModule, Mission } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { avatarImage, categoryImage, ui } from '@/lib/assets';

export default function DashboardPage() {
  const router = useRouter();
  const { user, token, setUser } = useStore();
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [missions, setMissions] = useState<Mission[]>(fallbackMissions);
  const [dailyTip, setDailyTip] = useState<DailyTip>(scamTips[0]);

  useEffect(() => {
    const raw = typeof window !== 'undefined' ? localStorage.getItem('sandata-store') : null;
    if (process.env.NEXT_PUBLIC_REQUIRE_AUTH === 'true' && !token && !raw) router.push('/login');
  }, [router, token]);

  useEffect(() => {
    async function load() {
      try {
        const [me, moduleList, missionList] = await Promise.all([
          api.get('/user/me'),
          api.get('/modules'),
          api.get('/missions'),
        ]);
        setUser(me.data);
        setModules(moduleList.data);
        setMissions(missionList.data);
      } catch {
        if (!token) return;
      }
    }
    load();
  }, [setUser, token]);

  useEffect(() => {
    getDailyTip().then(setDailyTip).catch(() => setDailyTip(scamTips[0]));
  }, []);

  const activeUser = user || {
    username: 'Shield Agent',
    totalXP: 0,
    xp: 0,
    levelXPGoal: 2000,
    level: 1,
    rank: 'Aspirant',
    dayStreak: 0,
    weekStreak: 0,
    badges: [],
    accuracy: 0,
    avatar: 'character_1',
    quizzesCompleted: 0,
    completedModules: [],
    email: '',
    id: '',
  };

  const xp = getLevelProgress(activeUser.totalXP, activeUser.level);
  const levelValue = activeUser.xp ?? Math.max(0, activeUser.totalXP - xp.current);
  const levelMax = activeUser.levelXPGoal ?? Math.max(1, xp.next - xp.current);
  const recommended = useMemo(() => {
    if (modules.length) return modules.slice(0, 4);
    return fallbackModules.slice(0, 4);
  }, [modules]);
  const continueModule = recommended[0];

  return (
    <div
      className="min-h-screen bg-[#fbf8ff] bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(255, 248, 251, 0.9), rgba(247, 240, 255, 0.94)), url(${ui.backgrounds.dashboard})` }}
    >
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-4 flex justify-end">
            <MusicToggle src={ui.audio.dashboard} label="Dashboard Music" />
          </div>
          <div className="space-y-5">
            <div className="space-y-4 lg:hidden">
              <div className="flex items-center justify-between">
                <button type="button" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Open menu">
                  <Image src={ui.nav.menu} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                </button>
                <div className="flex items-center gap-3">
                  <button type="button" className="relative grid h-11 w-11 place-items-center rounded-full bg-white shadow-sm" aria-label="Notifications">
                    <Image src={ui.icons.bell} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                    <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
                  </button>
                  <Link href="/profile" className="grid h-12 w-12 place-items-end overflow-hidden rounded-full border border-ube-soft/25 bg-lavender">
                    <Image src={avatarImage(activeUser.avatar)} alt="" width={42} height={56} className="h-12 w-9 object-contain object-bottom" />
                  </Link>
                </div>
              </div>
              <h1 className="text-lg font-semibold text-[#211044]">Hello, <span className="font-bold">Shield Agent!</span></h1>
              <div className="app-card p-4">
                <div className="grid grid-cols-[1fr_76px] items-center gap-4">
                  <div>
                    <h2 className="font-pixel text-[14px] leading-6 text-[#211044]">Level {activeUser.level}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-dark">{activeUser.rank}</p>
                    <div className="mt-4">
                      <XPBar value={levelValue} max={levelMax} level={activeUser.level} />
                    </div>
                  </div>
                  <Image src={ui.icons.shield} alt="" width={82} height={82} className="h-20 w-20 object-contain" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <StatChip icon={ui.icons.lightning} value={activeUser.dayStreak} label="Day Streak" />
                <StatChip icon={ui.icons.star} value={activeUser.totalXP.toLocaleString()} label="Spirit Shards" />
                <StatChip icon={ui.icons.fire} value={activeUser.weekStreak} label="Week Streak" />
              </div>
            </div>

            <div className="hidden gap-4 lg:grid lg:grid-cols-[1.1fr_1fr]">
              <div className="app-card p-5">
                <div className="grid grid-cols-3 divide-x divide-ube-soft/20">
                  <StatChip icon={ui.icons.lightning} value={activeUser.dayStreak} label="Day Streak" />
                  <StatChip icon={ui.icons.star} value={activeUser.totalXP.toLocaleString()} label="Spirit Shards" />
                  <StatChip icon={ui.icons.fire} value={activeUser.weekStreak} label="Week Streak" />
                </div>
              </div>
              <div className="app-card p-5">
                <div className="grid grid-cols-[1fr_76px] items-center gap-4">
                  <div>
                    <h2 className="font-pixel text-[14px] leading-6 text-[#211044]">Level {activeUser.level}</h2>
                    <p className="mt-1 text-sm font-bold text-slate-dark">{activeUser.rank}</p>
                    <div className="mt-4">
                      <XPBar value={levelValue} max={levelMax} level={activeUser.level} />
                    </div>
                  </div>
                  <Image src={ui.icons.shield} alt="" width={82} height={82} className="h-20 w-20 object-contain" />
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[1.05fr_1.15fr_1fr]">
              <div className="app-card p-5">
                <div className="mb-4 flex items-center gap-3">
                  <Image src={ui.icons.target} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                  <h2 className="font-pixel text-[11px] leading-5 text-[#211044]">Daily Mission</h2>
                </div>
                <MissionCard mission={missions[0]} />
              </div>
              <Link href={continueModule?._id ? `/learn/${continueModule._id}` : '/learn'} className="app-card group flex min-h-[184px] flex-col justify-between p-5 text-ube-royal">
                <div className="flex items-center gap-3">
                  <Image src={categoryImage(continueModule?.icon)} alt="" width={58} height={58} className="h-14 w-14 object-contain" />
                  <div>
                    <h2 className="font-pixel text-[11px] leading-5 text-[#211044]">Continue Learning</h2>
                    <p className="mt-2 text-sm font-bold">{continueModule?.title || 'The Prophecy of the Phishing Serpent'}</p>
                    <p className="text-xs text-slate-dark">{continueModule?.percentComplete ? 'Chapter in progress' : 'No chapters started'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-[#ded2ea]">
                    <div className="h-full rounded-full bg-[#73c151]" style={{ width: `${continueModule?.percentComplete ?? 0}%` }} />
                  </div>
                  <span className="font-bold text-xs">{continueModule?.percentComplete ?? 0}%</span>
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-lavender text-lg transition group-hover:translate-x-1">-&gt;</span>
                </div>
              </Link>
              <div className="app-card grid grid-cols-[1fr_88px] items-end gap-4 p-5">
                <div>
                  <h2 className="font-pixel text-[11px] leading-5 text-[#211044]">Scam Awareness Tip</h2>
                  <p className="mt-4 text-xs font-semibold leading-5 text-slate-dark">{dailyTip.text}</p>
                </div>
                <Image src={ui.mascots.heroine} alt="" width={80} height={116} className="h-28 w-auto object-contain object-bottom" />
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <Link href="/battlefield" className="app-card group grid min-h-[142px] grid-cols-[1fr_92px] items-center overflow-hidden bg-gradient-to-br from-[#25104f] to-[#5e3aad] p-5 text-white">
                <div>
                  <p className="font-pixel text-[10px] uppercase leading-5 text-teal">Play</p>
                  <h2 className="mt-2 font-pixel text-[13px] leading-6">Enter Battlefield</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-white/72">Fight scam threats with quick quiz counters.</p>
                </div>
                <Image src={ui.icons.shield} alt="" width={92} height={92} className="h-20 w-20 object-contain transition group-hover:scale-105" />
              </Link>
              <Link href="/review" className="app-card group grid min-h-[142px] grid-cols-[1fr_92px] items-center overflow-hidden bg-white/94 p-5 text-ube-royal">
                <div>
                  <p className="font-pixel text-[10px] uppercase leading-5 text-ube-deep">Review</p>
                  <h2 className="mt-2 font-pixel text-[13px] leading-6">Flashcards</h2>
                  <p className="mt-3 text-sm font-semibold leading-6 text-slate-dark">Practice core safety rules between battles.</p>
                </div>
                <Image src={ui.icons.book} alt="" width={92} height={92} className="h-20 w-20 object-contain transition group-hover:scale-105" />
              </Link>
            </div>

            <section>
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="font-pixel text-[13px] text-[#211044]">Recommended For You</h2>
                <Link href="/learn" className="text-sm font-bold text-ube-deep">View all</Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {recommended.map((module) => (
                  <ModuleCard
                    key={module._id}
                    title={module.title}
                    subtitle={`${module.completionXP} Essence reward`}
                    icon={module.icon}
                    progress={module.percentComplete || 0}
                    difficulty={module.difficulty}
                    href={`/learn/${module._id}`}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
