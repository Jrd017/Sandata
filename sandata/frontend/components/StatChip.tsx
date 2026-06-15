import type { ReactNode } from 'react';
import Image from 'next/image';

interface StatChipProps {
  icon: ReactNode | string;
  value: string | number;
  label: string;
}

export function StatChip({ icon, value, label }: StatChipProps) {
  return (
    <div className="flex min-w-0 flex-col items-center justify-center rounded-xl border border-ube-soft/25 bg-white/80 px-3 py-3 text-center text-ube-royal shadow-sm">
      <div className="grid h-9 w-9 shrink-0 place-items-center">
        {typeof icon === 'string' ? <Image src={icon} alt="" width={34} height={34} className="h-8 w-8 object-contain" /> : icon}
      </div>
      <div className="min-w-0">
        <div className="mt-1 truncate font-pixel text-[10px] leading-5 text-[#211044]">{value}</div>
        <div className="truncate text-[11px] font-semibold text-slate-dark">{label}</div>
      </div>
    </div>
  );
}
