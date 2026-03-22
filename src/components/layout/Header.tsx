'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useWallet } from '@/hooks/useWallet';
import { Menu, X, Zap } from 'lucide-react';

const NAV = [
  { href: '/arena',        label: 'Arena' },
  { href: '/agents',       label: 'Agents' },
  { href: '/predictions',  label: 'Predict' },
  { href: '/murph',        label: '$MURPH' },
  { href: '/leaderboards', label: 'Ranks' },
  { href: '/seasons',      label: 'Seasons' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { wallet, connect, disconnect } = useWallet();

  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5"
        style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}
      >
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group min-h-[44px]">
            <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center flex-shrink-0">
              <span className="text-[#0a0a0f] font-black text-sm">G</span>
            </div>
            <span className="font-black text-xl font-space-grotesk text-white group-hover:text-[#00ff88] transition-colors">
              GLITCHED<span className="text-[#00ff88]">.gg</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Main navigation">
            {NAV.map(l => {
              const active = l.href !== '/' && pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={[
                    'px-3 py-2 text-sm rounded-lg transition-all min-h-[44px] flex items-center',
                    active ? 'text-[#00ff88] bg-[#00ff88]/10' : 'text-white/60 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* LIVE badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs text-red-400 font-medium">LIVE</span>
            </div>

            {/* Wallet button */}
            {wallet.connected ? (
              <button
                onClick={disconnect}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-xs sm:text-sm text-[#00ff88] hover:bg-[#00ff88]/20 transition-all min-h-[44px] touch-manipulation"
              >
                <Zap className="w-3 h-3 flex-shrink-0" />
                <span className="font-mono hidden sm:inline">{wallet.address?.slice(0,4)}...{wallet.address?.slice(-4)}</span>
                <span className="hidden sm:inline text-white/40">|</span>
                <span className="text-xs">{wallet.murphBalance.toLocaleString()}</span>
                <span className="hidden sm:inline text-xs">$M</span>
              </button>
            ) : (
              <button
                onClick={connect}
                className="px-3 sm:px-4 py-1.5 bg-[#00ff88] text-[#0a0a0f] font-bold text-xs sm:text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all min-h-[44px] touch-manipulation whitespace-nowrap"
              >
                Connect
              </button>
            )}

            {/* Hamburger — mobile only */}
            <button
              className="md:hidden p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/5 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
              onClick={() => setOpen(!open)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {open && (
        <div
          id="mobile-menu"
          className="md:hidden fixed inset-0 z-40 flex flex-col"
          style={{ paddingTop: 'calc(64px + env(safe-area-inset-top, 0px))' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          {/* Menu panel */}
          <div className="relative bg-[#0a0a0f] border-b border-white/5 px-4 py-4 space-y-1 z-10">
            {NAV.map(l => {
              const active = l.href !== '/' && pathname.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className={[
                    'flex items-center px-4 py-3 text-base font-medium rounded-xl transition-all min-h-[52px]',
                    active
                      ? 'text-[#00ff88] bg-[#00ff88]/10'
                      : 'text-white/70 hover:text-white hover:bg-white/5',
                  ].join(' ')}
                >
                  {l.label}
                </Link>
              );
            })}
            {/* Create agent CTA */}
            <Link
              href="/create-agent"
              onClick={() => setOpen(false)}
              className="flex items-center justify-center px-4 py-3 mt-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-base rounded-xl min-h-[52px] transition-all hover:bg-[#00ff88]/90"
            >
              + Create Agent
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
