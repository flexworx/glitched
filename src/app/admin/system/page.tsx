'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminSystemPage() {
  const [metrics, setMetrics] = useState(Array.from({ length: 20 }, (_, i) => ({
    t: i,
    cpu: Math.floor(Math.random() * 30) + 20,
    mem: Math.floor(Math.random() * 20) + 40,
    rps: Math.floor(Math.random() * 100) + 200,
  })));

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => [...prev.slice(-19), {
        t: prev[prev.length - 1].t + 1,
        cpu: Math.floor(Math.random() * 30) + 20,
        mem: Math.floor(Math.random() * 20) + 40,
        rps: Math.floor(Math.random() * 100) + 200,
      }]);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const services = [
    { name: 'Next.js Web', status: 'healthy', uptime: '99.97%', port: 3000 },
    { name: 'WebSocket Server', status: 'healthy', uptime: '99.95%', port: 3001 },
    { name: 'Game Engine', status: 'healthy', uptime: '99.98%', port: 3002 },
    { name: 'PostgreSQL', status: 'healthy', uptime: '100%', port: 5432 },
    { name: 'Claude API', status: 'healthy', uptime: '99.9%', port: 443 },
    { name: 'ElevenLabs API', status: 'healthy', uptime: '99.8%', port: 443 },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-orbitron text-xl text-neon-green uppercase tracking-widest">System Health</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: 'CPU Usage', key: 'cpu', color: '#39FF14', suffix: '%' },
          { label: 'Memory Usage', key: 'mem', color: '#00D4FF', suffix: '%' },
          { label: 'Requests/sec', key: 'rps', color: '#FFBF00', suffix: '' },
        ].map(({ label, key, color, suffix }) => (
          <div key={key} className="bg-arena-surface border border-arena-border p-4">
            <h3 className="font-orbitron text-xs uppercase tracking-wider mb-2" style={{ color }}>{label}</h3>
            <div className="font-orbitron text-2xl mb-2" style={{ color }}>
              {metrics[metrics.length - 1][key as 'cpu' | 'mem' | 'rps']}{suffix}
            </div>
            <ResponsiveContainer width="100%" height={60}>
              <LineChart data={metrics}>
                <Line type="monotone" dataKey={key} stroke={color} strokeWidth={1.5} dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
      <div className="bg-arena-surface border border-arena-border p-4">
        <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-3">Services</h2>
        <div className="space-y-2">
          {services.map((svc) => (
            <div key={svc.name} className="flex items-center justify-between py-2 border-b border-arena-border last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-neon-green"/>
                <span className="font-orbitron text-sm text-white">{svc.name}</span>
              </div>
              <div className="flex items-center gap-6 text-xs font-jetbrains">
                <span className="text-gray-500">:{svc.port}</span>
                <span className="text-neon-green">{svc.uptime}</span>
                <span className="text-gray-400 uppercase">{svc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
