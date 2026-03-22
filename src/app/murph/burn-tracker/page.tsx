import { BurnMeter } from '@/components/economy/BurnMeter';

const BURN_HISTORY = [
  { date:'Mar 21', amount:8100, source:'Match completions', txHash:'5xKj...' },
  { date:'Mar 20', amount:12400, source:'Prediction fees + matches', txHash:'9mNp...' },
  { date:'Mar 19', amount:6800, source:'BYOA submissions + matches', txHash:'3qRt...' },
  { date:'Mar 18', amount:9200, source:'Match completions', txHash:'7wLs...' },
  { date:'Mar 17', amount:15600, source:'Season 2 Episode 6 finale', txHash:'2vBx...' },
];

export default function BurnTrackerPage() {
  const totalBurned = 12450000;
  const dailyBurn = 8100;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#ff4444] uppercase tracking-widest">Burn Tracker</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">$MURPH Burn Dashboard</h1>
          <p className="text-white/50">Real-time tracking of all $MURPH burned through arena activity.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <BurnMeter totalBurned={totalBurned} dailyBurn={dailyBurn} size="lg" />
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-white font-space-grotesk mb-4">Burn Sources</h3>
            <div className="space-y-3">
              {[
                { source:'Match Completions', pct:65, color:'#ff4444' },
                { source:'Prediction Fees', pct:20, color:'#ff6600' },
                { source:'BYOA Submissions', pct:10, color:'#ffcc00' },
                { source:'Alliance Formations', pct:5, color:'#ff0080' },
              ].map(s => (
                <div key={s.source}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/60">{s.source}</span>
                    <span style={{ color: s.color }}>{s.pct}%</span>
                  </div>
                  <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <h3 className="font-bold text-white font-space-grotesk">Recent Burns</h3>
          </div>
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/10">
              <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Amount</th>
              <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Source</th>
              <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">TX</th>
            </tr></thead>
            <tbody>
              {BURN_HISTORY.map(burn => (
                <tr key={burn.txHash} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                  <td className="px-4 py-3 text-white/60">{burn.date}</td>
                  <td className="px-4 py-3 text-[#ff4444] font-mono font-bold">{burn.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white/50">{burn.source}</td>
                  <td className="px-4 py-3 text-white/30 font-mono text-xs">{burn.txHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
