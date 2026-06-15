'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';
import { avatarImage, ui } from '@/lib/assets';
import { useStore } from '@/store/useStore';

const navItems = [
  { href: '/dashboard', label: 'Command Center', mobileLabel: 'Home', icon: ui.menu.castle },
  { href: '/learn', label: 'Prophecies', mobileLabel: 'Learn', icon: ui.menu.scroll },
  { href: '/missions', label: 'Missions', mobileLabel: 'Missions', icon: ui.menu.swords },
  { href: '/review', label: 'Codex', mobileLabel: 'Codex', icon: ui.menu.book },
  { href: '/profile', label: 'Inventory', mobileLabel: 'Profile', icon: ui.menu.chest },
  { href: '/leaderboard', label: 'Rankings', mobileLabel: 'Ranks', icon: ui.menu.trophy },
  { href: '/battlefield', label: 'Guild Hall', mobileLabel: 'Battle', icon: ui.menu.banner },
  { href: '/profile', label: 'Settings', mobileLabel: 'Settings', icon: ui.menu.settings },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useStore();
  const [collapsed, setCollapsed] = useState(false);
  const currentItem = navItems.find((item) => pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
  const title = currentItem?.label || 'Dashboard';
  const focusedQuiz = pathname.startsWith('/learn/');

  useEffect(() => {
    const saved = localStorage.getItem('sandata-sidebar-collapsed');
    if (saved) setCollapsed(saved === 'true');
  }, []);

  useEffect(() => {
    const width = collapsed ? '5.5rem' : '18rem';
    document.documentElement.style.setProperty('--sandata-sidebar-width', width);
    localStorage.setItem('sandata-sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <>
      <aside
        className={cn(
          'fixed left-0 top-0 z-30 hidden h-screen border-r-4 border-[#07040b] bg-[#160827] p-5 text-white shadow-[10px_0_0_rgba(0,0,0,0.26)] transition-[width] duration-300 lg:block',
          collapsed ? 'w-[5.5rem]' : 'w-72',
        )}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,rgba(123,63,158,0.34),transparent_38%)]" />
        <div className={cn('pixel-shell relative flex min-h-20 items-center p-3', collapsed ? 'justify-center' : 'justify-center')}>
          {collapsed ? (
            <Image src={ui.shieldLogo} alt="SanData" width={64} height={64} className="h-14 w-14 object-contain" priority />
          ) : (
            <Image src={ui.logo} alt="SanData" width={250} height={105} className="h-auto w-full max-w-[230px] object-contain" priority />
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={cn(
            'relative mt-4 grid h-10 place-items-center border-2 border-[#0b0610] bg-[#28123f] text-gold shadow-[0_0_0_2px_#9b6427] transition hover:bg-[#3b185d]',
            collapsed ? 'mx-auto w-10' : 'w-full',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        <nav className="relative mt-8 space-y-3">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  'group relative flex items-center border-2 border-transparent py-3 text-sm font-black transition',
                  collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                  active ? 'border-[#0a050d] bg-gradient-to-r from-[#6e329b] to-[#351158] text-white shadow-[0_0_0_2px_#d89824,inset_0_0_0_2px_rgba(255,224,101,0.18)]' : 'text-white/88 hover:bg-white/10',
                )}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Image src={item.icon} alt="" width={36} height={36} className="h-8 w-8 object-contain drop-shadow" />
                {!collapsed && item.label}
                {!collapsed && active ? <Image src={ui.menu.arrow} alt="" width={34} height={28} className="ml-auto h-7 w-7 object-contain" /> : null}
              </Link>
            );
          })}
        </nav>
        <div className={cn('pixel-panel absolute bottom-24 left-5 right-5 p-4', collapsed && 'p-3')}>
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
            <Image src={ui.shieldLogo} alt="" width={56} height={56} className="h-12 w-12 object-contain" />
            {!collapsed && (
            <div>
              <div className="font-pixel text-[10px] leading-5 text-gold">Shield Rank</div>
              <div className="text-xs font-bold text-white/70">{user?.rank || 'Aspirant'}</div>
            </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'absolute bottom-5 left-5 right-5 flex items-center justify-center border-2 border-white/15 bg-black/24 py-3 text-sm font-bold text-white hover:bg-white/14',
            collapsed ? 'px-0' : 'gap-2 px-4',
          )}
          aria-label={collapsed ? 'Logout' : undefined}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </aside>

      <header className="sticky top-0 z-20 hidden items-center justify-between border-b-4 border-[#08050c] bg-[#0b101b]/88 px-8 py-3 text-white backdrop-blur transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:flex">
        <div>
          <h1 className="font-pixel text-[15px] leading-6 text-gold">{title}</h1>
          <p className="text-sm text-white/70">Welcome back, <span className="font-bold text-white">Shield Agent!</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-10 w-10 place-items-center border-2 border-[#0b0610] bg-[#1d122d] text-white shadow-[0_0_0_2px_#9b6427]" aria-label="Search">
            <Image src={ui.icons.search} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center border-2 border-[#0b0610] bg-[#1d122d] text-white shadow-[0_0_0_2px_#9b6427]" aria-label="Notifications">
            <Image src={ui.icons.bell} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
          </button>
          <Link href="/profile" className="grid h-12 w-12 place-items-end overflow-hidden border-2 border-[#0b0610] bg-[#1d122d] shadow-[0_0_0_2px_#9b6427]">
            <Image src={avatarImage(user?.avatar)} alt="" width={42} height={56} className="h-12 w-9 object-contain object-bottom" priority />
          </Link>
        </div>
      </header>

      <nav className={cn('fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[430px] grid-cols-5 border-t-4 border-[#08050c] bg-[#140823]/95 px-2 py-2 text-white shadow-[0_-14px_30px_rgba(0,0,0,0.32)] backdrop-blur lg:hidden', focusedQuiz ? 'hidden' : 'grid')}>
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href} className={cn('flex flex-col items-center gap-1 px-2 py-2 text-[10px] font-bold', active && 'bg-[#6e329b] text-gold shadow-[0_0_0_2px_#d89824]')}>
              <Image src={item.icon} alt="" width={24} height={24} className="h-7 w-7 object-contain" />
              {item.mobileLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
