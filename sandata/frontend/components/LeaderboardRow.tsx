import Image from 'next/image';
import { cn } from '@/lib/cn';
import type { LeaderboardEntry } from '@/lib/types';
import { avatarImage } from '@/lib/assets';

interface LeaderboardRowProps {
  entry: LeaderboardEntry;
  active?: boolean;
}

export function LeaderboardRow({ entry, active }: LeaderboardRowProps) {
  return (
    <div className={cn('grid grid-cols-[28px_38px_minmax(0,1fr)_68px] items-center gap-2 rounded-lg border px-3 py-3 sm:grid-cols-[34px_42px_minmax(0,1fr)_auto] sm:gap-3 sm:rounded-xl sm:px-4', active ? 'border-ube-soft bg-ube-deep text-white' : 'border-white/10 bg-white/8 text-white')}>
      <div className="font-pixel text-[11px]">#{entry.rankNumber}</div>
      <div className={cn('grid h-10 w-10 place-items-end overflow-hidden rounded-full border sm:h-11 sm:w-11', active ? 'border-white/40 bg-white/20' : 'border-white/20 bg-white/10')}>
        <Image src={avatarImage(entry.avatar)} alt="" width={40} height={54} className="h-12 w-9 object-contain object-bottom" />
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-bold sm:text-base">{entry.username}</div>
        <div className={cn('truncate text-xs font-semibold', active ? 'text-white/75' : 'text-white/62')}>{entry.rank}</div>
      </div>
      <div className="text-right font-pixel text-[9px] leading-5 sm:text-[10px]">{entry.totalXP.toLocaleString()} Shards</div>
    </div>
  );
}
