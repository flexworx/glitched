'use client';

interface StreamOverlayProps {
  matchId: string;
  dramaScore: number;
  turn: number;
  maxTurns: number;
  agents: Array<{ name: string; hp: number; maxHp: number; color: string; status: string }>;
}

export function StreamOverlay({ matchId, dramaScore, turn, maxTurns, agents }: StreamOverlayProps) {
  const alive = agents.filter(a => a.status === 'alive');

  return (
    <div className="relative w-full aspect-video bg-transparent pointer-events-none select-none">
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-2 bg-gradient-to-b from-black/60 to-transparent">
        <div className="flex items-center gap-2">
          <span className="text-[#00ff88] font-black font-space-grotesk text-sm">GLITCHED.GG</span>
          <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs font-bold rounded">LIVE</span>
        </div>
        <div className="flex items-center gap-3 text-xs text-white/80">
          <span>Turn {turn}/{maxTurns}</span>
          <span className="text-[#ff6600] font-bold">Drama: {dramaScore}</span>
        </div>
      </div>

      {/* Bottom agent bars */}
      <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-black/60 to-transparent">
        <div className="flex gap-2 justify-center">
          {alive.map(agent => (
            <div key={agent.name} className="flex items-center gap-1.5 px-2 py-1 bg-black/50 rounded-lg">
              <span className="text-xs font-bold" style={{ color: agent.color }}>{agent.name}</span>
              <div className="w-12 h-1 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(agent.hp/agent.maxHp)*100}%`, background: agent.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default StreamOverlay;
