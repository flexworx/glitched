'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid, Play, Cpu, Coins, Shield, Users, Server, Trophy, Film, Menu, X, Gamepad2,
} from 'lucide-react';

const ADMIN_NAV = [
  { href: '/admin',             label: 'Dashboard',  Icon: LayoutGrid },
  { href: '/admin/matches',     label: 'Matches',    Icon: Play },
  { href: '/admin/agents',      label: 'Agents',     Icon: Cpu },
  { href: '/admin/economy',     label: 'Economy',    Icon: Coins },
  { href: '/admin/moderation',  label: 'Moderation', Icon: Shield },
  { href: '/admin/users',       label: 'Users',      Icon: Users },
  { href: '/admin/system',      label: 'System',     Icon: Server },
  { href: '/admin/seasons',     label: 'Seasons',    Icon: Trophy },
  { href: '/admin/vault',       label: 'Game Vault', Icon: Gamepad2 },
  { href: '/admin/media',       label: 'Media',      Icon: Film },
];

function SidebarContent({ pathname, onClose }: { pathname: string; onClose?: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-4 border-b border-arena-border flex items-center justify-between">
        <div>
          <div className="font-orbitron text-sm text-neon-green uppercase tracking-widest">GLITCHED</div>
          <div className="font-orbitron text-xs text-purple-400 uppercase tracking-wider">Admin Panel</div>
        </div>
        {onClose && (
          <button onClick={onClose} className="md:hidden p-1 text-white/40 hover:text-white" aria-label="Close menu">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
      <nav className="flex-1 py-4 overflow-y-auto scroll-smooth-ios">
        {ADMIN_NAV.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                'flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all',
                'min-h-[44px]', // touch target
                active
                  ? 'text-neon-green bg-neon-green/10 border-r-2 border-neon-green'
                  : 'text-gray-400 hover:text-neon-green hover:bg-neon-green/5',
              ].join(' ')}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="px-4 py-4 border-t border-arena-border">
        <div className="text-xs text-gray-600 font-jetbrains">Admin v1.0.0</div>
      </div>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen bg-arena-black">
      {/* ── Mobile top bar ── */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-arena-dark border-b border-arena-border flex items-center px-4 gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="p-2 text-white/60 hover:text-white rounded-lg"
          aria-label="Open admin menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="font-orbitron text-sm text-neon-green uppercase tracking-widest">Admin Panel</div>
      </div>

      {/* ── Mobile drawer overlay ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex"
          onClick={() => setDrawerOpen(false)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden="true" />
          {/* Drawer */}
          <aside
            className="relative w-64 bg-arena-dark border-r border-arena-border flex-shrink-0 h-full z-10"
            onClick={e => e.stopPropagation()}
          >
            <SidebarContent pathname={pathname} onClose={() => setDrawerOpen(false)} />
          </aside>
        </div>
      )}

      {/* ── Desktop layout ── */}
      <div className="flex">
        {/* Desktop sidebar — always visible on md+ */}
        <aside className="hidden md:flex w-56 bg-arena-dark border-r border-arena-border flex-shrink-0 flex-col fixed top-0 bottom-0 left-0 z-40">
          <SidebarContent pathname={pathname} />
        </aside>

        {/* Main content */}
        <main className="flex-1 md:ml-56 pt-14 md:pt-0 overflow-auto min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
