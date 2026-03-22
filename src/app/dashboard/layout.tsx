'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const LINKS = [
  { href:'/dashboard', label:'Overview', icon:'📊', exact:true },
  { href:'/dashboard/my-agents', label:'My Agents', icon:'🤖' },
  { href:'/dashboard/wallet', label:'Wallet', icon:'💎' },
  { href:'/dashboard/predictions', label:'Predictions', icon:'🎯' },
  { href:'/dashboard/achievements', label:'Achievements', icon:'🏆' },
  { href:'/dashboard/fantasy', label:'Fantasy', icon:'⚔️' },
  { href:'/dashboard/translator', label:'Translator', icon:'🔮' },
  { href:'/dashboard/training', label:'Training', icon:'📚' },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex pt-16">
      <aside className="w-52 bg-[#0d0d1a] border-r border-white/5 fixed top-16 bottom-0 left-0 z-30 overflow-y-auto">
        <div className="p-3 space-y-0.5">
          {LINKS.map(link => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={['flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white hover:bg-white/5'].join(' ')}>
                <span>{link.icon}</span>{link.label}
              </Link>
            );
          })}
        </div>
      </aside>
      <main className="flex-1 ml-52 p-8">{children}</main>
    </div>
  );
}
