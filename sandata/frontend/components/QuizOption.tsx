import { Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';

type OptionState = 'idle' | 'selected' | 'correct' | 'incorrect' | 'disabled';

interface QuizOptionProps {
  letter: string;
  text: string;
  state: OptionState;
  onClick: () => void;
  disabled?: boolean;
}

export function QuizOption({ letter, text, state, onClick, disabled }: QuizOptionProps) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'flex min-h-12 w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-xs font-bold transition',
        state === 'idle' && 'border-ube-soft/30 bg-white text-ube-royal hover:border-ube-soft hover:bg-lavender',
        state === 'selected' && 'border-ube-deep bg-lavender text-ube-royal',
        state === 'correct' && 'border-green-500 bg-green-100 text-green-800',
        state === 'incorrect' && 'border-red-500 bg-red-100 text-red-800',
        state === 'disabled' && 'border-white/10 bg-white/40 text-slate-dark/70',
      )}
    >
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-current font-pixel text-[10px]">
        {letter}
      </span>
      <span className="min-w-0 flex-1 leading-5">{text}</span>
      {state === 'correct' ? <Check className="h-5 w-5 shrink-0" /> : null}
      {state === 'incorrect' ? <X className="h-5 w-5 shrink-0" /> : null}
    </button>
  );
}
