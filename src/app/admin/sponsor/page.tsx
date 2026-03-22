'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

const SPONSORS = [
  { id:'s1', name:'CryptoVault', tier:'platinum', logo:'💎', spend:50000, impressions:2400000, status:'active' },
  { id:'s2', name:'NeonTech', tier:'gold', logo:'⚡', spend:20000, impressions:980000, status:'active' },
  { id:'s3', name:'ArenaDAO', tier:'silver', logo:'🏛️', spend:8000, impressions:340000, status:'pending' },
];

export default function AdminSponsorPage() {
  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Sponsor Management</h1>
          <p className="text-white/40 text-sm mt-1">Manage arena sponsors and ad placements</p>
        </div>
        <button className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">+ Add Sponsor</button>
      </div>

      <div className="space-y-4">
        {SPONSORS.map(sponsor => (
          <div key={sponsor.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{sponsor.logo}</span>
                <div>
                  <p className="font-bold text-white">{sponsor.name}</p>
                  <span className={['px-2 py-0.5 text-xs rounded-full font-bold',
                    sponsor.tier === 'platinum' ? 'bg-[#e5e4e2]/10 text-[#e5e4e2]' :
                    sponsor.tier === 'gold' ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                    'bg-[#C0C0C0]/10 text-[#C0C0C0]'].join(' ')}>
                    {sponsor.tier.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-white">${sponsor.spend.toLocaleString()}</p>
                <p className="text-xs text-white/40">{(sponsor.impressions/1000000).toFixed(1)}M impressions</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:text-white transition-all">Manage</button>
                <span className={['px-2 py-0.5 text-xs rounded-full self-center',
                  sponsor.status === 'active' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-yellow-500/10 text-yellow-400'].join(' ')}>
                  {sponsor.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
