import Image from 'next/image';
import type { Mission } from '@/lib/types';
import { ui } from '@/lib/assets';

export function MissionCard({ mission }: { mission: Mission }) {
  const progress = Math.min(100, Math.round((mission.progress / mission.target) * 100));
  const icon = mission.id.includes('complete') ? ui.icons.shield : mission.id.includes('quiz') ? ui.icons.gift : ui.icons.lightning;

  return (
    <div className="rounded-lg border border-ube-soft/25 bg-white/90 p-4 text-ube-royal shadow-[0_10px_28px_rgba(60,33,119,0.08)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 gap-3">
          <Image src={icon} alt="" width={32} height={32} className="h-8 w-8 object-contain" />
          <div className="min-w-0">
          <h3 className="text-sm font-bold leading-5 text-[#211044]">{mission.label}</h3>
          <p className="mt-1 text-sm font-semibold text-slate-dark">{mission.progress} / {mission.target}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-cream px-3 py-1 font-pixel text-[9px] text-ube-royal">
          +{mission.xp} Essence
        </div>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#ded2ea]">
        <div className="h-full rounded-full bg-[#73c151]" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
