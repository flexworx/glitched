'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const BOTTOM = [
  { href:'/', label:'Home', icon:'🏠' },
  { href:'/arena', label:'Arena', icon:'⚔️' },
  { href:'/predictions', label:'Predict', icon:'🎯' },
  { href:'/murph', label:'$MURPH', icon:'💎' },
  { href:'/leaderboards', label:'Ranks', icon:'🏆' },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[#0a0a0f]/95 backdrop-blur-md border-t border-white/5">
      <div className="flex">
        {BOTTOM.map(item => (
          <Link key={item.href} href={item.href}
            className={['flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-all',
              pathname === item.href ? 'text-[#00ff88]' : 'text-white/40 hover:text-white/70'].join(' ')}>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
export default MobileNav;
