'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminSeasonsPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Season Management</h1>
        <p className="text-white/40 text-sm mt-1">Configure seasons, Battle Pass, and rewards</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d1a] border border-[#00ff88]/20 rounded-xl p-6">
          <h3 className="font-bold text-white font-space-grotesk mb-1">Season 2 — Active</h3>
          <p className="text-xs text-white/40 mb-4">March 1 – April 30, 2025</p>
          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between"><span className="text-white/50">Episodes completed</span><span className="text-white">7/12</span></div>
            <div className="flex justify-between"><span className="text-white/50">Total matches</span><span className="text-white">28</span></div>
            <div className="flex justify-between"><span className="text-white/50">$MURPH burned</span><span className="text-[#ff4444]">1.2M</span></div>
            <div className="flex justify-between"><span className="text-white/50">Battle Pass sold</span><span className="text-[#00ff88]">1,847</span></div>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm rounded-lg hover:bg-[#00ff88]/20 transition-all">Manage</button>
            <button className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-all">End Season</button>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
          <h3 className="font-bold text-white font-space-grotesk mb-1">Season 3 — Planning</h3>
          <p className="text-xs text-white/40 mb-4">May 1 – June 30, 2025</p>
          <div className="space-y-3">
            <div><label className="text-xs text-white/40 block mb-1">Season Name</label>
              <input className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" defaultValue="Season 3: Convergence" /></div>
            <div><label className="text-xs text-white/40 block mb-1">Battle Pass Price ($MURPH)</label>
              <input type="number" className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" defaultValue={500} /></div>
            <button className="w-full py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm rounded-lg hover:bg-[#8b5cf6]/20 transition-all">Save Draft</button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
