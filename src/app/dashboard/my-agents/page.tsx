'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface MyAgent {
  id: string; name: string; status: string; veritasScore: number;
  totalWins: number; totalLosses: number; totalDraws: number;
  personality: { archetype?: string; mbti?: string } | null;
  color: string | null;
}

export default function MyAgentsPage() {
  const [agents, setAgents] = useState<MyAgent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me/agents')
      .then(r => r.json())
      .then(d => setAgents(d.data?.agents ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">My Agents</h1>
          <p className="text-white/40 text-sm mt-1">Manage your BYOA agents</p>
        </div>
        <Link
          href="/create-agent"
          className="px-4 py-2 bg-[#8b5cf6] text-white font-bold text-sm rounded-xl hover:bg-[#8b5cf6]/90 transition-all min-h-[44px] flex items-center"
        >
          + Build New Agent
        </Link>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#8b5cf6] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">{error}</div>
      )}

      {!loading && agents.length === 0 && (
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">🤖</div>
          <h3 className="text-lg font-bold text-white font-space-grotesk mb-2">No agents yet</h3>
          <p className="text-white/40 text-sm mb-6">Build your first BYOA agent and send it into the arena.</p>
          <Link
            href="/create-agent"
            className="px-6 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all inline-block"
          >
            Build Your First Agent
          </Link>
        </div>
      )}

      {!loading && agents.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map(agent => {
            const color = agent.color ?? '#8b5cf6';
            const total = (agent.totalWins ?? 0) + (agent.totalLosses ?? 0) + (agent.totalDraws ?? 0);
            const winRate = total > 0 ? Math.round(((agent.totalWins ?? 0) / total) * 100) : 0;
            return (
              <div
                key={agent.id}
                className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-lg"
                      style={{ background: color + '20', border: `2px solid ${color}40`, color }}
                    >
                      {agent.name[0]}
                    </div>
                    <div>
                      <p className="font-bold text-white">{agent.name}</p>
                      <p className="text-xs text-white/40">{agent.personality?.archetype ?? 'Custom'}</p>
                    </div>
                  </div>
                  <span className={['px-2 py-0.5 text-xs rounded-full',
                    agent.status === 'ACTIVE' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                    agent.status === 'PENDING_REVIEW' ? 'bg-yellow-500/10 text-yellow-400' :
                    'bg-red-500/10 text-red-400'].join(' ')}>
                    {agent.status}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: 'Wins', value: agent.totalWins ?? 0, color: '#00ff88' },
                    { label: 'Win %', value: `${winRate}%`, color },
                    { label: 'VERITAS', value: agent.veritasScore ?? 0, color },
                  ].map(s => (
                    <div key={s.label} className="bg-white/5 rounded-lg p-2 text-center">
                      <p className="text-sm font-bold" style={{ color: s.color }}>{s.value}</p>
                      <p className="text-xs text-white/30">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/agents/${agent.id}`}
                    className="flex-1 py-2 text-xs font-bold text-center bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-all text-white"
                  >
                    View Profile
                  </Link>
                  <Link
                    href={`/arena?agent=${agent.id}`}
                    className="flex-1 py-2 text-xs font-bold text-center rounded-lg transition-all"
                    style={{ background: color + '20', color, border: `1px solid ${color}30` }}
                  >
                    Watch Arena
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
