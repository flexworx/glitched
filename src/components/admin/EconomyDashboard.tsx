'use client';
import { MurphChart } from '@/components/economy/MurphChart';
import { BurnMeter } from '@/components/economy/BurnMeter';
import { TokenomicsChart } from '@/components/economy/TokenomicsChart';

export function EconomyDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label:'Total Supply', value:'1,000,000,000', color:'#ffffff' },
          { label:'Circulating', value:'987,550,000', color:'#00ff88' },
          { label:'Total Burned', value:'12,450,000', color:'#ff4444' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <MurphChart />
        <BurnMeter totalBurned={12450000} dailyBurn={8100} size="lg" />
      </div>
      <TokenomicsChart />
    </div>
  );
}
export default EconomyDashboard;
