'use client';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DATA = [
  { name:'Arena Rewards', value:40, color:'#00ff88' },
  { name:'Community Treasury', value:20, color:'#0ea5e9' },
  { name:'Team & Advisors', value:15, color:'#8b5cf6' },
  { name:'Ecosystem Fund', value:15, color:'#ffcc00' },
  { name:'Initial Liquidity', value:10, color:'#ff6600' },
];

export function TokenomicsChart() {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-4">$MURPH Token Distribution</h3>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
            {DATA.map((entry, i) => <Cell key={i} fill={entry.color} />)}
          </Pie>
          <Tooltip formatter={(v: number) => `${v}%`} contentStyle={{ background:'#0d0d1a', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'white' }} />
          <Legend formatter={(v) => <span style={{ color:'rgba(255,255,255,0.6)', fontSize:'12px' }}>{v}</span>} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
export default TokenomicsChart;
