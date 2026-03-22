'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarItem { href: string; label: string; icon: string; badge?: string; }
interface SidebarProps { items: SidebarItem[]; title?: string; }

export function Sidebar({ items, title }: SidebarProps) {
  const pathname = usePathname();
  return (
    <aside className="w-64 bg-[#080810] border-r border-white/5 min-h-screen p-4">
      {title && <h2 className="text-xs font-semibold text-white/30 uppercase tracking-wider px-3 mb-3">{title}</h2>}
      <nav className="space-y-1">
        {items.map(item => {
          const active = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link key={item.href} href={item.href}
              className={['flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-all',
                active ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'text-white/60 hover:text-white hover:bg-white/5'].join(' ')}>
              <span className="flex items-center gap-2.5"><span className="text-base">{item.icon}</span>{item.label}</span>
              {item.badge && <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{item.badge}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
export default Sidebar;
