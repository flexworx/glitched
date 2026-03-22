'use client';

interface Alliance {
  agentA: string;
  agentB: string;
  strength: number;
  formed: number;
  status: 'active' | 'broken';
}

interface AllianceMapProps { alliances: Alliance[]; agents: Array<{ id: string; name: string; color: string }> }

export function AllianceMap({ alliances, agents }: AllianceMapProps) {
  const activeAlliances = alliances.filter(a => a.status === 'active');
  const brokenAlliances = alliances.filter(a => a.status === 'broken');

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
      <h3 className="text-sm font-bold text-white font-space-grotesk mb-4">Alliance Map</h3>

      {activeAlliances.length === 0 && brokenAlliances.length === 0 ? (
        <p className="text-xs text-white/30 text-center py-4">No alliances formed yet</p>
      ) : (
        <div className="space-y-2">
          {activeAlliances.map((a, i) => {
            const agentA = agents.find(ag => ag.id === a.agentA);
            const agentB = agents.find(ag => ag.id === a.agentB);
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg">
                <span className="text-xs font-bold" style={{ color: agentA?.color || '#fff' }}>{agentA?.name || a.agentA}</span>
                <div className="flex-1 h-0.5 rounded-full bg-[#00ff88]/30" style={{ opacity: a.strength }}>
                  <div className="h-full bg-[#00ff88] rounded-full" style={{ width: `${a.strength * 100}%` }} />
                </div>
                <span className="text-xs font-bold" style={{ color: agentB?.color || '#fff' }}>{agentB?.name || a.agentB}</span>
                <span className="text-xs text-[#00ff88]/60 ml-1">🤝</span>
              </div>
            );
          })}
          {brokenAlliances.map((a, i) => {
            const agentA = agents.find(ag => ag.id === a.agentA);
            const agentB = agents.find(ag => ag.id === a.agentB);
            return (
              <div key={i} className="flex items-center gap-2 p-2 bg-red-500/5 border border-red-500/20 rounded-lg opacity-60">
                <span className="text-xs line-through text-white/40">{agentA?.name || a.agentA}</span>
                <div className="flex-1 h-0.5 bg-red-500/20 rounded-full" />
                <span className="text-xs line-through text-white/40">{agentB?.name || a.agentB}</span>
                <span className="text-xs text-red-400/60 ml-1">💔</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
export default AllianceMap;
