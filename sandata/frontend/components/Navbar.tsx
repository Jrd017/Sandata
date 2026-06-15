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
  { href: '/dashboard', label: 'Dashboard', mobileLabel: 'Home', icon: ui.nav.home },
  { href: '/learn', label: 'Prophecies', mobileLabel: 'Learn', icon: ui.nav.learn },
  { href: '/missions', label: 'Daily Missions', mobileLabel: 'Missions', icon: ui.nav.missions },
  { href: '/leaderboard', label: 'Leaderboard', mobileLabel: 'Leaderboard', icon: ui.nav.leaderboard },
  { href: '/profile', label: 'Profile', mobileLabel: 'Profile', icon: ui.nav.profile },
  { href: '/battlefield', label: 'Battlefield', mobileLabel: 'Battle', icon: ui.icons.shield },
  { href: '/review', label: 'Flashcards', mobileLabel: 'Review', icon: ui.icons.book },
  { href: '/profile', label: 'Settings', mobileLabel: 'Settings', icon: ui.icons.settings },
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
    const width = collapsed ? '5.5rem' : '16rem';
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
          'fixed left-0 top-0 z-30 hidden h-screen bg-gradient-to-b from-[#2b135e] to-[#170a38] p-5 text-white transition-[width] duration-300 lg:block',
          collapsed ? 'w-[5.5rem]' : 'w-64',
        )}
      >
        <div className={cn('flex items-center rounded-xl bg-white/8 p-2', collapsed ? 'justify-center' : 'gap-3')}>
          {collapsed ? (
            <Image src={ui.icons.sandataShield} alt="SanData" width={48} height={56} className="h-12 w-12 object-contain" priority />
          ) : (
            <Image src={ui.logo} alt="SanData" width={188} height={60} className="h-auto w-[188px] object-contain object-left" priority />
          )}
        </div>
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          className={cn(
            'mt-4 grid h-10 place-items-center rounded-xl border border-white/12 bg-white/8 text-white transition hover:bg-white/14',
            collapsed ? 'mx-auto w-10' : 'w-full',
          )}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>
        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={`${item.label}-${item.href}`}
                href={item.href}
                className={cn(
                  'flex items-center rounded-xl py-3 text-sm font-bold transition',
                  collapsed ? 'justify-center px-0' : 'gap-3 px-4',
                  active ? 'bg-gradient-to-r from-ube-deep to-ube-soft text-white shadow-[0_10px_24px_rgba(0,0,0,0.18)]' : 'text-white/88 hover:bg-white/10',
                )}
                aria-label={collapsed ? item.label : undefined}
                title={collapsed ? item.label : undefined}
              >
                <Image src={item.icon} alt="" width={24} height={24} className="h-6 w-6 object-contain" />
                {!collapsed && item.label}
              </Link>
            );
          })}
        </nav>
        <div className={cn('absolute bottom-24 left-5 right-5 rounded-xl border border-white/10 bg-white/10 p-4', collapsed && 'p-3')}>
          <div className={cn('flex items-center', collapsed ? 'justify-center' : 'gap-3')}>
            <Image src={ui.icons.shield} alt="" width={42} height={42} className="h-10 w-10 object-contain" />
            {!collapsed && (
            <div>
              <div className="font-pixel text-[10px] leading-5">Shield Rank</div>
              <div className="text-xs text-white/70">{user?.rank || 'Aspirant'}</div>
            </div>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'absolute bottom-5 left-5 right-5 flex items-center justify-center rounded-xl border border-white/15 bg-white/8 py-3 text-sm font-bold text-white hover:bg-white/14',
            collapsed ? 'px-0' : 'gap-2 px-4',
          )}
          aria-label={collapsed ? 'Logout' : undefined}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && 'Logout'}
        </button>
      </aside>

      <header className="sticky top-0 z-20 hidden items-center justify-between border-b border-ube-soft/15 bg-white/80 px-8 py-3 text-ube-royal backdrop-blur transition-[margin-left] duration-300 lg:ml-[var(--sandata-sidebar-width)] lg:flex">
        <div>
          <h1 className="font-pixel text-[15px] leading-6 text-[#211044]">{title}</h1>
          <p className="text-sm text-slate-dark">Welcome back, <span className="font-bold">Shield Agent!</span></p>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ube-royal shadow-sm" aria-label="Search">
            <Image src={ui.icons.search} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
          </button>
          <button type="button" className="grid h-10 w-10 place-items-center rounded-xl bg-white text-ube-royal shadow-sm" aria-label="Notifications">
            <Image src={ui.icons.bell} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
          </button>
          <Link href="/profile" className="grid h-11 w-11 place-items-end overflow-hidden rounded-full border border-ube-soft/25 bg-lavender">
            <Image src={avatarImage(user?.avatar)} alt="" width={42} height={56} className="h-12 w-9 object-contain object-bottom" priority />
          </Link>
        </div>
      </header>

      <nav className={cn('fixed bottom-0 left-0 right-0 z-30 mx-auto max-w-[390px] grid-cols-5 border-t border-ube-soft/25 bg-white/95 px-2 py-2 text-ube-royal shadow-[0_-14px_30px_rgba(60,33,119,0.08)] backdrop-blur lg:hidden', focusedQuiz ? 'hidden' : 'grid')}>
        {navItems.slice(0, 5).map((item) => {
          const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href} className={cn('flex flex-col items-center gap-1 rounded-lg px-2 py-2 text-[11px] font-bold', active && 'bg-lavender text-ube-deep')}>
              <Image src={item.icon} alt="" width={22} height={22} className="h-6 w-6 object-contain" />
              {item.mobileLabel}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
