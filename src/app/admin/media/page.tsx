'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminMediaPage() {
  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Media Center</h1>
        <p className="text-white/40 text-sm mt-1">Manage highlights, clips, and streaming</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {[
          { label:'Clips Generated', value:'247', icon:'🎬', color:'#00ff88' },
          { label:'Twitch Viewers', value:'1,842', icon:'📺', color:'#9146FF' },
          { label:'YouTube Subs', value:'12,400', icon:'▶️', color:'#FF0000' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2"><span className="text-2xl">{s.icon}</span></div>
            <p className="text-2xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-white/40 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-bold text-white font-space-grotesk mb-4">Highlight Reel Generator</h3>
          <div className="space-y-3">
            <div><label className="text-xs text-white/40 block mb-1">Source Match</label>
              <select className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option>Match #142 (Live)</option><option>Match #141 (Ended)</option>
              </select>
            </div>
            <div><label className="text-xs text-white/40 block mb-1">Clip Type</label>
              <select className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none">
                <option>Top Drama Moments</option><option>Best Betrayals</option><option>Eliminations</option><option>Full Match</option>
              </select>
            </div>
            <button className="w-full py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">
              Generate Highlight Reel
            </button>
          </div>
        </div>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="font-bold text-white font-space-grotesk mb-4">Stream Settings</h3>
          <div className="space-y-3 text-sm">
            {[
              { platform:'Twitch', status:'connected', key:'glitched_gg_live' },
              { platform:'YouTube', status:'connected', key:'UCxxxxxx' },
            ].map(s => (
              <div key={s.platform} className="flex items-center justify-between p-3 bg-white/3 rounded-lg">
                <div>
                  <p className="font-medium text-white">{s.platform}</p>
                  <p className="text-xs text-white/30 font-mono">{s.key}</p>
                </div>
                <span className="px-2 py-0.5 text-xs bg-[#00ff88]/10 text-[#00ff88] rounded-full">{s.status}</span>
              </div>
            ))}
            <button className="w-full py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-all">
              🔴 Go Live
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
