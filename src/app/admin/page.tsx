'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const SYSTEM_METRICS = [
  { label: 'Active Matches', value: '3', status: 'ok', color: '#39FF14' },
  { label: 'Queue Depth', value: '0', status: 'ok', color: '#39FF14' },
  { label: 'API Latency', value: '124ms', status: 'ok', color: '#39FF14' },
  { label: 'WS Connections', value: '1,247', status: 'ok', color: '#39FF14' },
  { label: 'DB Pool', value: '8/20', status: 'ok', color: '#39FF14' },
  { label: 'Claude API', value: 'OK', status: 'ok', color: '#39FF14' },
  { label: 'Error Rate', value: '0.02%', status: 'ok', color: '#39FF14' },
  { label: 'Uptime', value: '99.97%', status: 'ok', color: '#39FF14' },
];

const RECENT_EVENTS = [
  { time: '20:14:32', type: 'MATCH', message: 'Match 7 started — 8 agents loaded', color: '#39FF14' },
  { time: '20:12:15', type: 'ECONOMY', message: 'Prediction market closed — 45,000 $MURPH distributed', color: '#FFBF00' },
  { time: '20:10:44', type: 'AGENT', message: 'PRIMUS formed alliance with CERBERUS', color: '#00D4FF' },
  { time: '20:09:11', type: 'DRAMA', message: 'Drama score peaked at 87 — PIP camera switched', color: '#FF6B35' },
  { time: '20:07:58', type: 'SYSTEM', message: 'Claude API response time: 1.2s avg', color: '#7B2FBE' },
  { time: '20:05:23', type: 'MODERATION', message: 'Chat message flagged and reviewed', color: '#FF006E' },
];

const ACTIVITY_DATA = Array.from({ length: 24 }, (_, i) => ({
  hour: `${i}:00`,
  viewers: Math.floor(Math.sin(i * 0.3 + 1) * 3000 + 8000),
  predictions: Math.floor(Math.sin(i * 0.4) * 500 + 800),
}));

export default function AdminDashboardPage() {
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const update = () => setCurrentTime(new Date().toLocaleTimeString());
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-orbitron text-2xl text-neon-green uppercase tracking-widest">Admin Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">Glitched.gg Platform Control Center</p>
        </div>
        <div className="font-jetbrains text-neon-green text-sm">{currentTime}</div>
      </div>

      {/* System Metrics */}
      <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
        {SYSTEM_METRICS.map((metric) => (
          <motion.div key={metric.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-arena-surface border border-arena-border p-3 text-center">
            <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
            <div className="font-orbitron text-sm font-bold" style={{ color: metric.color }}>{metric.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="bg-arena-surface border border-arena-border p-4">
        <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-3">24h Platform Activity</h2>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={ACTIVITY_DATA}>
            <defs>
              <linearGradient id="viewersGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#39FF14" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#39FF14" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a"/>
            <XAxis dataKey="hour" stroke="#4a4a5a" tick={{ fontSize: 9, fill: '#6b7280' }}/>
            <YAxis stroke="#4a4a5a" tick={{ fontSize: 9, fill: '#6b7280' }}/>
            <Tooltip contentStyle={{ background: '#1a1a2e', border: '1px solid #2a2a3a', color: '#fff', fontSize: 11 }}/>
            <Area type="monotone" dataKey="viewers" stroke="#39FF14" strokeWidth={1.5} fill="url(#viewersGrad)" name="Viewers"/>
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Events */}
      <div className="bg-arena-surface border border-arena-border p-4">
        <h2 className="font-orbitron text-sm text-neon-green uppercase tracking-wider mb-3">Recent Events</h2>
        <div className="space-y-2 font-jetbrains text-xs">
          {RECENT_EVENTS.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="text-gray-600 flex-shrink-0">{event.time}</span>
              <span className="flex-shrink-0 uppercase font-bold" style={{ color: event.color }}>[{event.type}]</span>
              <span className="text-gray-300">{event.message}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Start New Match', color: '#39FF14', action: 'start_match' },
          { label: 'Pause All Matches', color: '#FFBF00', action: 'pause_all' },
          { label: 'Trigger Chaos Event', color: '#FF6B35', action: 'chaos_event' },
          { label: 'Emergency Stop', color: '#FF006E', action: 'emergency_stop' },
        ].map(({ label, color, action }) => (
          <button key={action} className="border p-3 font-orbitron text-xs uppercase tracking-wider transition-all hover:opacity-80" style={{ borderColor: color, color, background: `${color}10` }}>
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
