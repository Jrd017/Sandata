'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MusicToggleProps {
  autoPlay?: boolean;
  className?: string;
  defaultVolume?: VolumeMode;
  label: string;
  src: string;
}

type VolumeMode = 'low' | 'high';

const volumeLevels: Record<VolumeMode, number> = {
  low: 0.52,
  high: 1,
};

function createEightBitCurve(bits = 5) {
  const length = 4096;
  const curve = new Float32Array(length);
  const levels = 2 ** bits;

  for (let index = 0; index < length; index += 1) {
    const x = (index / (length - 1)) * 2 - 1;
    curve[index] = Math.round(x * levels) / levels;
  }

  return curve;
}

export function MusicToggle({ autoPlay = true, className, defaultVolume = 'high', label, src }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volumeMode, setVolumeMode] = useState<VolumeMode>(defaultVolume);
  const volumeModeRef = useRef<VolumeMode>(defaultVolume);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
      audioContextRef.current?.close().catch(() => undefined);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const volume = volumeLevels[volumeMode];
    volumeModeRef.current = volumeMode;
    if (gainRef.current) gainRef.current.gain.value = volume;
    if (audio) audio.volume = gainRef.current ? 1 : volume;
  }, [volumeMode]);

  const setupEightBitAudio = useCallback((audio: HTMLAudioElement) => {
    if (typeof window === 'undefined') return;
    const AudioContextConstructor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextConstructor) return;

    if (!audioContextRef.current) {
      const context = new AudioContextConstructor();
      const source = context.createMediaElementSource(audio);
      const bitCrusher = context.createWaveShaper();
      const lowPass = context.createBiquadFilter();
      const gain = context.createGain();

      bitCrusher.curve = createEightBitCurve();
      bitCrusher.oversample = 'none';
      lowPass.type = 'lowpass';
      lowPass.frequency.value = 6200;
      lowPass.Q.value = 0.7;
      gain.gain.value = volumeLevels[volumeModeRef.current];

      source.connect(bitCrusher);
      bitCrusher.connect(lowPass);
      lowPass.connect(gain);
      gain.connect(context.destination);

      audioContextRef.current = context;
      mediaSourceRef.current = source;
      gainRef.current = gain;
      audio.volume = 1;
      return;
    }

    audioContextRef.current.resume().catch(() => undefined);
  }, []);

  const playAudio = useCallback(async (enhance = false) => {
    const audio = audioRef.current;
    if (!audio) return false;

    audio.volume = gainRef.current ? 1 : volumeLevels[volumeModeRef.current];
    audio.loop = true;

    try {
      if (enhance) setupEightBitAudio(audio);
      await audioContextRef.current?.resume();
      await audio.play();
      setPlaying(true);
      return true;
    } catch {
      setPlaying(false);
      return false;
    }
  }, [setupEightBitAudio]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return undefined;

    audio.loop = true;
    audio.volume = gainRef.current ? 1 : volumeLevels[volumeModeRef.current];
    setPlaying(false);

    if (!autoPlay) return undefined;

    let cancelled = false;
    const retry = () => {
      if (!cancelled) void playAudio(true);
    };

    void playAudio(false).then((started) => {
      if (started || cancelled || typeof window === 'undefined') return;
      window.addEventListener('pointerdown', retry, { once: true });
      window.addEventListener('mousedown', retry, { once: true });
      window.addEventListener('click', retry, { once: true });
      window.addEventListener('touchstart', retry, { once: true });
      window.addEventListener('keydown', retry, { once: true });
    });

    return () => {
      cancelled = true;
      audio.pause();
      window.removeEventListener('pointerdown', retry);
      window.removeEventListener('mousedown', retry);
      window.removeEventListener('click', retry);
      window.removeEventListener('touchstart', retry);
      window.removeEventListener('keydown', retry);
    };
  }, [autoPlay, playAudio, src]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    await playAudio(true);
  }

  return (
    <div className={cn('music-toggle', className)}>
      <audio
        ref={audioRef}
        src={src}
        autoPlay={autoPlay}
        loop
        muted={false}
        preload="auto"
        onPause={() => setPlaying(false)}
        onPlay={() => setPlaying(true)}
      />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'music-toggle-main inline-flex h-10 items-center gap-2 px-3 text-xs font-bold transition hover:-translate-y-0.5',
          playing && 'music-toggle-main-active',
        )}
        aria-pressed={playing}
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {label}
      </button>
      <div className="music-volume-switch" aria-label="Music volume">
        {(['low', 'high'] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setVolumeMode(mode)}
            className={cn('music-volume-option', volumeMode === mode && 'music-volume-option-active')}
            aria-pressed={volumeMode === mode}
          >
            {mode === 'low' ? 'Low' : 'High'}
          </button>
        ))}
      </div>
    </div>
  );
}
