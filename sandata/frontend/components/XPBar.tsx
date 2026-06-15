import { cn } from '@/lib/cn';

interface XPBarProps {
  value: number;
  max?: number;
  label?: string;
  level?: number;
  className?: string;
}

export function XPBar({ value, max = 100, label, level, className }: XPBarProps) {
  const percent = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div className={cn('w-full', className)}>
      <div className="mb-2 flex items-center justify-between gap-3 text-xs text-ube-royal/75">
        <span className="font-pixel text-[9px] leading-5">{level ? `Level ${level}` : label}</span>
        <span className="text-[11px] font-bold">{value.toLocaleString()} / {max.toLocaleString()} Spirit Shards</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-[#ded2ea]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold via-mango to-ube-soft"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
