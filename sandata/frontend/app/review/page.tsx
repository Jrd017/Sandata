'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { categoryImage, ui } from '@/lib/assets';
import { categoryCatalog, reviewFlashcards } from '@/lib/data';
import { cn } from '@/lib/cn';

export default function ReviewPage() {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [known, setKnown] = useState<Record<string, boolean>>({});
  const card = reviewFlashcards[index];
  const category = useMemo(() => categoryCatalog.find((item) => item.key === card.category), [card.category]);
  const progress = Math.round(((index + 1) / reviewFlashcards.length) * 100);
  const knownCount = Object.values(known).filter(Boolean).length;

  function move(direction: -1 | 1) {
    setIndex((current) => (current + direction + reviewFlashcards.length) % reviewFlashcards.length);
    setFlipped(false);
  }

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <section className="mx-auto max-w-5xl">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <p className="font-pixel text-[10px] uppercase leading-5 text-ube-deep">Review Deck</p>
              <h1 className="font-pixel text-xl leading-9 text-[#211044]">Flashcards</h1>
            </div>
            <Link href="/dashboard" className="rounded-lg bg-white px-4 py-3 text-xs font-bold text-ube-royal shadow-sm">
              Dashboard
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1fr_280px]">
            <section className="app-card overflow-hidden p-5 text-ube-royal sm:p-6">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-16 w-16 place-items-center overflow-hidden rounded-lg bg-lavender">
                    <Image src={categoryImage(card.category)} alt="" width={86} height={86} className="h-20 w-20 object-cover object-top" />
                  </div>
                  <div>
                    <p className="text-sm font-black">{category?.title || 'Cyber Defense'}</p>
                    <p className="text-xs font-semibold text-slate-dark">{card.hint}</p>
                  </div>
                </div>
                <div className="rounded-lg bg-lavender px-3 py-2 font-pixel text-[10px] text-ube-deep">
                  {index + 1} / {reviewFlashcards.length}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFlipped((current) => !current)}
                className={cn(
                  'grid min-h-[310px] w-full place-items-center rounded-lg border p-6 text-center shadow-[0_16px_40px_rgba(60,33,119,0.08)] transition',
                  flipped ? 'border-teal/50 bg-gradient-to-b from-white to-[#eafffb]' : 'border-ube-soft/25 bg-white',
                )}
              >
                <div>
                  <p className="font-pixel text-[11px] uppercase leading-6 text-ube-deep">{flipped ? 'Answer' : 'Question'}</p>
                  <p className="mt-5 text-xl font-black leading-9 text-[#211044]">{flipped ? card.back : card.front}</p>
                  <p className="mt-6 text-xs font-bold uppercase text-slate-dark">Tap to flip</p>
                </div>
              </button>

              <div className="mt-5 grid grid-cols-[48px_1fr_48px] gap-3">
                <button type="button" onClick={() => move(-1)} className="grid h-12 place-items-center rounded-lg border border-ube-soft/25 bg-white text-ube-royal shadow-sm" aria-label="Previous flashcard">
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setKnown((current) => ({ ...current, [card.id]: !current[card.id] }))}
                  className={cn('rounded-lg px-4 py-3 font-pixel text-[11px] shadow-pixel', known[card.id] ? 'bg-teal text-[#211044]' : 'bg-ube-deep text-white')}
                >
                  {known[card.id] ? 'Known' : 'Mark Known'}
                </button>
                <button type="button" onClick={() => move(1)} className="grid h-12 place-items-center rounded-lg border border-ube-soft/25 bg-white text-ube-royal shadow-sm" aria-label="Next flashcard">
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </section>

            <aside className="app-card p-5 text-ube-royal">
              <Image src={ui.decor.gem} alt="" width={76} height={76} className="h-16 w-16 object-contain" />
              <h2 className="mt-4 font-pixel text-[13px] leading-6">Review Progress</h2>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-lavender">
                <div className="h-full rounded-full bg-gradient-to-r from-teal to-ube-soft" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-lavender p-3 text-center">
                  <p className="font-pixel text-[13px]">{knownCount}</p>
                  <p className="mt-1 text-xs font-bold text-slate-dark">Known</p>
                </div>
                <div className="rounded-lg bg-lavender p-3 text-center">
                  <p className="font-pixel text-[13px]">{reviewFlashcards.length - knownCount}</p>
                  <p className="mt-1 text-xs font-bold text-slate-dark">To Review</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIndex(0);
                  setFlipped(false);
                  setKnown({});
                }}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg border border-ube-soft/25 bg-white px-4 py-3 text-sm font-black text-ube-royal shadow-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Reset Deck
              </button>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
