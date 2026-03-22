'use client';

interface AgentWalletProps {
  agentId: string;
  agentName: string;
  agentColor: string;
  balance: number;
  earnings: number;
  address?: string;
}

export function AgentWallet({ agentId, agentName, agentColor, balance, earnings, address }: AgentWalletProps) {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm"
          style={{ background: agentColor + '20', color: agentColor, border: `1px solid ${agentColor}40` }}>
          {agentName[0]}
        </div>
        <div>
          <p className="font-bold text-white text-sm">{agentName} Wallet</p>
          {address && <p className="text-xs text-white/30 font-mono">{address.slice(0, 8)}...{address.slice(-6)}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-[#080810] rounded-lg p-3">
          <p className="text-xs text-white/40 mb-0.5">Balance</p>
          <p className="text-lg font-bold font-mono" style={{ color: agentColor }}>{balance.toLocaleString()}</p>
          <p className="text-xs text-white/30">$MURPH</p>
        </div>
        <div className="bg-[#080810] rounded-lg p-3">
          <p className="text-xs text-white/40 mb-0.5">Total Earned</p>
          <p className="text-lg font-bold font-mono text-[#00ff88]">{earnings.toLocaleString()}</p>
          <p className="text-xs text-white/30">$MURPH</p>
        </div>
      </div>
    </div>
  );
}
export default AgentWallet;
