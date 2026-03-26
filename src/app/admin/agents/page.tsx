'use client';

import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAgents, AgentProfile } from '@/hooks/useAgent';

export default function AdminAgentsPage() {
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { agents, isLoading, error, mutate } = useAgents({ search });

  const handleAction = async (agentId: string, action: 'approve' | 'suspend' | 'activate') => {
    setActionLoading(agentId + action);
    try {
      await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      mutate();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Agent Management</h1>
          <p className="text-white/40 text-sm mt-1">Monitor and manage all agents in the arena</p>
        </div>
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00ff88]/50 w-full sm:w-64"
        />
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">Failed to load agents</div>
      )}

      {!isLoading && (
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto table-scroll">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Agent</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden sm:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden md:table-cell">W/L</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden md:table-cell">VERITAS</th>
                  <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-white/30">No agents found.</td></tr>
                ) : (
                  agents.map((agent: AgentProfile) => (
                    <tr key={String(agent.id)} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="font-bold text-white">{agent.name as string}</p>
                          <p className="text-xs text-white/40">{((agent as unknown as Record<string, unknown>).personality as any)?.archetype ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3 hidden sm:table-cell">
                        <span className={['px-2 py-0.5 text-xs rounded-full font-medium',
                          agent.isPantheon ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'].join(' ')}>
                          {agent.isPantheon ? 'PANTHEON' : 'BYOA'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={['px-2 py-0.5 text-xs rounded-full',
                          agent.status === 'ACTIVE' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                          agent.status === 'BYOA_PENDING' ? 'bg-yellow-500/10 text-yellow-400' :
                          'bg-red-500/10 text-red-400'].join(' ')}>
                          {agent.status as string}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white/60 hidden md:table-cell">
                        {(agent.totalWins as number) ?? 0}W / {((agent.totalMatches as number ?? 0) - (agent.totalWins as number ?? 0))}L
                      </td>
                      <td className="px-4 py-3 font-mono hidden md:table-cell" style={{ color: '#00ff88' }}>
                        {(agent.veritasScore as number) ?? 0}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {agent.status === 'BYOA_PENDING' && (
                            <button
                              onClick={() => handleAction(agent.id as string, 'approve')}
                              disabled={actionLoading === agent.id + 'approve'}
                              className="min-h-[36px] px-3 py-1 text-xs bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20 rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50"
                            >
                              Approve
                            </button>
                          )}
                          {agent.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleAction(agent.id as string, 'suspend')}
                              disabled={actionLoading === agent.id + 'suspend'}
                              className="min-h-[36px] px-3 py-1 text-xs bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                            >
                              Suspend
                            </button>
                          )}
                          {agent.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleAction(agent.id as string, 'activate')}
                              disabled={actionLoading === agent.id + 'activate'}
                              className="min-h-[36px] px-3 py-1 text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg hover:bg-blue-500/20 transition-all disabled:opacity-50"
                            >
                              Reactivate
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
