'use client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const MOCK_DATA = [
  { date:'Mar 1', price:0.0012, volume:125000 },
  { date:'Mar 5', price:0.0018, volume:234000 },
  { date:'Mar 10', price:0.0015, volume:189000 },
  { date:'Mar 15', price:0.0024, volume:312000 },
  { date:'Mar 20', price:0.0031, volume:445000 },
  { date:'Mar 21', price:0.0028, volume:389000 },
];

export function MurphChart() {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white font-space-grotesk">$MURPH Price</h3>
        <div className="flex gap-1">
          {['1D','7D','30D','ALL'].map(p => (
            <button key={p} className={['px-2 py-0.5 text-xs rounded font-medium transition-all',
              p === '30D' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'text-white/30 hover:text-white'].join(' ')}>{p}</button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={MOCK_DATA}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `$${v.toFixed(4)}`} />
          <Tooltip contentStyle={{ background: '#0d0d1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8 }}
            labelStyle={{ color: 'rgba(255,255,255,0.6)' }} itemStyle={{ color: '#00ff88' }} />
          <Line type="monotone" dataKey="price" stroke="#00ff88" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
export default MurphChart;
