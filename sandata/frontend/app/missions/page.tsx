'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { MissionCard } from '@/components/MissionCard';
import api from '@/lib/api';
import { fallbackMissions } from '@/lib/data';
import type { Mission } from '@/lib/types';
import { ui } from '@/lib/assets';

export default function MissionsPage() {
  const [missions, setMissions] = useState<Mission[]>(fallbackMissions);

  useEffect(() => {
    api.get('/missions').then((res) => setMissions(res.data)).catch(() => setMissions(fallbackMissions));
  }, []);

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <h1 className="font-pixel text-2xl leading-10 text-[#211044]">Daily Missions</h1>
        <p className="mt-2 text-sm font-semibold text-slate-dark">Small wins compound into stronger habits.</p>

        <section className="mt-6 grid gap-4 lg:max-w-3xl">
          {missions.map((mission) => <MissionCard key={mission.id} mission={mission} />)}
        </section>

        <section className="app-card mt-7 p-5 text-ube-royal sm:p-6 lg:max-w-3xl">
          <div className="grid gap-5 md:grid-cols-[140px_1fr_auto] md:items-center">
            <Image src={ui.decor.chest} alt="" width={150} height={135} className="h-32 w-36 object-contain" />
            <div>
              <h2 className="font-pixel text-lg leading-8">Streak Bonus</h2>
              <p className="mt-2 text-sm font-semibold leading-7 text-slate-dark">Keep your learning streak alive to open the weekly reward chest.</p>
            </div>
            <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-ube-deep px-5 py-4 font-pixel text-[12px] text-white">
              <Image src={ui.icons.lightning} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
              +30 Essence
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
