'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Swords, Target, Gem, Trophy, Plus } from 'lucide-react';

const BOTTOM_NAV = [
  { href: '/',            label: 'Home',    Icon: Home },
  { href: '/arena',       label: 'Arena',   Icon: Swords },
  { href: '/predictions', label: 'Predict', Icon: Target },
  { href: '/murph',       label: '$MURPH',  Icon: Gem },
  { href: '/leaderboards',label: 'Ranks',   Icon: Trophy },
];

/**
 * Global mobile bottom navigation bar.
 * - Fixed to the bottom of the viewport on mobile (hidden md:hidden)
 * - Uses env(safe-area-inset-bottom) to avoid iPhone home indicator overlap
 * - Rendered in the root layout so every page gets it automatically
 */
export function MobileNav() {
  const pathname = usePathname();

  // Don't render on admin or dashboard routes (they have their own sidebar nav)
  if (pathname.startsWith('/admin') || pathname.startsWith('/dashboard')) return null;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
      aria-label="Mobile navigation"
    >
      <div className="flex">
        {BOTTOM_NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={[
                'flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium',
                'transition-colors touch-manipulation select-none',
                'min-h-[52px]', // ≥44pt touch target
                active ? 'text-[#00ff88]' : 'text-white/40 active:text-white/70',
              ].join(' ')}
              aria-current={active ? 'page' : undefined}
            >
              <Icon
                className={['w-5 h-5 transition-transform', active ? 'scale-110' : ''].join(' ')}
                strokeWidth={active ? 2.5 : 1.5}
                aria-hidden="true"
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileNav;
