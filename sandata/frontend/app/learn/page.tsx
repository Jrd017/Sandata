'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { Navbar } from '@/components/Navbar';
import { ModuleCard } from '@/components/ModuleCard';
import api from '@/lib/api';
import { fallbackModules } from '@/lib/data';
import { cn } from '@/lib/cn';
import type { Difficulty, LearningModule } from '@/lib/types';
import { ui } from '@/lib/assets';

const filters: Array<{ key: 'all' | Difficulty; label: string }> = [
  { key: 'all', label: 'All Scrolls' },
  { key: 'popular', label: 'Popular Lore' },
  { key: 'beginner', label: 'Novice' },
  { key: 'advanced', label: 'Master' },
];

export default function LearnPage() {
  const [active, setActive] = useState<'all' | Difficulty>('all');
  const [modules, setModules] = useState<LearningModule[]>([]);

  useEffect(() => {
    api.get('/modules').then((res) => setModules(res.data)).catch(() => setModules([]));
  }, []);

  const cards = useMemo(() => {
    const source = modules.length ? modules : fallbackModules;
    return source.map((module) => {
      return {
        key: module._id,
        title: module.title,
        subtitle: `${module.questions?.length || Math.max(3, Math.round(module.completionXP / 20))} Chapters`,
        icon: module.icon,
        progress: module.percentComplete || 0,
        difficulty: module.difficulty,
        href: `/learn/${module._id}`,
      };
    }).filter((card) => active === 'all' || card.difficulty === active);
  }, [active, modules]);

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <div className="mb-4 flex items-center justify-between lg:hidden">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full bg-white shadow-sm" aria-label="Profile">
            <Image src={ui.nav.profile} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-full border border-ube-deep bg-white shadow-sm" aria-label="Learning settings">
            <Image src={ui.icons.stats} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </button>
        </div>
        <div className="mb-6">
          <h1 className="text-center font-pixel text-2xl leading-10 text-[#211044] lg:text-left">Learn the Prophecies</h1>
          <p className="mt-2 text-center text-sm font-semibold text-slate-dark lg:text-left">Choose a prophecy scroll to begin your training.</p>
        </div>

        <div className="mb-6 flex flex-wrap justify-center gap-2 pb-2 lg:justify-start">
          {filters.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setActive(filter.key)}
              className={cn('rounded-xl border border-ube-soft/20 px-3 py-2 text-xs font-bold transition sm:px-4 sm:text-sm', active === filter.key ? 'bg-ube-deep text-white shadow-pixel' : 'bg-white text-ube-royal hover:bg-lavender')}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-5">
          {cards.map((card) => (
            <ModuleCard
              key={card.key}
              title={card.title}
              subtitle={card.subtitle}
              icon={card.icon}
              progress={card.progress}
              difficulty={card.difficulty}
              href={card.href}
            />
          ))}
        </section>
      </main>
    </div>
  );
}
