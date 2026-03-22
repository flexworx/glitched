'use client';

interface AgentWalletManagerProps {
  agents: Array<{ id: string; name: string; color: string; balance: number; address: string }>;
}

export function AgentWalletManager({ agents }: AgentWalletManagerProps) {
  return (
    <div className="space-y-3">
      {agents.map(agent => (
        <div key={agent.id} className="flex items-center justify-between p-3 bg-[#080810] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: agent.color + '20', color: agent.color }}>
              {agent.name[0]}
            </div>
            <div>
              <p className="font-bold text-white text-sm">{agent.name}</p>
              <p className="text-xs text-white/30 font-mono">{agent.address.slice(0,8)}...</p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-bold font-mono" style={{ color: agent.color }}>{agent.balance.toLocaleString()}</p>
            <p className="text-xs text-white/30">$MURPH</p>
          </div>
        </div>
      ))}
    </div>
  );
}
export default AgentWalletManager;
