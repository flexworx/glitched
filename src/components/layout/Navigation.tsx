'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

const NAV_LINKS = [
  { href: '/arena', label: 'Arena', icon: '⚔️', hasSubmenu: true },
  { href: '/agents', label: 'Agents', icon: '🤖' },
  { href: '/predictions', label: 'Predict', icon: '🎯' },
  { href: '/murph', label: '$MURPH', icon: '💎' },
  { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { href: '/seasons', label: 'Seasons', icon: '📅' },
  { href: '/media', label: 'Media', icon: '🎬' },
];

const ARENA_SUBMENU = [
  { href: '/arena', label: 'Arena Hub', icon: '🏟', desc: 'All matches & schedule' },
  { href: '/redzone', label: 'RedZone', icon: '📺', desc: 'Multi-match live view', badge: 'LIVE' },
  { href: '/big-screen', label: 'Big Screen', icon: '🎬', desc: 'Full-screen spectator' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [arenaMenuOpen, setArenaMenuOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(0);
  const arenaRef = useRef<HTMLDivElement>(null);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  // Fetch live match count for badge
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch('/api/matches?status=RUNNING&limit=1');
        if (!res.ok) return;
        const data = await res.json();
        const total = data.data?.total ?? (data.data?.matches?.length ?? 0);
        setLiveCount(typeof total === 'number' ? total : 0);
      } catch { /* silently fail */ }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, []);

  // Close arena submenu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (arenaRef.current && !arenaRef.current.contains(e.target as Node)) {
        setArenaMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const isArenaActive = pathname.startsWith('/arena') || pathname.startsWith('/redzone') || pathname.startsWith('/big-screen');

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
            <span className="text-[#00ff88] font-black text-sm">G</span>
          </div>
          <span className="font-black text-white font-space-grotesk text-lg group-hover:text-[#00ff88] transition-colors">
            GLITCHED<span className="text-[#00ff88]">.gg</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => {
            if (link.hasSubmenu) {
              return (
                <div key={link.href} ref={arenaRef} className="relative">
                  <button
                    onMouseEnter={() => {
                      if (closeTimer.current) clearTimeout(closeTimer.current);
                      setArenaMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      closeTimer.current = setTimeout(() => setArenaMenuOpen(false), 200);
                    }}
                    onClick={() => setArenaMenuOpen(o => !o)}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                      isArenaActive ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white hover:bg-white/5',
                    ].join(' ')}>
                    <span className="text-xs">{link.icon}</span>
                    {link.label}
                    {liveCount > 0 && (
                      <span className="flex items-center gap-0.5 px-1.5 py-0.5 bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-[9px] font-black rounded-full ml-1">
                        <span className="w-1 h-1 rounded-full bg-[#ff3366] animate-pulse" />{liveCount}
                      </span>
                    )}
                    <svg className={`w-3 h-3 ml-0.5 transition-transform ${arenaMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Arena submenu */}
                  {arenaMenuOpen && (
                    <div
                      className="absolute top-full left-0 mt-1 w-56 bg-[#0d0d1a] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50"
                      onMouseEnter={() => { if (closeTimer.current) clearTimeout(closeTimer.current); }}
                      onMouseLeave={() => { closeTimer.current = setTimeout(() => setArenaMenuOpen(false), 200); }}>
                      {ARENA_SUBMENU.map(item => (
                        <Link key={item.href} href={item.href}
                          onClick={() => setArenaMenuOpen(false)}
                          className={[
                            'flex items-center gap-3 px-4 py-3 transition-all hover:bg-white/5',
                            pathname === item.href || (item.href !== '/arena' && pathname.startsWith(item.href))
                              ? 'bg-[#00ff88]/5 border-l-2 border-[#00ff88]'
                              : 'border-l-2 border-transparent',
                          ].join(' ')}>
                          <span className="text-base">{item.icon}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-white">{item.label}</span>
                              {item.badge && liveCount > 0 && (
                                <span className="px-1.5 py-0.5 bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-[9px] font-black rounded-full">{item.badge}</span>
                              )}
                            </div>
                            <p className="text-[11px] text-white/30 truncate">{item.desc}</p>
                          </div>
                        </Link>
                      ))}
                      {/* Live match quick links */}
                      {liveCount > 0 && (
                        <div className="border-t border-white/5 px-4 py-2">
                          <p className="text-[10px] text-[#ff3366] font-black uppercase tracking-widest mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#ff3366] inline-block mr-1 animate-pulse" />
                            {liveCount} match{liveCount !== 1 ? 'es' : ''} live now
                          </p>
                          <Link href="/redzone" onClick={() => setArenaMenuOpen(false)}
                            className="block text-[11px] text-white/40 hover:text-[#00ff88] transition-colors">
                            Watch in RedZone →
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            }
            return (
              <Link key={link.href} href={link.href}
                className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith(link.href) ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white hover:bg-white/5'].join(' ')}>
                <span className="text-xs">{link.icon}</span>
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Live indicator — always visible when matches are running */}
          {liveCount > 0 && (
            <Link href="/redzone"
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-[#ff3366]/10 border border-[#ff3366]/30 text-[#ff3366] text-xs font-black rounded-lg hover:bg-[#ff3366]/20 transition-all animate-pulse">
              ● {liveCount} LIVE
            </Link>
          )}
          <Link href="/soul-forge"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-lg hover:bg-[#8b5cf6]/20 transition-all">
            + Build Agent
          </Link>
          <Link href="/admin"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-white/50 text-xs rounded-lg hover:text-white transition-all">
            Admin
          </Link>

          {/* Mobile menu button */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 text-white/50 hover:text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-4 py-3 space-y-1">
          {/* Arena section with sub-items */}
          <div className="space-y-1">
            <p className="px-3 pt-1 pb-0.5 text-[10px] text-white/20 uppercase tracking-widest font-bold">Arena</p>
            {ARENA_SUBMENU.map(item => (
              <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
                className={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname === item.href ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white'].join(' ')}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && liveCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-[9px] font-black rounded-full ml-auto">{item.badge}</span>
                )}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/5 pt-2 space-y-1">
            {NAV_LINKS.filter(l => !l.hasSubmenu).map(link => (
              <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
                className={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  pathname.startsWith(link.href) ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white'].join(' ')}>
                <span>{link.icon}</span>{link.label}
              </Link>
            ))}
          </div>
          <div className="border-t border-white/5 pt-2 space-y-1">
            <Link href="/soul-forge" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold rounded-lg">
              + Build Agent
            </Link>
            <Link href="/admin" onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 bg-white/5 text-white/50 text-sm rounded-lg">
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
export default Navigation;
