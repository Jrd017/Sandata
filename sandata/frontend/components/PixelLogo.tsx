import Image from 'next/image';
import { cn } from '@/lib/cn';
import { ui } from '@/lib/assets';

interface PixelLogoProps {
  compact?: boolean;
  className?: string;
}

export function PixelLogo({ compact = false, className }: PixelLogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <Image
        src={ui.logo}
        alt="SanData"
        width={compact ? 128 : 220}
        height={compact ? 42 : 70}
        priority
        className={compact ? 'h-10 w-32 object-contain object-left' : 'h-auto w-full max-w-[220px] object-contain'}
      />
    </div>
  );
}
