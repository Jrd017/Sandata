'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MusicToggleProps {
  className?: string;
  label: string;
  src: string;
}

type VolumeMode = 'low' | 'high';

const volumeLevels: Record<VolumeMode, number> = {
  low: 0.38,
  high: 0.82,
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

export function MusicToggle({ className, label, src }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaSourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [volumeMode, setVolumeMode] = useState<VolumeMode>('high');

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
    if (gainRef.current) gainRef.current.gain.value = volume;
    if (audio) audio.volume = gainRef.current ? 1 : volume;
  }, [volumeMode]);

  function setupEightBitAudio(audio: HTMLAudioElement) {
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
      gain.gain.value = volumeLevels[volumeMode];

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
  }

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = gainRef.current ? 1 : volumeLevels[volumeMode];
    audio.loop = true;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      setupEightBitAudio(audio);
      await audioContextRef.current?.resume();
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className={cn('music-toggle', className)}>
      <audio ref={audioRef} src={src} preload="none" />
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
