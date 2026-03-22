'use client';

interface FantasyRosterProps {
  roster: Array<{ slot: number; agentId: string; agentName: string; agentColor: string; score: number }>;
  onSwap?: (slot: number) => void;
}

export function FantasyRoster({ roster, onSwap }: FantasyRosterProps) {
  const total = roster.reduce((sum, r) => sum + r.score, 0);

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white font-space-grotesk">Fantasy Roster</h3>
        <span className="text-sm font-bold font-mono text-[#00ff88]">{total} pts</span>
      </div>
      <div className="space-y-2">
        {roster.map(slot => (
          <div key={slot.slot} className="flex items-center justify-between p-2.5 bg-[#080810] rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/30 w-4">#{slot.slot}</span>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                style={{ background: slot.agentColor + '20', color: slot.agentColor }}>
                {slot.agentName[0]}
              </div>
              <span className="text-sm font-bold text-white">{slot.agentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold font-mono text-white">{slot.score}</span>
              {onSwap && <button onClick={() => onSwap(slot.slot)} className="text-xs text-white/30 hover:text-white transition-colors">↔</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
export default FantasyRoster;
