import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/cn';
import type { Difficulty } from '@/lib/types';
import { categoryImage } from '@/lib/assets';

interface ModuleCardProps {
  id?: string;
  title: string;
  subtitle: string;
  icon: string;
  progress: number;
  difficulty: Difficulty;
  accentClass?: string;
  href?: string;
}

const difficultyTone: Record<Difficulty, string> = {
  beginner: 'bg-mint text-ube-royal',
  popular: 'bg-mango text-ube-royal',
  advanced: 'bg-pink-light text-ube-royal',
};

export function ModuleCard({ title, subtitle, icon, progress, difficulty, accentClass = 'bg-lavender', href }: ModuleCardProps) {
  const content = (
    <div className="group flex h-full min-h-[196px] flex-col rounded-lg border border-ube-soft/25 bg-white/90 p-3 text-ube-royal shadow-[0_10px_30px_rgba(60,33,119,0.08)] transition hover:-translate-y-0.5 hover:shadow-glow">
      <div className="flex items-start justify-between gap-3">
        <div className={cn('grid h-20 w-20 place-items-center overflow-hidden rounded-lg border border-ube-royal/10', accentClass)}>
          <Image src={categoryImage(icon)} alt="" width={110} height={120} className="h-24 w-24 object-cover object-top" />
        </div>
        <span className={cn('rounded-full px-3 py-1 text-[11px] font-bold capitalize', difficultyTone[difficulty])}>
          {difficulty}
        </span>
      </div>
      <div className="mt-4 flex-1">
        <h3 className="font-pixel text-[10px] leading-5">{title}</h3>
        <p className="mt-2 text-sm font-semibold text-slate-dark">{subtitle}</p>
      </div>
      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-dark">
          <span>{progress}%</span>
          {href ? <span className="text-lg leading-none text-ube-deep transition group-hover:translate-x-1">-&gt;</span> : null}
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-lavender">
          <div className="h-full rounded-full bg-gradient-to-r from-teal to-ube-soft" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
      </div>
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}
