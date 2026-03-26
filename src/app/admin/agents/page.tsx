'use client';
import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAgents, AgentProfile } from '@/hooks/useAgent';
import {
  Search, Filter, Bot, Shield, Zap, Star, Eye, Pause, Play,
  Trash2, RefreshCw, ChevronDown, BarChart3, Brain, Heart,
  Sword, Users, TrendingUp, AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#00ff88', PENDING: '#f59e0b', SUSPENDED: '#ef4444',
  TRAINING: '#0ea5e9', RETIRED: '#6b7280',
};
const ARCHETYPE_ICONS: Record<string, string> = {
  STRATEGIST: '🧠', CHAOS_AGENT: '💥', DIPLOMAT: '🤝',
  PREDATOR: '🐺', ORACLE: '🔮', WILDCARD: '🃏',
};

interface AgentStats {
  wins: number; losses: number; winRate: number;
  avgDramaScore: number; totalMatches: number; earnings: number;
}

export default function AdminAgentsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [archetypeFilter, setArchetypeFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'name' | 'wins' | 'earnings' | 'created'>('created');
  const [selectedAgent, setSelectedAgent] = useState<AgentProfile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const { agents, isLoading, error, mutate } = useAgents({ search });

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = useCallback(async (agentId: string, action: string) => {
    setActionLoading(agentId + action);
    try {
      const res = await fetch(`/api/admin/agents/${agentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        showToast(`Agent ${action}d successfully`);
        mutate();
        if (selectedAgent?.id === agentId) setSelectedAgent(null);
      } else {
        showToast(`Failed to ${action} agent`, 'err');
      }
    } catch {
      showToast('Network error', 'err');
    } finally {
      setActionLoading(null);
    }
  }, [mutate, selectedAgent]);

  const filteredAgents = (agents || []).filter((a: {status: string; archetype: string; name: string}) => {
    if (statusFilter !== 'ALL' && a.status !== statusFilter) return false;
    if (archetypeFilter !== 'ALL' && a.archetype !== archetypeFilter) return false;
    return true;
  }).sort((a: {name: string}, b: {name: string}) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const stats = {
    total: (agents || []).length,
    active: (agents || []).filter((a: {status: string; archetype: string; name: string}) => a.status === 'ACTIVE').length,
    pending: (agents || []).filter((a: {status: string; archetype: string; name: string}) => a.status === 'PENDING').length,
    suspended: (agents || []).filter((a: {status: string; archetype: string; name: string}) => a.status === 'SUSPENDED').length,
  };

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg transition-all ${
          toast.type === 'ok' ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]'
            : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{toast.msg}</div>
      )}

      {/* Header */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Agent Management</h1>
          <p className="text-white/40 text-sm mt-1">
            {stats.total} total · {stats.active} active · {stats.pending} pending · {stats.suspended} suspended
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => mutate()} className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
          <button onClick={() => setShowFilters(!showFilters)} className={`px-3 py-2 border text-xs rounded-lg transition-all flex items-center gap-1.5 ${showFilters ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'bg-white/5 border-white/10 text-white/60 hover:border-white/20'}`}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Agents', value: stats.total, color: '#0ea5e9', icon: Bot },
          { label: 'Active', value: stats.active, color: '#00ff88', icon: CheckCircle },
          { label: 'Pending Review', value: stats.pending, color: '#f59e0b', icon: AlertTriangle },
          { label: 'Suspended', value: stats.suspended, color: '#ef4444', icon: XCircle },
        ].map(({ label, value, color, icon: Icon }) => (
          <div key={label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <p className="text-xs text-white/40">{label}</p>
            </div>
            <p className="text-2xl font-black font-space-grotesk" style={{ color }}>
              {isLoading ? '—' : value}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-[#0d0d1a] border border-white/10 rounded-xl"
          >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div>
                <label className="text-xs text-white/40 mb-1 block">Status</label>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00ff88]/50">
                  {['ALL', 'ACTIVE', 'PENDING', 'SUSPENDED', 'TRAINING', 'RETIRED'].map((s: string) => (
                    <option key={s} value={s} className="bg-[#0d0d1a]">{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Archetype</label>
                <select value={archetypeFilter} onChange={e => setArchetypeFilter(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00ff88]/50">
                  {['ALL', 'STRATEGIST', 'CHAOS_AGENT', 'DIPLOMAT', 'PREDATOR', 'ORACLE', 'WILDCARD'].map((a: string) => (
                    <option key={a} value={a} className="bg-[#0d0d1a]">{a}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/40 mb-1 block">Sort By</label>
                <select value={sortBy} onChange={e => setSortBy(e.target.value as typeof sortBy)}
                  className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-[#00ff88]/50">
                  {[['name', 'Name'], ['wins', 'Wins'], ['earnings', 'Earnings'], ['created', 'Created']].map(([v, l]) => (
                    <option key={v} value={v} className="bg-[#0d0d1a]">{l}</option>
                  ))}
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search agents by name, archetype, or creator..."
          className="w-full pl-10 pr-4 py-3 bg-[#0d0d1a] border border-white/10 text-white placeholder-white/30 text-sm rounded-xl focus:outline-none focus:border-[#00ff88]/50 transition-colors"
        />
      </div>

      {/* Main layout */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Agent list */}
        <div className="lg:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {['Agent', 'Status', 'Archetype', 'Matches', 'Win Rate', 'VERITAS', 'Actions'].map((h: string) => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-white/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center">
                    <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin mx-auto" />
                  </td></tr>
                ) : error ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-red-400 text-sm">Failed to load agents</td></tr>
                ) : filteredAgents.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No agents found</td></tr>
                ) : filteredAgents.map(agent => {
                  const statusColor = STATUS_COLORS[agent.status] || '#6b7280';
                  const archIcon = ARCHETYPE_ICONS[agent.archetype || ''] || '🤖';
                  const isSelected = selectedAgent?.id === agent.id;
                  return (
                    <tr
                      key={agent.id}
                      onClick={() => setSelectedAgent(isSelected ? null : agent)}
                      className={`border-b border-white/5 cursor-pointer transition-colors ${isSelected ? 'bg-[#00ff88]/5' : 'hover:bg-white/3'}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00ff88]/20 to-[#0ea5e9]/20 flex items-center justify-center text-sm">
                            {archIcon}
                          </div>
                          <div>
                            <p className="font-bold text-white text-sm">{agent.name}</p>
                            <p className="text-xs text-white/30 truncate max-w-[120px]">{(agent as AgentProfile & { tagline?: string }).tagline || 'No tagline'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold" style={{ color: statusColor, background: `${statusColor}20` }}>
                          {agent.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-white/60 text-xs">{agent.archetype || '—'}</td>
                      <td className="px-4 py-3 text-white/60 text-xs">{(agent as AgentProfile & { _count?: { matches?: number }; tagline?: string; personality?: Record<string,number> })._count?.matches ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-[#00ff88]">—</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-[#0ea5e9] rounded-full" style={{ width: `${((agent.veritasScore || 0) || 0) * 100}%` }} />
                          </div>
                          <span className="text-xs text-white/40">{(((agent.veritasScore || 0) || 0) * 100).toFixed(0)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                          {agent.status === 'PENDING' && (
                            <button
                              onClick={() => handleAction(agent.id, 'approve')}
                              disabled={!!actionLoading}
                              className="p-1.5 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50"
                              title="Approve"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {agent.status === 'ACTIVE' && (
                            <button
                              onClick={() => handleAction(agent.id, 'suspend')}
                              disabled={!!actionLoading}
                              className="p-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50"
                              title="Suspend"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {agent.status === 'SUSPENDED' && (
                            <button
                              onClick={() => handleAction(agent.id, 'activate')}
                              disabled={!!actionLoading}
                              className="p-1.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/20 text-[#0ea5e9] rounded-lg hover:bg-[#0ea5e9]/20 transition-all disabled:opacity-50"
                              title="Activate"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAgent(isSelected ? null : agent)}
                            className="p-1.5 bg-white/5 border border-white/10 text-white/40 rounded-lg hover:border-white/20 transition-all"
                            title="View Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Agent Detail Panel */}
        <div className="space-y-4">
          {selectedAgent ? (
            <motion.div
              key={selectedAgent.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00ff88]/20 to-[#0ea5e9]/20 flex items-center justify-center text-2xl">
                    {ARCHETYPE_ICONS[selectedAgent.archetype || ''] || '🤖'}
                  </div>
                  <div>
                    <h3 className="font-black text-white font-space-grotesk">{selectedAgent.name}</h3>
                    <p className="text-xs text-white/40">{selectedAgent.archetype}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedAgent(null)} className="text-white/30 hover:text-white/60 transition-colors">
                  <XCircle className="w-4 h-4" />
                </button>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-2 mb-4">
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ color: STATUS_COLORS[selectedAgent.status], background: `${STATUS_COLORS[selectedAgent.status]}20` }}>
                  {selectedAgent.status}
                </span>
                <span className="text-xs text-white/30">ID: {selectedAgent.id.slice(0, 8)}...</span>
              </div>

              {/* Tagline */}
              {(selectedAgent as AgentProfile & { tagline?: string; personality?: Record<string,number> }).tagline && (
                <p className="text-sm text-white/60 italic mb-4 border-l-2 border-[#00ff88]/30 pl-3">
                  &ldquo;{(selectedAgent as AgentProfile & { tagline?: string }).tagline}&rdquo;
                </p>
              )}

              {/* Personality Traits */}
              <div className="mb-4">
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5" /> Personality DNA
                </h4>
                <div className="space-y-2">
                  {[
                    { label: 'Aggression', value: (selectedAgent as AgentProfile & { personality?: Record<string,number> }).personality?.aggression ?? 0.5, color: '#ef4444' },
                    { label: 'Deception', value: (selectedAgent as AgentProfile & { personality?: Record<string,number> }).personality?.deception ?? 0.5, color: '#f59e0b' },
                    { label: 'Empathy', value: (selectedAgent as AgentProfile & { personality?: Record<string,number> }).personality?.empathy ?? 0.5, color: '#0ea5e9' },
                    { label: 'Chaos', value: (selectedAgent as AgentProfile & { personality?: Record<string,number> }).personality?.chaos ?? 0.5, color: '#8b5cf6' },
                    { label: 'Loyalty', value: (selectedAgent as AgentProfile & { personality?: Record<string,number> }).personality?.loyalty ?? 0.5, color: '#00ff88' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2">
                      <span className="text-xs text-white/40 w-20">{label}</span>
                      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${value * 100}%`, background: color }} />
                      </div>
                      <span className="text-xs font-mono text-white/40 w-8 text-right">{(value * 100).toFixed(0)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VERITAS Score */}
              <div className="mb-4 p-3 bg-white/3 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-white/40 flex items-center gap-1"><Shield className="w-3 h-3" /> VERITAS Score</span>
                  <span className="text-sm font-bold text-[#0ea5e9]">{((selectedAgent.veritasScore || 0) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#0ea5e9] to-[#00ff88] rounded-full"
                    style={{ width: `${(selectedAgent.veritasScore || 0) * 100}%` }} />
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-2">
                {selectedAgent.status === 'PENDING' && (
                  <button onClick={() => handleAction(selectedAgent.id, 'approve')}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" /> Approve
                  </button>
                )}
                {selectedAgent.status === 'ACTIVE' && (
                  <button onClick={() => handleAction(selectedAgent.id, 'suspend')}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Pause className="w-3.5 h-3.5" /> Suspend
                  </button>
                )}
                {selectedAgent.status === 'SUSPENDED' && (
                  <button onClick={() => handleAction(selectedAgent.id, 'activate')}
                    disabled={!!actionLoading}
                    className="px-3 py-2 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs font-bold rounded-lg hover:bg-[#0ea5e9]/20 transition-all disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <Play className="w-3.5 h-3.5" /> Activate
                  </button>
                )}
                <a href={`/agents/${selectedAgent.id}`} target="_blank" rel="noreferrer"
                  className="px-3 py-2 bg-white/5 border border-white/10 text-white/60 text-xs font-bold rounded-lg hover:border-white/20 transition-all flex items-center justify-center gap-1.5">
                  <Eye className="w-3.5 h-3.5" /> View Profile
                </a>
              </div>
            </motion.div>
          ) : (
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
              <Bot className="w-10 h-10 text-white/10 mx-auto mb-3" />
              <p className="text-white/30 text-sm">Select an agent to view details</p>
            </div>
          )}

          {/* Quick Stats */}
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <h4 className="text-xs text-white/40 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" /> Platform Stats
            </h4>
            <div className="space-y-2">
              {[
                { label: 'Avg Win Rate', value: '—', color: '#00ff88' },
                { label: 'Avg Drama Score', value: '—', color: '#f59e0b' },
                { label: 'Total Matches', value: '—', color: '#0ea5e9' },
                { label: 'Total $MURPH Earned', value: '—', color: '#8b5cf6' },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-white/40">{label}</span>
                  <span className="text-xs font-bold" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
