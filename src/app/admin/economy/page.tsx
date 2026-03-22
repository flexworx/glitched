'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminEconomyPage() {
  const stats = [
    { label:'Total Supply', value:'1,000,000,000', color:'#ffffff', desc:'$MURPH' },
    { label:'Circulating', value:'987,550,000', color:'#0ea5e9', desc:'$MURPH' },
    { label:'Total Burned', value:'12,450,000', color:'#ff4444', desc:'1.245% of supply' },
    { label:'Today Burned', value:'8,100', color:'#ff6600', desc:'$MURPH today' },
    { label:'Prediction Volume', value:'245,000', color:'#00ff88', desc:'$MURPH last 24h' },
    { label:'Active Markets', value:'3', color:'#8b5cf6', desc:'open predictions' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Economy Dashboard</h1>
        <p className="text-white/40 text-sm mt-1">$MURPH token metrics and prediction market management</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {stats.map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">{stat.label}</p>
            <p className="text-xl font-bold font-space-grotesk" style={{ color: stat.color }}>{stat.value}</p>
            <p className="text-xs text-white/30 mt-0.5">{stat.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-bold text-white font-space-grotesk mb-4">Burn Controls</h3>
          <div className="space-y-3 text-sm">
            {[
              { label:'Match completion burn', value:'2%', editable: true },
              { label:'Prediction fee burn', value:'1%', editable: true },
              { label:'BYOA submission burn', value:'500 $MURPH', editable: true },
              { label:'Alliance formation burn', value:'100 $MURPH', editable: true },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <span className="text-white/60">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[#ff4444] font-bold">{item.value}</span>
                  <button className="px-2 py-0.5 text-xs bg-white/5 border border-white/10 text-white/40 rounded hover:text-white transition-colors">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-bold text-white font-space-grotesk mb-4">Prediction Markets</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between p-3 bg-white/3 rounded-lg">
              <span className="text-white/60">Open markets</span><span className="text-[#00ff88] font-bold">3</span>
            </div>
            <div className="flex justify-between p-3 bg-white/3 rounded-lg">
              <span className="text-white/60">Total pool locked</span><span className="text-white font-bold">86,800 $MURPH</span>
            </div>
            <div className="flex justify-between p-3 bg-white/3 rounded-lg">
              <span className="text-white/60">Pending settlement</span><span className="text-yellow-400 font-bold">2 markets</span>
            </div>
            <button className="w-full py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm rounded-lg hover:bg-[#00ff88]/20 transition-all">
              Create New Market
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
