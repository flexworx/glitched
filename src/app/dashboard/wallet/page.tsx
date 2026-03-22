'use client';
import { BurnMeter } from '@/components/economy/BurnMeter';
import { MurphChart } from '@/components/economy/MurphChart';

export default function DashboardWalletPage() {
  return (
    <div>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-8">My Wallet</h1>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label:'$MURPH Balance', value:'5,000', color:'#00ff88' },
          { label:'SOL Balance', value:'0.45', color:'#9945FF' },
          { label:'Total Earned', value:'12,400', color:'#FFD700' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className="text-2xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MurphChart />
        <BurnMeter totalBurned={12450000} dailyBurn={8100} />
      </div>
    </div>
  );
}
