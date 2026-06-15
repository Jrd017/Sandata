'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { onboardingScenarios } from '@/lib/data';
import { cn } from '@/lib/cn';
import { ui } from '@/lib/assets';

export default function OnboardingPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<boolean | null>(null);
  const [showXp, setShowXp] = useState(false);
  const scenario = onboardingScenarios[index];
  const progress = ((index + 1) / onboardingScenarios.length) * 100;

  function answer(value: boolean) {
    if (selected !== null) return;
    setSelected(value);
    const correct = value === scenario.suspicious;
    setShowXp(correct);

    window.setTimeout(() => {
      if (index === onboardingScenarios.length - 1) {
        router.push('/login');
      } else {
        setIndex((current) => current + 1);
        setSelected(null);
        setShowXp(false);
      }
    }, 1250);
  }

  return (
    <main className="min-h-screen bg-[#fbf8ff] text-ube-royal">
      <section className="phone-shell relative flex flex-col overflow-hidden px-5 pb-5 pt-6">
        <div className="mb-6 flex items-center justify-end">
          <button type="button" onClick={() => router.push('/login')} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-ube-deep shadow-sm">
            Skip
          </button>
        </div>
        <div className="flex justify-center">
          <Image src={ui.icons.shield} alt="" width={132} height={132} className="h-32 w-32 object-contain" priority />
        </div>
        <div className="text-center">
          <h1 className="mt-2 font-pixel text-xl leading-8">SPOT THE SCAM!</h1>
          <p className="mt-2 text-sm font-semibold text-[#241449]">Can you identify the fake message?</p>
        </div>

        <div className="relative mt-7 w-[248px] rounded-xl border border-ube-soft/45 bg-white p-4 text-ube-royal shadow-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.22 }}
            >
              <div className="font-pixel text-[9px] leading-5 text-ube-deep">{scenario.sender}</div>
              <p className="mt-2 text-sm font-bold leading-6 text-[#241449]">{scenario.message}</p>
              {selected !== null ? (
                <div className={cn('mt-4 rounded-lg px-3 py-2 text-xs font-bold', selected === scenario.suspicious ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800')}>
                  {scenario.signal}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {showXp ? (
              <motion.div
                className="absolute -right-14 bottom-0 rounded-xl bg-ube-royal px-4 py-2 font-pixel text-[10px] text-gold shadow-pixel"
                initial={{ opacity: 0, y: 18, scale: 0.9 }}
                animate={{ opacity: 1, y: -12, scale: 1 }}
                exit={{ opacity: 0, y: -32 }}
              >
                +50 Shards
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-5 grid w-full grid-cols-[1fr_180px] items-end gap-4">
          <Image src={ui.mascots.barong} alt="" width={118} height={178} className="h-44 w-auto object-contain object-bottom" />
          <div className="grid gap-3">
          <button
            type="button"
            onClick={() => answer(true)}
            className="pixel-button rounded-lg bg-gradient-to-b from-ube-soft to-ube-deep px-5 py-4 font-pixel text-[10px] leading-5 text-white transition hover:-translate-y-0.5"
          >
            Looks Suspicious
          </button>
          <button
            type="button"
            onClick={() => answer(false)}
            className="rounded-lg border border-ube-soft/35 bg-white px-5 py-4 font-pixel text-[10px] leading-5 text-ube-royal transition hover:bg-lavender"
          >
            Looks Safe
          </button>
          </div>
        </div>

        <div className="mt-auto rounded-b-[18px] bg-gradient-to-r from-ube-deep to-ube-royal px-4 py-4 text-white">
          <div className="mb-3 flex justify-between font-pixel text-[10px]">
            <span>{index + 1} / {onboardingScenarios.length}</span>
            <span className="rounded-lg bg-ube-royal px-3 py-1 text-gold">+50 Shards</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full rounded-full bg-[#73c151]" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </section>
    </main>
  );
}
