'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { Navbar } from '@/components/Navbar';
import { QuizOption } from '@/components/QuizOption';
import api from '@/lib/api';
import type { LearningModule } from '@/lib/types';
import { useStore } from '@/store/useStore';
import { categoryImage, ui } from '@/lib/assets';
import { fallbackModules } from '@/lib/data';
import { hasSupabaseConfig } from '@/lib/supabase';
import { updateSupabaseQuizStats } from '@/lib/supabaseData';

type Feedback = {
  isCorrect: boolean;
  explanation: string;
  correctIndex: number;
} | null;

export default function ModuleQuizPage() {
  const params = useParams<{ moduleId: string }>();
  const router = useRouter();
  const { user, setUser } = useStore();
  const [module, setModule] = useState<LearningModule | null>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [timeLeft, setTimeLeft] = useState(25);
  const [result, setResult] = useState<{ scorePercent: number; xpAwarded: number; newBadges: string[] } | null>(null);
  const questions = useMemo(() => {
    if (module?.questions?.length) return module.questions;
    return fallbackModules[0].questions || [];
  }, [module]);
  const question = questions[index];
  const totalQuestions = questions.length;

  useEffect(() => {
    const fallback = fallbackModules.find((item) => item._id === params.moduleId);
    if (fallback) {
      setModule(fallback);
      api.get(`/modules/${params.moduleId}`).then((res) => setModule(res.data)).catch(() => undefined);
      return;
    }

    api.get(`/modules/${params.moduleId}`).then((res) => setModule(res.data)).catch(() => {
      router.push('/learn');
    });
  }, [params.moduleId, router]);

  const submitQuiz = useCallback(async (finalAnswers: number[]) => {
    if (!module) return;
    const completeAnswers = questions.map((_, itemIndex) => finalAnswers[itemIndex] ?? -1);
    try {
      const { data } = await api.post('/quiz/submit', { moduleId: module._id, answers: completeAnswers });
      setUser(data.user);
      setResult({ scorePercent: data.scorePercent, xpAwarded: data.xpAwarded, newBadges: data.newBadges || [] });
      toast.success(`+${data.xpAwarded} Spirit Shards awarded`);
    } catch {
      const correct = questions.reduce((sum, item, itemIndex) => sum + (completeAnswers[itemIndex] === item.correctIndex ? 1 : 0), 0);
      const total = Math.max(questions.length, 1);
      const xpAwarded = correct * 50;
      const scorePercent = Math.round((correct / total) * 100);
      const nextUser = user
        ? { ...user, totalXP: user.totalXP + xpAwarded, xp: (user.xp || 0) + xpAwarded, quizzesCompleted: user.quizzesCompleted + 1 }
        : {
            id: 'local-shield-agent',
            username: 'Shield Agent',
            email: '',
            avatar: 'character_1',
            totalXP: xpAwarded,
            xp: xpAwarded,
            levelXPGoal: 2000,
            level: 1,
            rank: 'Aspirant',
            dayStreak: 0,
            weekStreak: 0,
            badges: [],
            completedModules: ['phishing-basics'],
            quizzesCompleted: 1,
            accuracy: scorePercent,
          };
      if (hasSupabaseConfig && user?.id) {
        try {
          setUser(await updateSupabaseQuizStats(user, xpAwarded, scorePercent));
        } catch {
          setUser(nextUser);
        }
      } else {
        setUser(nextUser);
      }
      setResult({ scorePercent, xpAwarded, newBadges: [] });
      toast.success(`+${xpAwarded} Spirit Shards awarded`);
    }
  }, [module, questions, setUser, user]);

  const advance = useCallback((nextAnswers: number[]) => {
    if (!module) return;
    if (index >= Math.max(questions.length, 1) - 1) {
      submitQuiz(nextAnswers).catch(() => toast.error('Could not submit quiz'));
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
    setTimeLeft(25);
  }, [index, module, questions.length, submitQuiz]);

  useEffect(() => {
    if (!question || selected !== null || result) return;
    const timer = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(timer);
          const nextAnswers = [...answers];
          nextAnswers[index] = -1;
          setAnswers(nextAnswers);
          setSelected(-1);
          setFeedback({ isCorrect: false, correctIndex: -1, explanation: 'Time ran out. In real life, pausing is still safer than rushing.' });
          window.setTimeout(() => advance(nextAnswers), 900);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [advance, answers, index, question, result, selected]);

  async function choose(answer: number) {
    if (!module || !question || selected !== null) return;
    setSelected(answer);
    const nextAnswers = [...answers];
    nextAnswers[index] = answer;
    setAnswers(nextAnswers);

    try {
      const { data } = await api.post('/quiz/check', { moduleId: module._id, questionIndex: index, answer });
      setFeedback(data);
      if (data.isCorrect) toast.success('+Spirit Shards signal detected');
    } catch {
      const correctIndex = question.correctIndex ?? -1;
      const isCorrect = answer === correctIndex;
      setFeedback({
        isCorrect,
        correctIndex,
        explanation: question.explanation || (isCorrect ? 'Correct. This is the safest response.' : 'Not quite. Slow down and verify through an official channel.'),
      });
      if (isCorrect) toast.success('+Spirit Shards signal detected');
    }
  }

  const timerStyle = useMemo(() => ({ background: `conic-gradient(#7FD6C9 ${timeLeft * 14.4}deg, rgba(255,255,255,0.18) 0deg)` }), [timeLeft]);

  if (!module || !question) {
    return (
      <div className="min-h-screen bg-[#fbf8ff]">
        <Navbar />
        <main className="mx-auto max-w-[390px] px-4 pb-8 pt-8 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8">
          <div className="app-card p-6 font-pixel text-[12px] text-ube-royal">Loading module...</div>
        </main>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-[#fbf8ff]">
        <Navbar />
        <main className="mx-auto max-w-[390px] px-4 pb-8 pt-8 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8">
          <section className="app-card mx-auto max-w-2xl p-6 text-center text-ube-royal">
            <Image src={ui.decor.trophy} alt="" width={86} height={96} className="mx-auto h-20 w-20 object-contain" />
            <h1 className="mt-5 font-pixel text-xl leading-9">Adventure Complete</h1>
            <p className="mt-3 text-sm font-semibold text-slate-dark">Score {result.scorePercent}% - Spirit Shards awarded by the server only.</p>
            <div className="mt-5 rounded-lg bg-white p-4 font-pixel text-[12px]">
              +{result.xpAwarded} Spirit Shards
            </div>
            {result.newBadges.length ? (
              <p className="mt-4 text-sm font-bold text-ube-deep">New badge: {result.newBadges.join(', ')}</p>
            ) : null}
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Link href="/dashboard" className="rounded-lg bg-ube-deep px-5 py-3 font-pixel text-[11px] text-white shadow-pixel">Dashboard</Link>
              <Link href="/learn" className="rounded-lg border-2 border-ube-deep px-5 py-3 font-pixel text-[11px] text-ube-deep">Prophecies</Link>
            </div>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fbf8ff]">
      <Navbar />
      <main className="mx-auto max-w-[390px] px-4 pb-8 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <div className="mb-5 flex items-center justify-between gap-4">
          <Link href="/learn" className="grid h-11 w-11 place-items-center rounded-xl bg-white text-ube-royal shadow-sm" aria-label="Back to learn">
            <Image src={ui.icons.arrowLeft} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
          </Link>
          <div className="grid h-16 w-16 place-items-center rounded-full p-1 shadow-sm" style={timerStyle}>
            <div className="grid h-full w-full place-items-center rounded-full bg-white font-pixel text-[10px] text-ube-royal">
              {timeLeft} cycles
            </div>
          </div>
        </div>

        <section className="app-card p-5 text-ube-royal sm:p-6 lg:max-w-3xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="font-pixel text-lg leading-8">{question.scenarioTitle || module.title}</h1>
              {question.scenarioSubtitle ? <p className="mt-2 text-sm font-semibold text-slate-dark">{question.scenarioSubtitle}</p> : null}
              <span className="mt-2 inline-flex rounded-full bg-lavender px-3 py-1 text-xs font-bold capitalize text-ube-deep">{module.category.replace('_', ' ')}</span>
            </div>
            <div className="font-pixel text-[10px] text-ube-deep">
              Challenge {index + 1} of {totalQuestions}
            </div>
          </div>

          <div className="mb-6 flex gap-2">
            {Array.from({ length: Math.max(totalQuestions, 1) }).map((_, step) => (
              <div key={step} className="h-2 flex-1 overflow-hidden rounded-full bg-[#ded2ea]">
                <div className="h-full rounded-full bg-ube-deep" style={{ width: step <= index ? '100%' : '0%' }} />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-ube-soft/25 bg-white p-5">
            <div className="mb-3 font-pixel text-[10px] uppercase leading-5 text-ube-deep">{question.scenarioType}</div>
            {question.message ? (
              <div className="rounded-xl border border-ube-soft/20 bg-white p-4 text-sm shadow-sm">
                <div className="space-y-1 text-xs font-semibold text-slate-dark">
                  <p>From: <span className="text-[#211044]">{question.message.from}</span></p>
                  <p>To: <span className="text-[#211044]">{question.message.to}</span></p>
                </div>
                <div className="mt-4 flex items-center gap-2 text-[#223c85]">
                  <span className="text-2xl font-black">P</span>
                  <span className="text-xl font-black italic">{question.message.brand}</span>
                </div>
                <p className="mt-4 text-sm font-bold leading-6 text-[#211044]">{question.message.body}</p>
                <button type="button" className="pixel-button mt-4 rounded-lg bg-gradient-to-b from-ube-soft to-ube-deep px-5 py-3 text-sm font-bold text-white">
                  {question.message.cta}
                </button>
              </div>
            ) : (
              <>
                <Image src={categoryImage(module.icon)} alt="" width={88} height={88} className="mb-3 h-20 w-20 object-contain" />
                <p className="text-lg font-bold leading-8">{question.questionText}</p>
              </>
            )}
          </div>

          {question.message ? <p className="mt-5 text-sm font-black text-[#211044]">{question.questionText}</p> : null}

          <div className="mt-5 grid gap-3">
            {question.options.map((option, optionIndex) => {
              let state: 'idle' | 'selected' | 'correct' | 'incorrect' | 'disabled' = 'idle';
              if (selected !== null && feedback) {
                if (optionIndex === feedback.correctIndex) state = 'correct';
                else if (optionIndex === selected) state = feedback.isCorrect ? 'correct' : 'incorrect';
                else state = 'disabled';
              }
              return (
                <QuizOption
                  key={option}
                  letter={String.fromCharCode(65 + optionIndex)}
                  text={option}
                  state={state}
                  disabled={selected !== null}
                  onClick={() => choose(optionIndex)}
                />
              );
            })}
          </div>

          {feedback ? (
            <div className="mt-5 rounded-xl border border-ube-soft/20 bg-lavender p-4 text-sm font-bold leading-6 text-ube-royal">
              {feedback.explanation}
            </div>
          ) : null}

          {selected !== null ? (
            <button
              type="button"
              onClick={() => advance(answers)}
              className="pixel-button mt-5 w-full rounded-lg bg-gradient-to-b from-ube-soft to-ube-deep px-5 py-4 font-pixel text-[12px] text-white"
            >
              {index === totalQuestions - 1 ? 'Complete Adventure' : 'Next Challenge'}
            </button>
          ) : null}
        </section>
      </main>
    </div>
  );
}
