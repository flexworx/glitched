'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

const ADMIN_LINKS = [
  { href:'/admin', label:'Dashboard', icon:'📊', exact:true },
  { href:'/admin/matches', label:'Matches', icon:'⚔️' },
  { href:'/admin/agents', label:'Agents', icon:'🤖' },
  { href:'/admin/users', label:'Users', icon:'👥' },
  { href:'/admin/economy', label:'Economy', icon:'💎' },
  { href:'/admin/moderation', label:'Moderation', icon:'🛡️' },
  { href:'/admin/seasons', label:'Seasons', icon:'📅' },
  { href:'/admin/media', label:'Media', icon:'🎬' },
  { href:'/admin/sponsor', label:'Sponsors', icon:'💰' },
  { href:'/admin/system', label:'System', icon:'⚙️' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex">
      {/* Sidebar */}
      <aside className="w-56 bg-[#0d0d1a] border-r border-white/5 flex flex-col fixed top-0 left-0 bottom-0 z-40">
        <div className="p-4 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <span className="font-black text-white font-space-grotesk text-sm">GLITCHED<span className="text-[#00ff88]">.gg</span></span>
          </Link>
          <p className="text-xs text-red-400 font-bold mt-0.5">ADMIN PANEL</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {ADMIN_LINKS.map(link => {
            const active = link.exact ? pathname === link.href : pathname.startsWith(link.href) && link.href !== '/admin';
            return (
              <Link key={link.href} href={link.href}
                className={['flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  active ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/50 hover:text-white hover:bg-white/5'].join(' ')}>
                <span className="text-base">{link.icon}</span>{link.label}
              </Link>
            );
          })}
        </nav>
        <div className="p-3 border-t border-white/5">
          <Link href="/" className="flex items-center gap-2 px-3 py-2 text-sm text-white/30 hover:text-white transition-colors rounded-lg hover:bg-white/5">
            ← Back to Site
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-56 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
export default AdminLayout;
