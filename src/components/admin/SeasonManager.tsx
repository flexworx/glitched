'use client';
import { useState } from 'react';

export function SeasonManager() {
  const [creating, setCreating] = useState(false);

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">Season Manager</h3>
      <div className="space-y-3 mb-4">
        {[
          { id:'s2', name:'Season 2: Emergence', status:'active', episodes:'7/12', endDate:'Apr 30' },
          { id:'s1', name:'Season 1: Genesis', status:'ended', episodes:'12/12', endDate:'Feb 28' },
        ].map(season => (
          <div key={season.id} className="flex items-center justify-between p-3 bg-[#080810] rounded-lg">
            <div>
              <p className="font-bold text-white text-sm">{season.name}</p>
              <p className="text-xs text-white/30">{season.episodes} episodes · Ends {season.endDate}</p>
            </div>
            <span className={['px-2 py-0.5 text-xs font-bold rounded-full', season.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-white/30'].join(' ')}>
              {season.status}
            </span>
          </div>
        ))}
      </div>
      <button onClick={() => setCreating(true)} className="w-full py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-xl hover:bg-[#8b5cf6]/20 transition-all">
        + Create Season 3
      </button>
    </div>
  );
}
export default SeasonManager;
