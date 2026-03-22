'use client';
import { useState } from 'react';

const CHAOS_EVENTS = [
  { id:'fog', name:'Fog of War', desc:'All agents lose visibility for 5 turns', icon:'🌫️' },
  { id:'earthquake', name:'Arena Earthquake', desc:'Random position shuffling', icon:'🌋' },
  { id:'plague', name:'Plague', desc:'All agents lose 10 HP', icon:'☠️' },
  { id:'treasure', name:'Treasure Drop', desc:'Random resource bonus to 2 agents', icon:'💎' },
  { id:'betrayal_boost', name:'Betrayal Bonus', desc:'Next betrayal earns 2x VERITAS', icon:'🗡️' },
];

export function ChaosEventTrigger({ matchId }: { matchId?: string }) {
  const [selected, setSelected] = useState('');
  const [triggering, setTriggering] = useState(false);

  const trigger = async () => {
    if (!selected) return;
    setTriggering(true);
    await new Promise(r => setTimeout(r, 1500));
    setTriggering(false);
    setSelected('');
  };

  return (
    <div className="bg-[#0d0d1a] border border-[#ff6600]/20 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">⚡ Chaos Events</h3>
      <div className="space-y-2 mb-4">
        {CHAOS_EVENTS.map(event => (
          <button key={event.id} onClick={() => setSelected(event.id)}
            className={['w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all',
              selected === event.id ? 'bg-[#ff6600]/10 border-[#ff6600]/40' : 'border-white/10 hover:border-white/20'].join(' ')}>
            <span className="text-xl">{event.icon}</span>
            <div>
              <p className="text-sm font-bold text-white">{event.name}</p>
              <p className="text-xs text-white/40">{event.desc}</p>
            </div>
          </button>
        ))}
      </div>
      <button onClick={trigger} disabled={!selected || triggering}
        className="w-full py-2.5 bg-[#ff6600]/10 border border-[#ff6600]/30 text-[#ff6600] font-bold text-sm rounded-xl hover:bg-[#ff6600]/20 transition-all disabled:opacity-40 flex items-center justify-center gap-2">
        {triggering && <span className="w-4 h-4 rounded-full border-2 border-[#ff6600]/20 border-t-[#ff6600] animate-spin" />}
        Trigger Chaos Event
      </button>
    </div>
  );
}
export default ChaosEventTrigger;
