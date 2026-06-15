'use client';

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Copy, RotateCcw } from 'lucide-react';
import { MusicToggle } from '@/components/MusicToggle';
import api from '@/lib/api';
import { avatarFightingImage, avatarIconImage, avatarImage, ui } from '@/lib/assets';
import { battleEnemies } from '@/lib/data';
import { cn } from '@/lib/cn';
import { hasSupabaseConfig } from '@/lib/supabase';
import { updateSupabaseQuizStats } from '@/lib/supabaseData';
import type { BattleEnemy, User } from '@/lib/types';
import { useStore } from '@/store/useStore';

type Phase = 'lobby' | 'fight';
type Outcome = 'win' | 'loss';
type AttackSide = 'player' | 'enemy' | null;
type Feedback = {
  correctIndex: number;
  explanation: string;
  isCorrect: boolean;
} | null;
type Result = {
  newBadges: string[];
  outcome: Outcome;
  scorePercent: number;
  xpAwarded: number;
} | null;
type RoomPlayer = {
  avatar: string;
  id?: string;
  username: string;
};
type BattleRoomPayload = {
  code?: string;
  host?: Partial<RoomPlayer> | string;
  players?: Array<Partial<RoomPlayer> | string>;
  status?: string;
};
type RoomRole = 'solo' | 'host' | 'guest';

const playerMaxHP = 120;
const coOpQuestionCount = 10;
const coOpDamageMultiplier = 2;
const coOpEnemyHealthMultiplier = 2.4;
const fallbackAlly: RoomPlayer = {
  avatar: 'character_2',
  id: 'local-fellow-agent',
  username: 'Fellow Agent',
};

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

function normalizeRoomPlayer(player?: Partial<RoomPlayer> | string | null): RoomPlayer | null {
  if (!player) return null;
  if (typeof player === 'string') {
    return {
      avatar: 'character_1',
      id: player,
      username: player,
    };
  }

  const username = player.username?.trim() || 'Fellow Agent';
  return {
    avatar: player.avatar || 'character_2',
    id: player.id,
    username,
  };
}

