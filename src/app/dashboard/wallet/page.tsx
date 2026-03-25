'use client';
import { useUser } from '@/hooks/useUser';
import { BurnMeter } from '@/components/economy/BurnMeter';
import { MurphChart } from '@/components/economy/MurphChart';
import { STATUS_TIERS } from '@/lib/utils/status-tiers';

export default function DashboardWalletPage() {
  const { user, loading } = useUser();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" /></div>;

  const murphBalance = user?.wallet?.murphBalance ?? 0;
  const lifetimeMurph = user?.lifetimeMurph ?? 0;

  return (
    <div>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-8">My Wallet</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">$MURPH Balance</p>
          <p className="text-2xl font-bold font-space-grotesk" style={{ color: '#00ff88' }}>{murphBalance.toLocaleString()}</p>
        </div>
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Season Earned</p>
          <p className="text-2xl font-bold font-space-grotesk" style={{ color: '#9945FF' }}>
            {(user?.seasonMurph ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <p className="text-xs text-white/40 mb-1">Lifetime Earned</p>
          <p className="text-2xl font-bold font-space-grotesk" style={{ color: '#FFD700' }}>{lifetimeMurph.toLocaleString()}</p>
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <MurphChart />
        <BurnMeter />
      </div>

      {/* Status Tier Perks */}
      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
        <h2 className="text-sm font-bold text-white font-space-grotesk mb-4">Status Tier Perks</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STATUS_TIERS.map(t => (
            <div key={t.name} className="rounded-lg border border-white/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">{t.icon}</span>
                <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.color }}>{t.label}</span>
              </div>
              <p className="text-[10px] text-white/30 mb-1">{t.threshold.toLocaleString()}+ $MURPH</p>
              <ul className="text-[10px] text-white/40 space-y-0.5">
                {t.perks.map(p => <li key={p}>• {p}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
