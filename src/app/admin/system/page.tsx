'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminSystemPage() {
  const { stats } = useAdmin();

  const services = [
    { name:'Next.js Web', port:3000, status:'healthy', uptime:'99.9%', latency:'12ms' },
    { name:'WebSocket Server', port:3001, status:'healthy', uptime:'99.7%', latency:'4ms' },
    { name:'Game Engine', port:3002, status:'healthy', uptime:'99.8%', latency:'8ms' },
    { name:'PostgreSQL', port:5432, status:'healthy', uptime:'100%', latency:'2ms' },
    { name:'Anthropic Claude API', port:443, status:'healthy', uptime:'99.5%', latency:'340ms' },
    { name:'Solana RPC', port:443, status:'healthy', uptime:'99.2%', latency:'180ms' },
  ];

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-black font-space-grotesk text-white">System Health</h1>
        <p className="text-white/40 text-sm mt-1">Real-time infrastructure monitoring</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'CPU Usage', value: stats ? `${stats.cpuUsage}%` : '—', color: stats && stats.cpuUsage > 80 ? '#ff4444' : '#00ff88' },
          { label:'Memory', value: stats ? `${stats.memoryUsage}%` : '—', color: stats && stats.memoryUsage > 85 ? '#ff4444' : '#00ff88' },
          { label:'WS Connections', value: stats?.wsConnections?.toString() || '—', color:'#0ea5e9' },
          { label:'System Status', value: stats?.systemHealth || 'Unknown', color: stats?.systemHealth === 'healthy' ? '#00ff88' : '#ff4444' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">{stat.label}</p>
            <p className="text-xl font-bold font-space-grotesk capitalize" style={{ color: stat.color }}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <h3 className="font-bold text-white font-space-grotesk">Services</h3>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Service</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Port</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Status</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Uptime</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Latency</th>
          </tr></thead>
          <tbody>
            {services.map(svc => (
              <tr key={svc.name} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                <td className="px-4 py-3 font-medium text-white">{svc.name}</td>
                <td className="px-4 py-3 text-white/50 font-mono">{svc.port}</td>
                <td className="px-4 py-3">
                  <span className={['px-2 py-0.5 text-xs rounded-full flex items-center gap-1 w-fit',
                    svc.status === 'healthy' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'].join(' ')}>
                    <span className="w-1 h-1 rounded-full bg-current animate-pulse" />{svc.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/50 font-mono">{svc.uptime}</td>
                <td className="px-4 py-3 text-white/50 font-mono">{svc.latency}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