function sameRoomPlayer(player: RoomPlayer | null, activeUser: User) {
  if (!player) return false;
  if (player.id && activeUser.id) return String(player.id) === String(activeUser.id);
  return player.username.trim().toLowerCase() === activeUser.username.trim().toLowerCase();
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

function getBattleEnemyMaxHP(enemy: BattleEnemy, coOpActive: boolean) {
  return coOpActive ? Math.round(enemy.maxHP * coOpEnemyHealthMultiplier) : enemy.maxHP;
}

function buildBattleQuestions(enemy: BattleEnemy, coOpActive: boolean, lane: 'player' | 'ally') {
  if (!coOpActive) return enemy.questions;

  const allQuestions = [
    ...enemy.questions,
    ...battleEnemies.filter((item) => item.id !== enemy.id).flatMap((item) => item.questions),
  ];
  const offset = lane === 'ally' ? Math.max(enemy.questions.length, Math.floor(allQuestions.length / 2)) : 0;

  return Array.from({ length: coOpQuestionCount }, (_, index) => {
    const source = allQuestions[(index + offset) % allQuestions.length];
    return {
      ...source,
      id: `${source.id}-${lane}-${index}`,
    };
  });
}

function HealthMeter({ current, max, tone }: { current: number; max: number; tone: 'green' | 'red' }) {
  const percent = Math.round((Math.max(0, current) / Math.max(max, 1)) * 100);
  return (
    <div className="grid grid-cols-[28px_1fr_auto] items-center gap-2">
      <span className="font-pixel text-[12px] text-white">HP</span>
      <div className="pixel-health-track h-5 overflow-hidden">
        <div
          className={tone === 'red' ? 'pixel-health-fill pixel-health-fill-danger' : 'pixel-health-fill'}
          style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
        />
      </div>
      <span className="font-pixel text-[10px] text-white">{Math.max(0, current)} / {max}</span>
    </div>
  );
}

function EnemyCard({
  coOpActive,
  enemy,
  maxHP,
  questionCount,
  selected,
  onSelect,
}: {
  coOpActive: boolean;
  enemy: BattleEnemy;
  maxHP: number;
  questionCount: number;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'pixel-panel relative grid min-h-[250px] gap-3 overflow-hidden p-4 text-left transition hover:-translate-y-1',
        selected && 'bg-[#211329] shadow-[0_0_0_4px_#ffd45c,inset_0_0_0_2px_rgba(255,212,92,0.28),0_12px_0_rgba(0,0,0,0.22)]',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-pixel text-[12px] leading-6 text-white">{enemy.name}</h3>
          <p className="mt-1 text-xs font-black uppercase text-gold">{enemy.title}</p>
        </div>
        {selected ? (
          <span className="border-2 border-[#0b0610] bg-[#ffd45c] px-2 py-1 font-pixel text-[8px] leading-4 text-[#241025] shadow-[0_0_0_2px_#9b6427]">Selected</span>
        ) : (
          <Image src={ui.shieldLogo} alt="" width={40} height={40} loading="eager" className="h-9 w-9 object-contain" />
        )}
      </div>
      <div className="grid h-32 place-items-center">
        <Image src={enemy.image} alt="" width={170} height={160} className="max-h-32 w-auto scale-x-[-1] object-contain drop-shadow-[0_14px_16px_rgba(0,0,0,0.48)]" />
      </div>
      <div className="grid gap-2 text-xs font-bold leading-5 text-white/68">
        <p>Weakness: <span className="text-white">{enemy.weakness}</span></p>
        <p>{questionCount} question{coOpActive ? 's each' : ''} battle set</p>
        <p>Enemy HP: <span className="text-white">{maxHP}</span>{coOpActive ? <span className="text-gold"> - co-op raid</span> : null}</p>
      </div>
    </button>
  );
}

export default function BattlefieldPage() {
  const { user, setUser } = useStore();
  const impactAudioRef = useRef<HTMLAudioElement | null>(null);
  const hurtAudioRef = useRef<HTMLAudioElement | null>(null);
  const victoryAudioRef = useRef<HTMLAudioElement | null>(null);
  const defeatAudioRef = useRef<HTMLAudioElement | null>(null);
  const [phase, setPhase] = useState<Phase>('lobby');
  const [selectedEnemyId, setSelectedEnemyId] = useState(battleEnemies[0].id);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [attackSide, setAttackSide] = useState<AttackSide>(null);
  const [playerHP, setPlayerHP] = useState(playerMaxHP);
  const [enemyHP, setEnemyHP] = useState(battleEnemies[0].maxHP);
  const [result, setResult] = useState<Result>(null);
  const [submitting, setSubmitting] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [allyJoined, setAllyJoined] = useState(false);
  const [allyPlayer, setAllyPlayer] = useState<RoomPlayer | null>(null);
  const [roomRole, setRoomRole] = useState<RoomRole>('solo');
  const [roomStatus, setRoomStatus] = useState('Create a private code or enter one from a friend.');

  const activeUser = user || fallbackUser;
  const ally = allyPlayer || (allyJoined ? fallbackAlly : null);
  const coOpActive = Boolean(ally);
  const enemy = battleEnemies.find((item) => item.id === selectedEnemyId) || battleEnemies[0];
  const enemyMaxHP = getBattleEnemyMaxHP(enemy, coOpActive);
  const playerQuestionLane = roomRole === 'guest' ? 'ally' : 'player';
  const partnerQuestionLane = playerQuestionLane === 'player' ? 'ally' : 'player';
  const questions = useMemo(() => buildBattleQuestions(enemy, coOpActive, playerQuestionLane), [coOpActive, enemy, playerQuestionLane]);
  const allyQuestions = useMemo(() => buildBattleQuestions(enemy, coOpActive, partnerQuestionLane), [coOpActive, enemy, partnerQuestionLane]);
  const question = questions[questionIndex] || questions[0];
  const correctCount = useMemo(
    () => answers.reduce((sum, answer, index) => sum + (answer === questions[index]?.correctIndex ? 1 : 0), 0),
    [answers, questions],
  );

  const applyRoomPayload = useCallback((payload: BattleRoomPayload | null, waitingMessage?: string) => {
    if (!payload) return;

    const host = normalizeRoomPlayer(payload.host);
    const players = (payload.players || [])
      .map((player) => normalizeRoomPlayer(player))
      .filter((player): player is RoomPlayer => Boolean(player));
    const allPlayers = players.length ? players : host ? [host] : [];
    const nextAlly = allPlayers.find((player) => !sameRoomPlayer(player, activeUser)) || null;

    setAllyPlayer(nextAlly);
    setAllyJoined(Boolean(nextAlly));
    if (host) setRoomRole(sameRoomPlayer(host, activeUser) ? 'host' : 'guest');
    else setRoomRole(nextAlly ? 'guest' : 'solo');

    if (payload.code) {
      setRoomCode(payload.code);
      setJoinCode(payload.code);
    }

    if (nextAlly) {
      setRoomStatus(`${nextAlly.username} joined. Co-op raid ready: 10 questions each, double damage.`);
    } else if (waitingMessage) {
      setRoomStatus(waitingMessage);
    }
  }, [activeUser]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (new URLSearchParams(window.location.search).has('join')) {
      setJoinCode('');
      setRoomStatus('Enter your friend code to join a shared fight.');
    }
  }, []);

  useEffect(() => {
    if (!attackSide) return;
    const timeout = window.setTimeout(() => setAttackSide(null), 820);
    return () => window.clearTimeout(timeout);
  }, [attackSide]);

  useEffect(() => {
    if (phase === 'lobby') setEnemyHP(enemyMaxHP);
  }, [enemyMaxHP, phase]);

  useEffect(() => {
    if (!roomCode || typeof window === 'undefined') return undefined;

    let cancelled = false;
    const waitingMessage = roomRole === 'guest'
      ? 'Joined room. Waiting for the host or second player.'
      : 'Private room ready. Waiting for your friend to join.';

    async function syncRoom() {
      try {
        const { data } = await api.get(`/battlefield/rooms/${roomCode}`);
        if (!cancelled) applyRoomPayload(data, waitingMessage);
      } catch {
        try {
          const raw = localStorage.getItem(`sandata-room-${roomCode}`);
          if (!raw || cancelled) return;
          applyRoomPayload(JSON.parse(raw), waitingMessage);
        } catch {
          // Local preview rooms are optional and can disappear between tabs.
        }
      }
    }

    void syncRoom();
    const interval = window.setInterval(syncRoom, 3000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [applyRoomPayload, roomCode, roomRole]);

  function playOneShot(audio: HTMLAudioElement | null, volume = 0.9) {
    if (!audio) return;

    audio.currentTime = 0;
    audio.volume = volume;
    void audio.play().catch(() => undefined);
  }

  function playBattleResultSound(outcome: Outcome) {
    playOneShot(outcome === 'win' ? victoryAudioRef.current : defeatAudioRef.current, 0.95);
  }

  function selectEnemy(enemyId: string) {
    setSelectedEnemyId(enemyId);
    const nextEnemy = battleEnemies.find((item) => item.id === enemyId) || battleEnemies[0];
    setEnemyHP(getBattleEnemyMaxHP(nextEnemy, coOpActive));
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setAttackSide(null);
    setResult(null);
  }

  function startFight() {
    setPhase('fight');
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setAttackSide(null);
    setPlayerHP(playerMaxHP);
    setEnemyHP(enemyMaxHP);
    setResult(null);
  }

  async function createRoom() {
    let code = createLocalRoomCode();
    const hostPlayer: RoomPlayer = {
      avatar: activeUser.avatar || 'character_1',
      id: activeUser.id,
      username: activeUser.username || 'Shield Agent',
    };

    try {
      const { data } = await api.post('/battlefield/rooms', {});
      code = data.code;
      applyRoomPayload(data, 'Private room ready. Waiting for your friend to join.');
    } catch {
      if (typeof window !== 'undefined') {
        const localRoom: BattleRoomPayload = {
          code,
          host: hostPlayer,
          players: [hostPlayer],
          status: 'waiting',
        };
        localStorage.setItem(`sandata-room-${code}`, JSON.stringify({ ...localRoom, enemy: enemy.id, createdAt: Date.now() }));
        applyRoomPayload(localRoom, 'Private room ready. Waiting for your friend to join.');
      }
    }

    setRoomCode(code);
    setJoinCode(code);
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
      applyRoomPayload(data, data.players?.length > 1 ? undefined : 'Joined room. Waiting for another player.');
      toast.success('Joined battle room');
    } catch {
      const guestPlayer: RoomPlayer = {
        avatar: activeUser.avatar || 'character_2',
        id: `${activeUser.id || 'local-shield-agent'}-guest`,
        username: activeUser.username || 'Shield Agent',
      };
      const fallbackHost: RoomPlayer = {
        avatar: 'character_3',
        id: `local-host-${code}`,
        username: 'Host Agent',
      };
      let localRoom: BattleRoomPayload = {
        code,
        host: fallbackHost,
        players: [fallbackHost, guestPlayer],
        status: 'ready',
      };

      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`sandata-room-${code}`);
          const parsed = raw ? JSON.parse(raw) : null;
          const host = normalizeRoomPlayer(parsed?.host) || normalizeRoomPlayer(parsed?.players?.[0]) || fallbackHost;
          localRoom = {
            ...parsed,
            code,
            host,
            players: [host, guestPlayer],
            status: 'ready',
          };
          localStorage.setItem(`sandata-room-${code}`, JSON.stringify(localRoom));
        } catch {
          localStorage.setItem(`sandata-room-${code}`, JSON.stringify(localRoom));
        }
      }

      applyRoomPayload(localRoom);
      toast.success('Joined room');
    }
  }

  function choose(optionIndex: number) {
    if (selectedAnswer !== null || result || !question) return;

    const isCorrect = optionIndex === question.correctIndex;
    const nextAnswers = [...answers];
    nextAnswers[questionIndex] = optionIndex;
    setAnswers(nextAnswers);
    setSelectedAnswer(optionIndex);
    setFeedback({
      isCorrect,
      correctIndex: question.correctIndex ?? -1,
      explanation: question.explanation || (isCorrect ? 'Your counter lands cleanly.' : 'The attack slips through. Verify before acting.'),
    });
    setAttackSide(isCorrect ? 'player' : 'enemy');
    playOneShot(impactAudioRef.current, 0.98);
    if (!isCorrect) playOneShot(hurtAudioRef.current, 0.88);

    const strikeDamage = Math.ceil(enemyMaxHP / questions.length) * (coOpActive ? coOpDamageMultiplier : 1);
    setEnemyHP((current) => Math.max(0, current - (isCorrect ? strikeDamage : coOpActive ? 12 : 8)));
    setPlayerHP((current) => Math.max(0, current - (isCorrect ? 4 : 28)));
  }

  async function submitBattle(outcome: Outcome, finalCorrectCount: number) {
    if (submitting) return;
    setSubmitting(true);

    const totalQuestions = questions.length;
    const scorePercent = Math.round((finalCorrectCount / totalQuestions) * 100);
    const fallbackXP = Math.min(180, Math.max(0, finalCorrectCount * 35 + (outcome === 'win' ? 45 : 0)));

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
    const finalRound = questionIndex >= questions.length - 1 || enemyHP <= 0 || playerHP <= 0;
    if (finalRound) {
      const won = enemyHP <= 0 || (correctCount >= Math.ceil(questions.length * 0.67) && playerHP > 0);
      const outcome = won ? 'win' : 'loss';
      playBattleResultSound(outcome);
      submitBattle(outcome, correctCount).catch(() => toast.error('Could not submit battle'));
      return;
    }

    setQuestionIndex((current) => current + 1);
    setSelectedAnswer(null);
    setFeedback(null);
    setAttackSide(null);
  }

  function resetToLobby() {
    setPhase('lobby');
    setQuestionIndex(0);
    setAnswers([]);
    setSelectedAnswer(null);
    setFeedback(null);
    setAttackSide(null);
    setPlayerHP(playerMaxHP);
    setEnemyHP(enemyMaxHP);
    setResult(null);
    setSubmitting(false);
  }

  if (phase === 'lobby') {
    return (
      <main
        className="pixel-page min-h-screen bg-cover bg-center bg-fixed px-4 py-5"
        style={{ backgroundImage: `linear-gradient(180deg, rgba(5, 7, 12, 0.58), rgba(5, 7, 12, 0.86)), url(${ui.backgrounds.battlefield})` }}
      >
        <section className="mx-auto max-w-[1680px]">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <Link href="/dashboard" className="pixel-button-gold px-4 py-3 text-[10px]">Command Center</Link>
            <Image src={ui.logo} alt="SanData" width={430} height={170} priority className="h-auto w-[260px] object-contain sm:w-[360px]" />
            <MusicToggle src={ui.audio.battlefield} label="Battle Music" />
          </div>

          <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
            <aside className="grid gap-5">
              <section className="pixel-panel p-5">
                <div className="mb-4 flex justify-center">
                  <h1 className="pixel-title-ribbon px-7 py-2 text-[12px] leading-6">Battle Gate</h1>
                </div>
                <div className="grid gap-3">
                  <div className="grid grid-cols-[84px_1fr] items-center gap-4 rounded border-2 border-[#0b0610] bg-black/24 p-2 shadow-[0_0_0_2px_rgba(255,212,92,0.18)]">
                    <Image src={avatarImage(activeUser.avatar)} alt="" width={96} height={120} className="battle-lobby-avatar h-24 w-20 object-contain" />
                    <div>
                      <p className="font-pixel text-[13px] leading-6 text-white">{activeUser.username || 'Shield Agent'}</p>
                      <p className="text-sm font-bold text-white/60">{activeUser.rank}</p>
                      <p className="mt-2 text-xs font-black uppercase text-teal">You - {roomRole === 'guest' ? 'Guest Lane' : 'Host Lane'}</p>
                    </div>
                  </div>

                  <div className={cn(
                    'grid grid-cols-[84px_1fr] items-center gap-4 rounded border-2 border-[#0b0610] p-2 shadow-[0_0_0_2px_rgba(255,212,92,0.18)]',
                    ally ? 'bg-[#211329]' : 'bg-black/18 opacity-75',
                  )}>
                    <div className="grid h-24 w-20 place-items-center">
                      {ally ? (
                        <Image src={avatarImage(ally.avatar)} alt="" width={96} height={120} className="battle-lobby-avatar battle-lobby-avatar-ally h-24 w-20 object-contain" />
                      ) : (
                        <span className="grid h-16 w-16 place-items-center border-4 border-[#0b0610] bg-[#2d1544] font-pixel text-2xl text-gold shadow-[0_0_0_2px_#9b6427]">?</span>
                      )}
                    </div>
                    <div>
                      <p className="font-pixel text-[12px] leading-6 text-white">{ally?.username || 'Waiting for Friend'}</p>
                      <p className="text-sm font-bold text-white/60">{ally ? 'Ready in lobby' : 'Share or enter a room code'}</p>
                      <p className="mt-2 text-xs font-black uppercase text-gold">{ally ? '10 separate questions' : 'Friend avatar appears here'}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 grid gap-3">
                  <button type="button" onClick={startFight} className="pixel-button-gold px-5 py-4 text-[12px] leading-5">
                    Play Now
                  </button>
                  <button type="button" onClick={createRoom} className="pixel-button-gold px-5 py-4 text-[12px] leading-5">
                    Join a Friend
                  </button>
                </div>
                <div className={cn(
                  'mt-4 border-2 border-[#0b0610] px-4 py-3 text-sm font-black leading-6 shadow-[0_0_0_2px_#9b6427]',
                  ally ? 'bg-[#173626] text-[#dfffe6]' : 'bg-black/32 text-white/62',
                )}>
                  <span className="font-pixel text-[9px] uppercase leading-5 text-gold">{ally ? 'Friend Joined' : 'Lobby Indicator'}</span>
                  <p>{ally ? `${ally.username} is linked. Enemy HP ${enemyMaxHP}, x${coOpDamageMultiplier} damage, ${coOpQuestionCount} questions each.` : 'Create or join a room to activate co-op battle rules.'}</p>
                </div>
              </section>

              <section className="pixel-panel p-5">
                <h2 className="font-pixel text-[12px] leading-6 text-gold">Friend Code</h2>
                <p className="mt-3 text-sm font-bold leading-6 text-white/62">{roomStatus}</p>
                <div className="mt-4 flex gap-2">
                  <button type="button" onClick={createRoom} className="pixel-button-gold px-4 py-3 text-[10px]">
                    Create
                  </button>
                  <button type="button" onClick={copyRoomCode} disabled={!roomCode} className="grid h-12 w-12 place-items-center border-2 border-[#0b0610] bg-[#241034] text-gold shadow-[0_0_0_2px_#9b6427] disabled:opacity-40" aria-label="Copy room code">
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
                {roomCode ? <div className="mt-4 border-2 border-[#0b0610] bg-black/42 px-4 py-3 font-pixel text-lg text-gold shadow-[0_0_0_2px_#9b6427]">{roomCode}</div> : null}
                <form className="mt-4 grid gap-3" onSubmit={joinRoom}>
                  <input
                    value={joinCode}
                    onChange={(event) => setJoinCode(event.target.value.toUpperCase())}
                    className="border-2 border-[#0b0610] bg-black/42 px-4 py-3 font-pixel text-[11px] text-white outline-none shadow-[0_0_0_2px_#9b6427] placeholder:text-white/35"
                    placeholder="TYPE CODE"
                    maxLength={8}
                  />
                  <button type="submit" className="pixel-button-gold px-5 py-4 text-[11px]">Join Room</button>
                </form>
              </section>
            </aside>

            <section className="pixel-panel p-5">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-pixel text-[11px] uppercase leading-5 text-teal">Choose Your Enemy</p>
                  <h2 className="font-pixel text-2xl leading-10 text-white">Battle Selection</h2>
                </div>
                <div className="pixel-panel-light px-4 py-3 font-pixel text-[10px]">
                  {enemy.name} selected
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {battleEnemies.map((item) => (
                  <EnemyCard
                    key={item.id}
                    coOpActive={coOpActive}
                    enemy={item}
                    maxHP={getBattleEnemyMaxHP(item, coOpActive)}
                    questionCount={coOpActive ? coOpQuestionCount : item.questions.length}
                    selected={item.id === enemy.id}
                    onSelect={() => selectEnemy(item.id)}
                  />
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="pixel-page min-h-screen overflow-hidden bg-cover bg-center px-3 py-4"
      style={{ backgroundImage: `linear-gradient(180deg, rgba(4, 5, 7, 0.18), rgba(4, 5, 7, 0.3)), url(${ui.backgrounds.battlefield})` }}
    >
      <section className="pixel-screen-border relative mx-auto min-h-[calc(100dvh-2rem)] max-w-[1500px] overflow-hidden bg-transparent">
        <audio ref={impactAudioRef} src={ui.audio.impact} preload="auto" />
        <audio ref={hurtAudioRef} src={ui.audio.hurt} preload="auto" />
        <audio ref={victoryAudioRef} src={ui.audio.victory} preload="auto" />
        <audio ref={defeatAudioRef} src={ui.audio.defeat} preload="auto" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.16))]" />
        <div className="relative z-10 grid min-h-[calc(100dvh-2rem)] grid-rows-[auto_1fr_auto] px-3 py-3 sm:px-6">
          <header className="relative grid gap-3 lg:grid-cols-[minmax(0,1fr)_300px_minmax(0,1fr)] lg:items-start">
            <section className="pixel-panel grid grid-cols-[78px_1fr] items-center gap-3 p-2">
              <div className="pixel-panel-light grid h-20 w-20 place-items-center overflow-hidden p-1">
                <Image src={avatarIconImage(activeUser.avatar)} alt="" width={82} height={96} className="h-20 w-auto object-contain" />
              </div>
              <div>
                <h1 className="font-pixel text-base leading-7 text-white">{activeUser.username || 'Shield Agent'}</h1>
                <div className="mt-2">
                  <HealthMeter current={playerHP} max={playerMaxHP} tone="green" />
                </div>
                {ally ? (
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] font-black uppercase text-white/70">
                    <Image src={avatarIconImage(ally.avatar)} alt="" width={28} height={28} className="h-7 w-7 object-contain" />
                    <span>{ally.username} joined</span>
                    <span className="border border-[#ffd45c]/60 bg-[#ffd45c] px-2 py-1 font-pixel text-[7px] leading-3 text-[#241025]">x2 DMG</span>
                  </div>
                ) : null}
              </div>
            </section>

            <div className="grid justify-center justify-items-center">
              <Image src={ui.logo} alt="SanData Quiz Fight" width={320} height={130} priority className="h-auto w-[220px] object-contain sm:w-[270px]" />
              <MusicToggle className="mt-2 scale-90" src={ui.audio.battlefieldFight} label="Battle Music" />
            </div>

            <section className="pixel-panel grid grid-cols-[1fr_82px] items-center gap-3 p-2">
              <div>
                <p className="text-right font-pixel text-[8px] uppercase leading-4 text-gold">Selected Enemy</p>
                <h2 className="text-right font-pixel text-base leading-7 text-white">{enemy.name}</h2>
                <div className="mt-2">
                  <HealthMeter current={enemyHP} max={enemyMaxHP} tone="red" />
                </div>
              </div>
              <div className="pixel-panel-light grid h-20 w-20 place-items-center overflow-hidden p-1">
                <Image src={enemy.image} alt="" width={96} height={96} className="h-20 w-auto scale-x-[-1] object-contain" />
              </div>
            </section>
          </header>

          <section className="relative grid min-h-[300px] items-center py-2 sm:min-h-[330px] lg:min-h-[360px] xl:min-h-[385px]">
            {attackSide ? (
              <div
                className={cn(
                  'battle-impact-frame',
                  attackSide === 'player' ? 'battle-impact-player' : 'battle-impact-enemy',
                )}
                aria-hidden
              >
                <span />
                <span />
                <span />
              </div>
            ) : null}

            <div className="absolute right-2 top-7 hidden w-28 border-4 border-[#0b0610] bg-[#3b185d] px-3 py-4 text-center shadow-[0_0_0_2px_#d89824] xl:block">
              <p className="font-pixel text-[10px] leading-7 text-gold">Think Before You Click!</p>
            </div>

            <div className="absolute left-1/2 top-0 z-20 w-[min(520px,82vw)] -translate-x-1/2 border-4 border-[#0b0610] bg-[#fff1d2] px-4 py-3 text-center text-[#201136] shadow-[0_0_0_2px_#9b6427]">
              <p className="font-pixel text-[9px] leading-5 sm:text-[10px]">{question.questionText}</p>
            </div>

            {ally ? (
              <div className="absolute left-1/2 top-[126px] z-20 w-[min(520px,88vw)] -translate-x-1/2 border-2 border-[#0b0610] bg-[#211329]/94 px-3 py-2 text-center font-pixel text-[8px] leading-4 text-gold shadow-[0_0_0_2px_#9b6427]">
                Your lane {questionIndex + 1}/{questions.length} - {ally.username} has a separate {allyQuestions.length}-question set
              </div>
            ) : null}

            <div className="absolute left-1/2 top-[68px] z-20 w-[min(520px,82vw)] -translate-x-1/2">
              <div className="pixel-panel min-h-14 px-3 py-2 text-center">
                <p className="font-pixel text-[8px] leading-4 text-white/78 sm:text-[9px]">{feedback ? feedback.explanation : question.scenarioSubtitle}</p>
              </div>
            </div>

            <div className="battle-duel-grid mx-auto w-full max-w-3xl xl:max-w-4xl">
              <div className="battle-fighter-slot battle-fighter-slot-player">
                <div className={cn('battle-fighter-stage', ally && 'battle-fighter-stage-coop')}>
                  {ally ? (
                    <Image
                      src={avatarFightingImage(ally.avatar)}
                      alt=""
                      width={300}
                      height={300}
                      priority
                      className={cn(
                        'battle-fighter-sprite battle-fighter-ally',
                        attackSide === 'player' && 'battle-fighter-ally-attack',
                        attackSide === 'enemy' && 'battle-fighter-hit',
                      )}
                    />
                  ) : null}
                  <Image
                    src={avatarFightingImage(activeUser.avatar)}
                    alt=""
                    width={340}
                    height={340}
                    priority
                    className={cn(
                      'battle-fighter-sprite battle-fighter-player',
                      attackSide === 'player' && 'battle-fighter-attack-player',
                      attackSide === 'enemy' && 'battle-fighter-hit',
                    )}
                  />
                </div>
              </div>
              <div className="battle-clash" aria-hidden>
                <span />
                <span />
                <span />
              </div>
              <div className="battle-fighter-slot battle-fighter-slot-enemy">
                <div className="battle-fighter-stage">
                  <Image
                    src={enemy.image}
                    alt=""
                    width={340}
                    height={340}
                    priority
                    className={cn(
                      'battle-fighter-sprite battle-fighter-enemy',
                      attackSide === 'enemy' && 'battle-fighter-attack-enemy',
                      attackSide === 'player' && 'battle-fighter-hit',
                    )}
                  />
                </div>
              </div>
            </div>
          </section>

          <footer className="relative z-30">
            {result ? (
              <section className="pixel-panel mx-auto mb-5 max-w-3xl p-5 text-center">
                <h2 className="font-pixel text-2xl leading-10 text-gold">{result.outcome === 'win' ? 'Victory Secured' : 'Battle Complete'}</h2>
                <p className="mt-2 text-sm font-black text-white/72">Score {result.scorePercent}% - +{result.xpAwarded} Spirit Shards</p>
                {result.newBadges.length ? <p className="mt-2 text-sm font-black text-gold">New badge: {result.newBadges.join(', ')}</p> : null}
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <button type="button" onClick={startFight} className="pixel-button-gold px-4 py-4 text-[10px]">Fight Again</button>
                  <button type="button" onClick={resetToLobby} className="pixel-button-gold px-4 py-4 text-[10px]">Choose Enemy</button>
                  <Link href="/dashboard" className="pixel-button-gold px-4 py-4 text-[10px]">Dashboard</Link>
                </div>
              </section>
            ) : (
              <>
                <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
                  {question.options.map((option, optionIndex) => {
                    let state = 'border-[#0b0610] bg-[#150d1d] text-white';
                    if (selectedAnswer !== null && feedback) {
                      if (optionIndex === feedback.correctIndex) state = 'border-[#0b0610] bg-[#163d23] text-white';
                      else if (optionIndex === selectedAnswer) state = 'border-[#0b0610] bg-[#4a1720] text-white';
                      else state = 'border-[#0b0610] bg-[#150d1d]/72 text-white/48';
                    }
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={selectedAnswer !== null}
                        onClick={() => choose(optionIndex)}
                        className={cn('grid min-h-[72px] grid-cols-[44px_1fr] items-center gap-2 border-4 p-2 text-left shadow-[0_0_0_2px_#9b6427,inset_0_0_0_2px_rgba(255,224,101,0.12)] transition hover:-translate-y-1 disabled:cursor-default', state)}
                      >
                        <span className="grid h-10 w-10 place-items-center border-4 border-[#0b0610] bg-[#5c2587] font-pixel text-xl text-white shadow-[0_0_0_2px_#d89824]">{String.fromCharCode(65 + optionIndex)}.</span>
                        <span className="font-pixel text-[10px] leading-5 sm:text-[11px]">{option}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 grid items-center gap-3 lg:grid-cols-[1fr_auto_1fr]">
                  <Link href="/dashboard" className="pixel-button-gold px-4 py-3 text-center text-[10px]">Command Center</Link>
                  <div className="pixel-panel mx-auto px-6 py-3 font-pixel text-[11px] text-gold">
                    Defend. Think. Protect.
                  </div>
                  {selectedAnswer !== null ? (
                    <button
                      type="button"
                      onClick={continueBattle}
                      disabled={submitting}
                      className="pixel-button-gold px-4 py-3 text-[10px] disabled:opacity-60"
                    >
                      {submitting ? 'Saving Battle' : questionIndex === questions.length - 1 || enemyHP <= 0 || playerHP <= 0 ? 'Finish Battle' : 'Next Strike'}
                    </button>
                  ) : (
                    <button type="button" onClick={resetToLobby} className="pixel-button-gold px-4 py-3 text-[10px]">
                      <RotateCcw className="mr-2 inline h-4 w-4" />
                      Choose Enemy
                    </button>
                  )}
                </div>
              </>
            )}
          </footer>
        </div>
      </section>
    </main>
  );
}
