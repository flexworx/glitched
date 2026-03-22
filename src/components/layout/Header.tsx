'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useWallet } from '@/hooks/useWallet';

const NAV = [
  { href: '/arena', label: 'Arena' },
  { href: '/agents', label: 'Agents' },
  { href: '/predictions', label: 'Predict' },
  { href: '/murph', label: '$MURPH' },
  { href: '/leaderboards', label: 'Ranks' },
  { href: '/seasons', label: 'Seasons' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { wallet, connect, disconnect } = useWallet();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-md border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88] flex items-center justify-center">
            <span className="text-[#0a0a0f] font-black text-sm">G</span>
          </div>
          <span className="font-black text-xl font-space-grotesk text-white group-hover:text-[#00ff88] transition-colors">
            GLITCHED<span className="text-[#00ff88]">.gg</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(l => (
            <Link key={l.href} href={l.href} className="px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span className="text-xs text-red-400 font-medium">LIVE</span>
          </div>
          {wallet.connected ? (
            <button onClick={disconnect} className="flex items-center gap-2 px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-sm text-[#00ff88] hover:bg-[#00ff88]/20 transition-all">
              <span className="font-mono">{wallet.address?.slice(0,4)}...{wallet.address?.slice(-4)}</span>
              <span className="text-white/40">|</span>
              <span>{wallet.murphBalance.toLocaleString()} $MURPH</span>
            </button>
          ) : (
            <button onClick={connect} className="px-4 py-1.5 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">
              Connect Wallet
            </button>
          )}
          <button className="md:hidden p-2 text-white/60 hover:text-white" onClick={() => setOpen(!open)}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f] px-4 py-3">
          {NAV.map(l => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="block px-3 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
export default Header;
