'use client';

import { FormEvent, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Copy, RotateCcw, Swords, Users } from 'lucide-react';
import { MusicToggle } from '@/components/MusicToggle';
import { Navbar } from '@/components/Navbar';
import { QuizOption } from '@/components/QuizOption';
import api from '@/lib/api';
import { avatarFightingImage, avatarImage, ui } from '@/lib/assets';
import { battleEnemies, battlefieldQuestions } from '@/lib/data';
import { cn } from '@/lib/cn';
import { hasSupabaseConfig } from '@/lib/supabase';
import { updateSupabaseQuizStats } from '@/lib/supabaseData';
import type { User } from '@/lib/types';
import { useStore } from '@/store/useStore';

type Outcome = 'win' | 'loss';

type Result = {
  newBadges: string[];
  outcome: Outcome;
  scorePercent: number;
  xpAwarded: number;
};

type Feedback = {
  isCorrect: boolean;
  explanation: string;
  correctIndex: number;
} | null;

const fallbackUser: User = {
  id: 'local-shield-agent',
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

const rankTable = [
  { min: 0, level: 1, rank: 'Aspirant' },
  { min: 500, level: 2, rank: 'Data Scout' },
  { min: 1500, level: 3, rank: 'Shield Apprentice' },
  { min: 3000, level: 4, rank: 'Phish Hunter' },
  { min: 5000, level: 5, rank: 'Scam Buster' },
  { min: 8000, level: 6, rank: 'Net Guardian' },
  { min: 12000, level: 7, rank: 'Cyber Warrior' },
  { min: 18000, level: 8, rank: 'Digital Paladin' },
  { min: 25000, level: 9, rank: 'Data Sovereign' },
  { min: 35000, level: 10, rank: 'SanData Master' },
];

function createLocalRoomCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function applyLocalBattleResult(user: User | null, xpAwarded: number, scorePercent: number) {
  const base = user || fallbackUser;
  const totalXP = base.totalXP + xpAwarded;
  const nextQuizzes = base.quizzesCompleted + 1;
  const nextAccuracy = base.quizzesCompleted > 0
    ? Math.round(((base.accuracy * base.quizzesCompleted) + scorePercent) / nextQuizzes)
    : scorePercent;
  const rank = [...rankTable].reverse().find((item) => totalXP >= item.min) || rankTable[0];

  return {
    ...base,
    totalXP,
    xp: (base.xp || 0) + xpAwarded,
    level: rank.level,
    rank: rank.rank,
    quizzesCompleted: nextQuizzes,
    accuracy: nextAccuracy,
  };
}

function HealthBar({ label, value, tone }: { label: string; value: number; tone: 'green' | 'red' }) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px] font-black uppercase tracking-[0] text-white/76">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-3 overflow-hidden rounded-full border border-white/20 bg-black/28">
        <div
          className={cn('h-full rounded-full transition-all duration-500', tone === 'green' ? 'bg-gradient-to-r from-teal to-mint' : 'bg-gradient-to-r from-red-500 to-mango')}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export default function BattlefieldPage() {
  const { user, setUser } = useStore();
  const [enemyIndex, setEnemyIndex] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [playerHP, setPlayerHP] = useState(100);
  const [enemyHP, setEnemyHP] = useState(100);
  const [result, setResult] = useState<Result | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [allyJoined, setAllyJoined] = useState(false);
  const [roomStatus, setRoomStatus] = useState('Create a private code or enter one from a friend.');

  const activeUser = user || fallbackUser;
  const enemy = battleEnemies[enemyIndex % battleEnemies.length];
  const question = battlefieldQuestions[questionIndex];
  const correctCount = useMemo(
    () => answers.reduce((sum, answer, index) => sum + (answer === battlefieldQuestions[index]?.correctIndex ? 1 : 0), 0),
    [answers],
  );

  async function createRoom() {
    let code = createLocalRoomCode();
    try {
      const { data } = await api.post('/battlefield/rooms', {});
      code = data.code;
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.setItem(`sandata-room-${code}`, JSON.stringify({ code, host: activeUser.username, createdAt: Date.now() }));
      }
    }

    setRoomCode(code);
    setJoinCode(code);
    setAllyJoined(false);
    setRoomStatus('Private room ready. Share this code with a friend.');
    toast.success('Battle room created');
  }

  async function copyRoomCode() {
    if (!roomCode || typeof navigator === 'undefined') return;
    await navigator.clipboard?.writeText(roomCode);
    toast.success('Room code copied');
  }

  async function joinRoom(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase();
    if (!/^[A-Z0-9]{5,8}$/.test(code)) {
      toast.error('Enter a valid room code');
      return;
    }

    try {
      const { data } = await api.post(`/battlefield/rooms/${code}/join`, {});
      setRoomCode(data.code);
      setAllyJoined(data.players?.length > 1);
      setRoomStatus(data.players?.length > 1 ? 'Friend joined. Fight is synced for the room.' : 'Joined room. Waiting for another player.');
      toast.success('Joined battle room');
    } catch {
      setRoomCode(code);
      setAllyJoined(true);
      setRoomStatus('Joined room locally. Backend sync will activate when the API is available.');
      toast.success('Joined room');
    }
  }

  function choose(optionIndex: number) {
    if (selected !== null || result || !question) return;

    const isCorrect = optionIndex === question.correctIndex;
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = optionIndex;
    setAnswers(nextAnswers);
    setSelected(optionIndex);
    setFeedback({
      isCorrect,
      correctIndex: question.correctIndex ?? -1,
      explanation: question.explanation || (isCorrect ? 'Your counter lands cleanly.' : 'The attack slips through. Verify before acting.'),
    });
    setEnemyHP((current) => Math.max(0, current - (isCorrect ? 30 : 8)));
    setPlayerHP((current) => Math.max(0, current - (isCorrect ? 5 : 22)));
  }

  async function submitBattle(outcome: Outcome, finalCorrectCount: number) {
    if (submitting) return;
    setSubmitting(true);

    const totalQuestions = battlefieldQuestions.length;
    const scorePercent = Math.round((finalCorrectCount / totalQuestions) * 100);
    const fallbackXP = Math.min(160, Math.max(0, finalCorrectCount * 30 + (outcome === 'win' ? 40 : 0)));

    try {
      const { data } = await api.post('/battlefield/submit', {
        enemyId: enemy.id,
        outcome,
        correctAnswers: finalCorrectCount,
        totalQuestions,
        roomCode: roomCode || undefined,
      });
      setUser(data.user);
      setResult({
        outcome: data.outcome,
        scorePercent: data.scorePercent,
        xpAwarded: data.xpAwarded,
        newBadges: data.newBadges || [],
      });
      toast.success(`+${data.xpAwarded} Spirit Shards awarded`);
      return;
    } catch {
      const nextUser = applyLocalBattleResult(user, fallbackXP, scorePercent);
      if (hasSupabaseConfig && user?.id) {
        try {
          setUser(await updateSupabaseQuizStats(user, fallbackXP, scorePercent));
        } catch {
          setUser(nextUser);
        }
      } else {
        setUser(nextUser);
      }
      setResult({ outcome, scorePercent, xpAwarded: fallbackXP, newBadges: [] });
      toast.success(`+${fallbackXP} Spirit Shards awarded`);
    } finally {
      setSubmitting(false);
    }
  }

  function continueBattle() {
    const finalRound = questionIndex >= battlefieldQuestions.length - 1 || enemyHP <= 0 || playerHP <= 0;
    if (finalRound) {
      const won = enemyHP <= 0 || (correctCount >= 3 && playerHP > 0);
      submitBattle(won ? 'win' : 'loss', correctCount).catch(() => toast.error('Could not submit battle'));
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelected(null);
    setFeedback(null);
  }

  function resetBattle() {
    setEnemyIndex((current) => (current + 1) % battleEnemies.length);
    setQuestionIndex(0);
    setAnswers([]);
    setSelected(null);
    setFeedback(null);
    setPlayerHP(100);
    setEnemyHP(100);
    setResult(null);
    setSubmitting(false);
  }

  return (
    <div
      className="min-h-screen bg-[#160b30] bg-cover bg-center bg-fixed text-white"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(14, 8, 37, 0.68), rgba(14, 8, 37, 0.88)), url(${ui.backgrounds.battlefield})` }}
    >
      <Navbar />
      <main className="mx-auto max-w-[430px] px-4 pb-28 pt-5 transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:max-w-none lg:px-8 lg:pb-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-pixel text-[10px] uppercase leading-5 text-teal">Quiz Fight</p>
              <h1 className="font-pixel text-xl leading-9 text-white sm:text-2xl">Battlefield</h1>
            </div>
            <div className="flex items-center gap-2">
              <MusicToggle src={ui.audio.battlefield} label="Battle Music" />
              <Link href="/dashboard" className="rounded-lg border border-white/20 bg-white/12 px-4 py-3 text-xs font-bold text-white backdrop-blur hover:bg-white/18">
                Dashboard
              </Link>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)_280px]">
            <aside className="rounded-lg border border-white/14 bg-[#180b34]/78 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="grid h-14 w-14 place-items-end overflow-hidden rounded-full border border-teal/35 bg-white/10">
                  <Image src={avatarImage(activeUser.avatar)} alt="" width={54} height={70} className="h-16 w-auto object-contain object-bottom" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-black">{activeUser.username}</p>
                  <p className="truncate text-xs font-bold text-white/62">{activeUser.rank}</p>
                </div>
              </div>
              <div className="mt-4">
                <HealthBar label="Your Guard" value={playerHP} tone="green" />
              </div>

              <div className="mt-5 rounded-lg border border-white/12 bg-white/8 p-3">
                <div className="mb-3 flex items-center gap-2 text-sm font-black">
                  <Users className="h-4 w-4 text-teal" />
                  Friend Room
                </div>
                <p className="text-xs font-semibold leading-5 text-white/68">{roomStatus}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" onClick={createRoom} className="rounded-lg bg-teal px-3 py-2 text-xs font-black text-[#1d1136] shadow">
                    Create
                  </button>
                  <button type="button" onClick={copyRoomCode} disabled={!roomCode} className="grid h-9 w-9 place-items-center rounded-lg border border-white/18 bg-white/10 disabled:opacity-40" aria-label="Copy room code">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {roomCode ? <div className="mt-3 rounded-lg bg-black/22 px-3 py-2 font-pixel text-[12px] text-gold">{roomCode}</div> : null}
                <form className="mt-3 flex gap-2" onSubmit={joinRoom}>
                  <input
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                    className="min-w-0 flex-1 rounded-lg border border-white/14 bg-white/10 px-3 py-2 text-xs font-bold text-white outline-none placeholder:text-white/42"
                    placeholder="Room code"
                    maxLength={8}
                  />
                  <button type="submit" className="rounded-lg border border-white/18 bg-white/12 px-3 py-2 text-xs font-black text-white">
                    Join
                  </button>
                </form>
                {allyJoined ? (
                  <div className="mt-3 rounded-lg border border-teal/30 bg-teal/12 px-3 py-2 text-xs font-black text-teal">
                    Ally linked for this fight
                  </div>
                ) : null}
              </div>
            </aside>

            <section className="rounded-lg border border-white/14 bg-[#120823]/82 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.28)] backdrop-blur sm:p-5">
              <div className="grid min-h-[300px] grid-cols-[1fr_auto_1fr] items-end gap-2 rounded-lg border border-white/10 bg-black/18 px-2 pt-4 sm:px-6">
                <div className="relative flex h-full min-h-[260px] items-end justify-center">
                  <Image src={avatarFightingImage(activeUser.avatar)} alt="" width={230} height={260} priority className="max-h-[250px] w-auto object-contain object-bottom drop-shadow-[0_18px_22px_rgba(0,0,0,0.35)]" />
                </div>
                <div className="self-center rounded-full border border-gold/40 bg-black/35 px-3 py-2 font-pixel text-[10px] text-gold">
                  VS
                </div>
                <div className="relative flex h-full min-h-[260px] items-end justify-center">
                  <Image src={enemy.image} alt="" width={245} height={270} priority className="max-h-[260px] w-auto scale-x-[-1] object-contain object-bottom drop-shadow-[0_18px_22px_rgba(0,0,0,0.42)]" />
                </div>
              </div>

              {result ? (
                <div className="mt-5 rounded-lg border border-white/12 bg-white/10 p-5 text-center">
                  <div className={cn('mx-auto grid h-16 w-16 place-items-center rounded-full', result.outcome === 'win' ? 'bg-teal text-[#1d1136]' : 'bg-red-500 text-white')}>
                    <Swords className="h-8 w-8" />
                  </div>
                  <h2 className="mt-4 font-pixel text-lg leading-8">{result.outcome === 'win' ? 'Victory Secured' : 'Battle Complete'}</h2>
                  <p className="mt-2 text-sm font-semibold text-white/70">
                    Score {result.scorePercent}% - +{result.xpAwarded} Spirit Shards
                  </p>
                  {result.newBadges.length ? <p className="mt-2 text-sm font-black text-gold">New badge: {result.newBadges.join(', ')}</p> : null}
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <button type="button" onClick={resetBattle} className="rounded-lg bg-teal px-4 py-3 font-pixel text-[11px] text-[#1d1136] shadow">
                      Fight Again
                    </button>
                    <Link href="/leaderboard" className="rounded-lg border border-white/18 bg-white/10 px-4 py-3 font-pixel text-[11px] text-white">
                      Leaderboard
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="mt-5">
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-pixel text-[10px] uppercase leading-5 text-teal">{question.scenarioType}</p>
                      <h2 className="mt-1 text-lg font-black text-white">{question.scenarioTitle}</h2>
                      <p className="mt-1 text-sm font-semibold text-white/62">{question.scenarioSubtitle}</p>
                    </div>
                    <div className="rounded-lg border border-white/14 bg-white/8 px-3 py-2 font-pixel text-[10px] text-gold">
                      {questionIndex + 1} / {battlefieldQuestions.length}
                    </div>
                  </div>

                  <div className="rounded-lg border border-white/12 bg-white/9 p-4">
                    <p className="text-base font-black leading-7">{question.questionText}</p>
                    <p className="mt-3 text-xs font-semibold text-white/60">Enemy weakness: {enemy.weakness}</p>
                  </div>

                  <div className="mt-4 grid gap-3">
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
                    <div className={cn('mt-4 rounded-lg border p-4 text-sm font-bold leading-6', feedback.isCorrect ? 'border-teal/35 bg-teal/12 text-teal' : 'border-red-400/35 bg-red-500/12 text-red-100')}>
                      {feedback.explanation}
                    </div>
                  ) : null}

                  {selected !== null ? (
                    <button
                      type="button"
                      onClick={continueBattle}
                      disabled={submitting}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-gold to-mango px-5 py-4 font-pixel text-[12px] text-[#211044] shadow-pixel disabled:opacity-60"
                    >
                      {submitting ? 'Saving Battle' : questionIndex === battlefieldQuestions.length - 1 || enemyHP <= 0 || playerHP <= 0 ? 'Finish Battle' : 'Next Strike'}
                    </button>
                  ) : null}
                </div>
              )}
            </section>

            <aside className="rounded-lg border border-white/14 bg-[#180b34]/78 p-4 shadow-[0_24px_60px_rgba(0,0,0,0.22)] backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-black">{enemy.name}</p>
                  <p className="text-xs font-bold text-white/62">{enemy.title}</p>
                </div>
                <button type="button" onClick={resetBattle} className="grid h-10 w-10 place-items-center rounded-lg border border-white/16 bg-white/10" aria-label="New enemy">
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4">
                <HealthBar label="Enemy Guard" value={enemyHP} tone="red" />
              </div>
              <div className="mt-5 rounded-lg border border-white/12 bg-white/8 p-4">
                <div className="font-pixel text-[10px] leading-5 text-gold">Battle Rules</div>
                <div className="mt-3 grid gap-3 text-xs font-semibold leading-5 text-white/68">
                  <p>Correct answers break enemy guard and preserve your own.</p>
                  <p>Three strong counters or an empty enemy guard wins the fight.</p>
                  <p>Battle results update XP, accuracy, and leaderboard data when the API is connected.</p>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </main>
    </div>
  );
}
