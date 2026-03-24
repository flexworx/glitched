'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

const NAV_LINKS = [
  { href: '/arena', label: 'Arena', icon: '⚔️' },
  { href: '/agents', label: 'Agents', icon: '🤖' },
  { href: '/predictions', label: 'Predict', icon: '🎯' },
  { href: '/murph', label: '$MURPH', icon: '💎' },
  { href: '/leaderboard', label: 'Ranks', icon: '🏆' },
  { href: '/seasons', label: 'Seasons', icon: '📅' },
  { href: '/media', label: 'Media', icon: '🎬' },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
            <span className="text-[#00ff88] font-black text-sm">G</span>
          </div>
          <span className="font-black text-white font-space-grotesk text-lg group-hover:text-[#00ff88] transition-colors">
            GLITCHED<span className="text-[#00ff88]">.gg</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href}
              className={['flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                pathname.startsWith(link.href) ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white hover:bg-white/5'].join(' ')}>
              <span className="text-xs">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
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
          {NAV_LINKS.map(link => (
            <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)}
              className={['flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                pathname.startsWith(link.href) ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white'].join(' ')}>
              <span>{link.icon}</span>{link.label}
            </Link>
          ))}
          <Link href="/soul-forge" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6]/10 text-[#8b5cf6] text-sm font-bold rounded-lg">
            + Build Agent
          </Link>
        </div>
      )}
    </nav>
  );
}
export default Navigation;
