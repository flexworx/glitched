'use client';
import { useState } from 'react';

interface GameControlPanelProps {
  matchId?: string;
  status?: string;
}

export function GameControlPanel({ matchId, status = 'active' }: GameControlPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);

  const action = async (type: string) => {
    setLoading(type);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(null);
  };

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">Game Controls {matchId && <span className="text-white/30 font-normal text-sm">#{matchId.slice(-6)}</span>}</h3>
      <div className="grid grid-cols-2 gap-2">
        {[
          { id:'pause', label:'Pause Match', color:'#ffcc00', icon:'⏸' },
          { id:'resume', label:'Resume Match', color:'#00ff88', icon:'▶' },
          { id:'skip', label:'Skip Turn', color:'#0ea5e9', icon:'⏭' },
          { id:'chaos', label:'Chaos Event', color:'#ff6600', icon:'⚡' },
          { id:'end', label:'End Match', color:'#ff4444', icon:'⏹' },
          { id:'new', label:'New Match', color:'#8b5cf6', icon:'🆕' },
        ].map(btn => (
          <button key={btn.id} onClick={() => action(btn.id)} disabled={loading === btn.id}
            className="flex items-center gap-2 p-3 rounded-lg border border-white/10 text-sm font-bold transition-all hover:border-white/20 disabled:opacity-50"
            style={{ color: btn.color }}>
            {loading === btn.id ? <span className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" /> : <span>{btn.icon}</span>}
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
export default GameControlPanel;
