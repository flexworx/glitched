'use client';
import { useAdmin } from '@/hooks/useAdmin';

export function AdminDashboard() {
  const { stats, loading } = useAdmin();

  if (loading) return <div className="flex items-center justify-center h-40"><div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" /></div>;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label:'Active Matches', value:stats?.activeMatches ?? 1, color:'#00ff88', icon:'⚔️' },
        { label:'WS Connections', value:stats?.wsConnections ?? 342, color:'#0ea5e9', icon:'🔌' },
        { label:'Daily $MURPH Burn', value:stats?.dailyBurn?.toLocaleString() ?? '8,100', color:'#ff4444', icon:'🔥' },
        { label:'Pending Agents', value:stats?.pendingAgents ?? 2, color:'#FFD700', icon:'🤖' },
      ].map(s => (
        <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span>{s.icon}</span>
            <p className="text-xs text-white/40">{s.label}</p>
          </div>
          <p className="text-2xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
export default AdminDashboard;
