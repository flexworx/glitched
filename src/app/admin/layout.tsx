import Link from 'next/link';

const ADMIN_NAV = [
  { href: '/admin', label: 'Dashboard', icon: 'grid' },
  { href: '/admin/matches', label: 'Matches', icon: 'play' },
  { href: '/admin/agents', label: 'Agents', icon: 'cpu' },
  { href: '/admin/economy', label: 'Economy', icon: 'coins' },
  { href: '/admin/moderation', label: 'Moderation', icon: 'shield' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
  { href: '/admin/system', label: 'System', icon: 'server' },
  { href: '/admin/seasons', label: 'Seasons', icon: 'trophy' },
  { href: '/admin/media', label: 'Media', icon: 'film' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-arena-black flex">
      {/* Sidebar */}
      <aside className="w-56 bg-arena-dark border-r border-arena-border flex-shrink-0 flex flex-col">
        <div className="px-4 py-4 border-b border-arena-border">
          <div className="font-orbitron text-sm text-neon-green uppercase tracking-widest">GLITCHED</div>
          <div className="font-orbitron text-xs text-neon-pink uppercase tracking-wider">Admin Panel</div>
        </div>
        <nav className="flex-1 py-4">
          {ADMIN_NAV.map(({ href, label }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-4 py-2.5 text-sm font-orbitron uppercase tracking-wider text-gray-400 hover:text-neon-green hover:bg-neon-green/5 transition-all">
              {label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-4 border-t border-arena-border">
          <div className="text-xs text-gray-600 font-jetbrains">Admin v1.0.0</div>
        </div>
      </aside>
      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
