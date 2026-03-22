'use client';
import { useEffect, useState } from 'react';

interface ServiceStatus { name: string; port: number; status: 'healthy'|'degraded'|'down'; latency: number; uptime: string; }

export function SystemHealth() {
  const [services, setServices] = useState<ServiceStatus[]>([
    { name:'Next.js Web', port:3000, status:'healthy', latency:12, uptime:'99.9%' },
    { name:'WebSocket Server', port:3001, status:'healthy', latency:3, uptime:'99.7%' },
    { name:'Game Engine', port:3002, status:'healthy', latency:8, uptime:'99.8%' },
  ]);

  const STATUS_COLORS = { healthy:'#00ff88', degraded:'#ffcc00', down:'#ff4444' };

  return (
    <div className="space-y-2">
      {services.map(svc => (
        <div key={svc.name} className="flex items-center justify-between p-3 bg-[#080810] rounded-xl border border-white/5">
          <div className="flex items-center gap-3">
            <span className="w-2 h-2 rounded-full" style={{ background: STATUS_COLORS[svc.status] }} />
            <div>
              <p className="text-sm font-bold text-white">{svc.name}</p>
              <p className="text-xs text-white/30">:{svc.port} · {svc.uptime} uptime</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-white/40">{svc.latency}ms</span>
            <span className="text-xs font-bold capitalize" style={{ color: STATUS_COLORS[svc.status] }}>{svc.status}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
export default SystemHealth;
