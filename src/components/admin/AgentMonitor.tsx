'use client';

const AGENTS = [
  { id:'primus', name:'PRIMUS', status:'active', lastAction:'negotiate', turn:45, hp:78, color:'#00ff88' },
  { id:'cerberus', name:'CERBERUS', status:'active', lastAction:'attack', turn:45, hp:45, color:'#ff4444' },
  { id:'oracle', name:'ORACLE', status:'eliminated', lastAction:'defend', turn:38, hp:0, color:'#0ea5e9' },
];

export function AgentMonitor() {
  return (
    <div className="space-y-2">
      {AGENTS.map(agent => (
        <div key={agent.id} className={['flex items-center justify-between p-3 rounded-xl border', agent.status === 'eliminated' ? 'opacity-40 border-white/5' : 'border-white/10'].join(' ')}>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: agent.color + '20', color: agent.color }}>
              {agent.name[0]}
            </div>
            <div>
              <p className="text-sm font-bold text-white">{agent.name}</p>
              <p className="text-xs text-white/30">Last: {agent.lastAction} · Turn {agent.turn}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-16">
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${agent.hp}%`, background: agent.hp > 50 ? '#00ff88' : '#ff4444' }} />
              </div>
            </div>
            <span className={['px-2 py-0.5 text-xs font-bold rounded-full', agent.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-white/30'].join(' ')}>
              {agent.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default AgentMonitor;
