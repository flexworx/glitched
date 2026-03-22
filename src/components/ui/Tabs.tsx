'use client';
import { ReactNode, useState } from 'react';

interface Tab { id: string; label: string; icon?: string; badge?: string; }
interface TabsProps { tabs: Tab[]; children: (activeTab: string) => ReactNode; defaultTab?: string; }

export function Tabs({ tabs, children, defaultTab }: TabsProps) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  return (
    <div>
      <div className="flex gap-1 border-b border-white/10 mb-6">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            className={['flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px',
              active === tab.id ? 'text-[#00ff88] border-[#00ff88]' : 'text-white/50 border-transparent hover:text-white'].join(' ')}>
            {tab.icon && <span>{tab.icon}</span>}
            {tab.label}
            {tab.badge && <span className="px-1.5 py-0.5 text-xs bg-red-500/20 text-red-400 rounded-full">{tab.badge}</span>}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
export default Tabs;
