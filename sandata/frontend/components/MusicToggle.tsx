'use client';

import { useEffect, useRef, useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/cn';

interface MusicToggleProps {
  className?: string;
  label: string;
  src: string;
}

export function MusicToggle({ className, label, src }: MusicToggleProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    return () => {
      audio?.pause();
    };
  }, []);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = 0.22;
    audio.loop = true;

    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }

    try {
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <div className={className}>
      <audio ref={audioRef} src={src} preload="none" />
      <button
        type="button"
        onClick={toggle}
        className={cn(
          'inline-flex h-10 items-center gap-2 rounded-lg border border-white/20 bg-white/90 px-3 text-xs font-bold text-ube-royal shadow-sm transition hover:-translate-y-0.5 hover:bg-white',
          playing && 'bg-ube-deep text-white hover:bg-ube-deep',
        )}
        aria-pressed={playing}
      >
        {playing ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        {label}
      </button>
    </div>
  );
}
