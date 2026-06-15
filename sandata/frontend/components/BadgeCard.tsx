import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ui } from '@/lib/assets';

interface BadgeCardProps {
  name: string;
  description: string;
  unlocked: boolean;
  color: string;
  image?: string;
}

export function BadgeCard({ name, description, unlocked, image }: BadgeCardProps) {
  return (
    <div className={cn('group relative rounded-xl border p-3 text-center transition', unlocked ? 'border-ube-soft/30 bg-white text-ube-royal shadow-sm' : 'border-ube-soft/10 bg-white/45 text-ube-royal/45 grayscale')}>
      <Image src={image || ui.badges.phishing} alt="" width={70} height={90} className="mx-auto h-20 w-16 object-contain" />
      <h3 className="mt-2 font-pixel text-[9px] leading-4">{name}</h3>
      <div className="pointer-events-none absolute left-1/2 top-3 z-10 w-48 -translate-x-1/2 -translate-y-full rounded-lg bg-ube-royal px-3 py-2 text-xs font-semibold text-white opacity-0 shadow-lg transition group-hover:opacity-100">
        {description}
      </div>
    </div>
  );
}
