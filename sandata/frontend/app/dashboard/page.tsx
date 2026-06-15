'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MusicToggle } from '@/components/MusicToggle';
import { Navbar } from '@/components/Navbar';
import api from '@/lib/api';
import { battleEnemies, fallbackMissions, fallbackModules, getLevelProgress } from '@/lib/data';
import { getDailyTip, scamTips, type DailyTip } from '@/lib/dailyTips';
import type { LearningModule, Mission } from '@/lib/types';
import { avatarFightingImage, avatarImage, categoryImage, ui } from '@/lib/assets';
import { useStore } from '@/store/useStore';

function MiniHealth({ value, tone = 'green' }: { value: number; tone?: 'green' | 'red' }) {
  return (
    <div className="pixel-health-track h-5 w-full overflow-hidden">
      <div
        className={tone === 'red' ? 'pixel-health-fill pixel-health-fill-danger' : 'pixel-health-fill'}
        style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
      />
    </div>
  );
}

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
    levelXPGoal: 2500,
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
  const levelPercent = Math.round((levelValue / Math.max(levelMax, 1)) * 100);
  const recommended = useMemo(() => (modules.length ? modules : fallbackModules).slice(0, 3), [modules]);
  const previewEnemy = battleEnemies[0];
  const missionRows = [
    ...missions.slice(0, 3),
    { id: 'invite_agent', label: 'Invite a Fellow Agent', target: 1, progress: 0, xp: 50 },
  ];

  return (
    <div
      className="pixel-page bg-cover bg-center bg-fixed"
      style={{ backgroundImage: `linear-gradient(90deg, rgba(7, 7, 13, 0.9), rgba(8, 10, 18, 0.56) 34%, rgba(8, 10, 18, 0.8)), url(${ui.backgrounds.dashboard})` }}
    >
      <Navbar />
      <main className="mx-auto max-w-[430px] px-3 pb-28 pt-4 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-6 lg:pb-8">
        <section className="mx-auto grid max-w-[1600px] gap-5">
          <div className="flex items-center justify-end">
            <MusicToggle src={ui.audio.dashboard} label="Dashboard Music" />
          </div>

          <section className="pixel-screen-border overflow-hidden bg-[#08111f]/82">
            <div className="grid min-h-[170px] items-center gap-4 bg-[radial-gradient(circle_at_62%_38%,rgba(255,213,86,0.16),transparent_22%)] px-5 py-5 sm:grid-cols-[1fr_230px_360px] lg:px-10">
              <div>
                <p className="font-pixel text-xl leading-10 text-white sm:text-3xl">Welcome back,</p>
                <h1 className="font-pixel text-3xl leading-[1.45] text-gold sm:text-5xl">{activeUser.username || 'Shield Agent'}!</h1>
              </div>
              <Image src={avatarImage(activeUser.avatar)} alt="" width={220} height={240} priority className="mx-auto hidden max-h-[190px] w-auto object-contain object-bottom sm:block" />
              <div className="pixel-panel grid grid-cols-[76px_1fr] items-center gap-4 p-4">
                <Image src={ui.menu.banner} alt="" width={76} height={100} className="h-24 w-16 object-contain" />
                <div>
                  <p className="font-pixel text-[13px] leading-6 text-white">{activeUser.username || 'Shield Agent'}</p>
                  <p className="mt-1 font-pixel text-[11px] leading-5 text-gold">Level {activeUser.level}</p>
                  <div className="mt-3 flex items-center gap-3">
                    <MiniHealth value={levelPercent} />
                    <span className="font-pixel text-[10px] text-white">{levelValue.toLocaleString()} / {levelMax.toLocaleString()} XP</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_0.9fr]">
            <section className="pixel-panel overflow-hidden p-4">
              <div className="mb-3 flex justify-center">
                <h2 className="pixel-title-ribbon px-10 py-2 text-[13px] leading-6">Battle Readiness</h2>
              </div>
              <div className="dashboard-duel-scene bg-[#07101b]/58 px-3 py-4">
                <div className="text-center">
                  <p className="font-pixel text-[12px] uppercase text-sky-blue">You</p>
                  <div className="battle-fighter-stage dashboard-fighter-stage mt-2">
                    <Image src={avatarFightingImage(activeUser.avatar)} alt="" width={280} height={280} priority className="battle-fighter-sprite battle-fighter-player" />
                  </div>
                </div>
                <div className="battle-clash dashboard-clash" aria-hidden>
                  <span />
                  <span />
                  <span />
                </div>
                <div className="text-center">
                  <p className="font-pixel text-[12px] uppercase text-red-400">{previewEnemy.name}</p>
                  <div className="battle-fighter-stage dashboard-fighter-stage mt-2">
                    <Image src={previewEnemy.image} alt="" width={280} height={280} priority className="battle-fighter-sprite battle-fighter-enemy" />
                  </div>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <Link href="/battlefield" className="pixel-button-gold px-5 py-4 text-center text-[11px] leading-5">
                  Play Now
                </Link>
                <Link href="/battlefield?join=1" className="pixel-button-gold px-5 py-4 text-center text-[11px] leading-5">
                  Join a Friend
                </Link>
              </div>
            </section>

            <section className="grid gap-5 sm:grid-cols-3 xl:grid-cols-3">
              {[
                { icon: ui.dashboard.dayStreakIcon, label: 'Day Streak', value: activeUser.dayStreak || 0, copy: 'Keep the fire burning!' },
                { icon: ui.dashboard.totalEssenceIcon, label: 'Total Essence', value: activeUser.totalXP.toLocaleString(), copy: 'Essence fuels your journey.' },
                { icon: ui.dashboard.spiritShardsIcon, label: 'Spirit Shards', value: Math.max(0, Math.round(activeUser.totalXP / 6)).toLocaleString(), copy: 'Shards of wisdom.' },
              ].map((stat) => (
                <div key={stat.label} className="pixel-panel grid min-h-[220px] place-items-center p-4 text-center">
                  <h2 className="font-pixel text-[13px] uppercase leading-6 text-gold">{stat.label}</h2>
                  <Image src={stat.icon} alt="" width={104} height={104} className="mt-4 h-20 w-20 object-contain drop-shadow-[0_10px_12px_rgba(0,0,0,0.52)]" />
                  <div className="pixel-stat-value mt-3 text-3xl leading-10">{stat.value}</div>
                  <p className="mt-2 text-sm font-bold leading-6 text-[#e6c99a]">{stat.copy}</p>
                </div>
              ))}
            </section>
          </div>

          <div className="grid gap-5 xl:grid-cols-[0.95fr_1fr]">
            <section className="pixel-panel-light overflow-hidden p-5">
              <div className="mb-4 flex justify-center">
                <h2 className="pixel-title-ribbon px-8 py-2 text-[12px] leading-5">Prophecies In Progress</h2>
              </div>
              <div className="grid gap-3">
                {recommended.map((module, index) => (
                  <Link key={module._id} href={`/learn/${module._id}`} className="grid grid-cols-[70px_1fr] items-center gap-4 border-2 border-[#4a2b18] bg-[#f8e6bf] p-3 text-[#201136] shadow-[inset_0_0_0_2px_rgba(255,255,255,0.35)]">
                    <Image src={categoryImage(module.icon)} alt="" width={72} height={72} className="h-16 w-16 object-cover object-top" />
                    <div>
                      <h3 className="font-pixel text-[11px] leading-5">{['I.', 'II.', 'III.'][index]} {module.title}</h3>
                      <p className="mt-1 text-sm font-black leading-5">{module.description || 'Advance your shield training.'}</p>
                      <div className="mt-2 flex items-center gap-3">
                        <div className="h-4 flex-1 border-2 border-[#201136] bg-[#2a2023]">
                          <div className="h-full bg-[#3fbd45]" style={{ width: `${module.percentComplete || (index === 0 ? 75 : index === 1 ? 60 : 40)}%` }} />
                        </div>
                        <span className="font-pixel text-[10px]">{module.percentComplete || (index === 0 ? 75 : index === 1 ? 60 : 40)}%</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/learn" className="pixel-button-gold mx-auto mt-5 block max-w-md px-5 py-4 text-center text-[11px]">
                View All Prophecies
              </Link>
            </section>

            <section className="pixel-panel p-5">
              <div className="mb-4 flex justify-center">
                <h2 className="pixel-title-ribbon px-8 py-2 text-[12px] leading-5">Daily Missions</h2>
              </div>
              <div className="grid gap-3">
                {missionRows.map((mission, index) => {
                  const complete = mission.progress >= mission.target;
                  const icons = [ui.dashboard?.serpent || '/assets/dashboard assets v2/dashboard_icon_serpent.png', ui.menu.scroll, ui.menu.banner, ui.menu.swords];
                  return (
                    <div key={mission.id} className="grid grid-cols-[64px_1fr_auto_auto] items-center gap-3 border-2 border-white/10 bg-black/22 p-3">
                      <Image src={icons[index] || ui.menu.scroll} alt="" width={58} height={58} className="h-14 w-14 object-contain" />
                      <div>
                        <p className="font-pixel text-[11px] leading-5 text-white">{mission.label}</p>
                        <p className="text-sm font-bold text-white/56">{index === 0 ? 'Defeat phishing attempts.' : index === 1 ? 'Advance your knowledge.' : index === 2 ? 'Review your privacy shield.' : 'Grow the Shield Guild.'}</p>
                      </div>
                      <span className={`font-pixel text-[11px] ${complete ? 'text-[#4bd466]' : 'text-red-400'}`}>{mission.progress} / {mission.target}</span>
                      <span className="flex items-center gap-2 font-pixel text-[11px] text-white">
                        <Image src="/assets/dashboard assets v2/dashboard_gem_purple_1.png" alt="" width={24} height={24} className="h-7 w-7 object-contain" />
                        {mission.xp}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_120px] sm:items-center">
                <div className="pixel-panel-light p-4">
                  <p className="font-pixel text-[11px] leading-5">Kaalaman ang sandata.</p>
                  <p className="mt-2 text-sm font-black leading-6">{dailyTip.text}</p>
                </div>
                <Image src={ui.decor.chest} alt="" width={130} height={110} className="mx-auto h-24 w-auto object-contain" />
              </div>
            </section>
          </div>
        </section>
      </main>
    </div>
  );
}
