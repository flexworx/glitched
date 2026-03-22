'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';
import { Menu, X } from 'lucide-react';
import { Header } from '@/components/layout/Header';

const LINKS = [
  { href: '/dashboard',              label: 'Overview',     icon: '📊', exact: true },
  { href: '/dashboard/my-agents',    label: 'My Agents',    icon: '🤖' },
  { href: '/dashboard/wallet',       label: 'Wallet',       icon: '💎' },
  { href: '/dashboard/predictions',  label: 'Predictions',  icon: '🎯' },
  { href: '/dashboard/achievements', label: 'Achievements', icon: '🏆' },
  { href: '/dashboard/fantasy',      label: 'Fantasy',      icon: '⚔️' },
  { href: '/dashboard/translator',   label: 'Translator',   icon: '🔮' },
  { href: '/dashboard/training',     label: 'Training',     icon: '📚' },
];

function SidebarLinks({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="p-3 space-y-0.5">
      {LINKS.map(link => {
        const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className={[
              'flex items-center gap-2.5 px-3 py-3 rounded-lg text-sm font-medium transition-all min-h-[44px]',
              active
                ? 'bg-[#00ff88]/10 text-[#00ff88]'
                : 'text-white/50 hover:text-white hover:bg-white/5',
            ].join(' ')}
          >
            <span className="text-base" aria-hidden="true">{link.icon}</span>
            {link.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      <Header />

      {/* ── Mobile: drawer toggle bar ── */}
      <div className="md:hidden fixed top-16 left-0 right-0 z-40 bg-[#0d0d1a] border-b border-white/5 px-4 py-2 flex items-center gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm text-white/60 hover:text-white py-1 px-2 rounded-lg hover:bg-white/5 transition-all"
          aria-label="Open dashboard menu"
        >
          <Menu className="w-4 h-4" />
          <span>Menu</span>
        </button>
        {/* Breadcrumb: show current section */}
        <span className="text-white/30">›</span>
        <span className="text-sm text-white/70 font-medium">
          {LINKS.find(l => l.exact ? pathname === l.href : pathname.startsWith(l.href))?.label ?? 'Dashboard'}
        </span>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" onClick={() => setDrawerOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          <aside
            className="relative w-64 bg-[#0d0d1a] border-r border-white/5 h-full z-10 overflow-y-auto pt-4"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 pb-3 border-b border-white/5">
              <span className="text-sm font-semibold text-white/70">Dashboard</span>
              <button onClick={() => setDrawerOpen(false)} className="p-1 text-white/40 hover:text-white rounded" aria-label="Close menu">
                <X className="w-4 h-4" />
              </button>
            </div>
            <SidebarLinks pathname={pathname} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop layout ── */}
      <div className="flex pt-16">
        {/* Desktop sidebar */}
        <aside className="hidden md:block w-52 bg-[#0d0d1a] border-r border-white/5 fixed top-16 bottom-0 left-0 z-30 overflow-y-auto scroll-smooth-ios">
          <SidebarLinks pathname={pathname} />
        </aside>

        {/* Main content — extra top padding on mobile for the drawer toggle bar */}
        <main className="flex-1 md:ml-52 p-4 md:p-8 pt-12 md:pt-8">
          {children}
        </main>
      </div>
    </div>
  );
}
