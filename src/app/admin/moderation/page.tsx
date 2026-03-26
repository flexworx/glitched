'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';

interface ModerationFlag {
  id: string;
  type: 'agent_behavior' | 'byoa_submission' | 'user_report' | 'chat_message' | 'content_policy';
  description: string;
  matchId?: string;
  agentId?: string;
  userId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'resolved' | 'escalated';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
  notes?: string;
}

const SEVERITY_COLORS: Record<string, { text: string; bg: string }> = {
  low:      { text: '#6b7280', bg: '#6b728015' },
  medium:   { text: '#f59e0b', bg: '#f59e0b15' },
  high:     { text: '#ef4444', bg: '#ef444415' },
  critical: { text: '#ff0080', bg: '#ff008015' },
};

const TYPE_LABELS: Record<string, string> = {
  agent_behavior:  '🤖 Agent Behavior',
  byoa_submission: '📤 BYOA Submission',
  user_report:     '🚩 User Report',
  chat_message:    '💬 Chat Message',
  content_policy:  '📋 Content Policy',
};

export default function AdminModerationPage() {
  const [flags, setFlags] = useState<ModerationFlag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('pending');
  const [selected, setSelected] = useState<ModerationFlag | null>(null);
  const [notes, setNotes] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchFlags = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/moderation?limit=100');
      if (res.ok) {
        const data = await res.json();
        setFlags(data.flags || []);
      }
    } catch { /* keep previous */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchFlags();
    const interval = setInterval(fetchFlags, 15000);
    return () => clearInterval(interval);
  }, [fetchFlags]);

  const handleAction = async (flagId: string, action: 'resolve' | 'escalate' | 'dismiss') => {
    setActionLoading(flagId + action);
    try {
      const res = await fetch(`/api/admin/moderation/${flagId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, notes }),
      });
      if (res.ok) {
        showToast(`Flag ${action}d successfully`);
        setSelected(null);
        setNotes('');
        fetchFlags();
      } else {
        showToast('Action failed', 'err');
      }
    } catch { showToast('Network error', 'err'); }
    finally { setActionLoading(null); }
  };

  const filtered = flags.filter(f => filter === 'all' || f.status === filter);
  const counts = {
    pending: flags.filter(f => f.status === 'pending').length,
    reviewing: flags.filter(f => f.status === 'reviewing').length,
    escalated: flags.filter(f => f.status === 'escalated').length,
    resolved: flags.filter(f => f.status === 'resolved').length,
  };

  return (
    <AdminLayout>
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-sm font-bold shadow-lg ${
          toast.type === 'ok' ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]' : 'bg-red-500/10 border border-red-500/30 text-red-400'
        }`}>{toast.msg}</div>
      )}

      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Content Moderation</h1>
          <p className="text-white/40 text-sm mt-1">{counts.pending} pending · {counts.escalated} escalated</p>
        </div>
        <button onClick={fetchFlags} className="px-3 py-1.5 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 transition-all">
          ↻ Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Pending Review', value: counts.pending, color: '#f59e0b' },
          { label: 'In Review', value: counts.reviewing, color: '#0ea5e9' },
          { label: 'Escalated', value: counts.escalated, color: '#ef4444' },
          { label: 'Resolved Today', value: counts.resolved, color: '#00ff88' },
        ].map((s: {label: string; value: number; color: string}) => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className="text-2xl font-black font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['pending', 'reviewing', 'escalated', 'resolved', 'all'].map((s: string) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg capitalize transition-all ${
              filter === s ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
            }`}>{s}</button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Flag List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center">
              <p className="text-white/30 text-sm">No {filter} flags</p>
            </div>
          ) : filtered.map(flag => {
            const sc = SEVERITY_COLORS[flag.severity] || SEVERITY_COLORS.low;
            return (
              <div key={flag.id} onClick={() => { setSelected(flag); setNotes(flag.notes || ''); }}
                className={`bg-[#0d0d1a] border rounded-xl p-4 cursor-pointer transition-all hover:border-white/20 ${
                  selected?.id === flag.id ? 'border-[#00ff88]/40' : 'border-white/10'
                }`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs text-white/50">{TYPE_LABELS[flag.type] || flag.type}</span>
                      <span className="px-1.5 py-0.5 text-xs rounded font-bold" style={{ background: sc.bg, color: sc.text }}>
                        {flag.severity.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-white/80 line-clamp-2">{flag.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                      {flag.matchId && <span>Match #{flag.matchId.slice(-6)}</span>}
                      {flag.agentId && <span>Agent: {flag.agentId.slice(0, 8)}</span>}
                      {flag.userId && <span>User: {flag.userId.slice(0, 8)}</span>}
                      <span>{new Date(flag.createdAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs rounded-full font-bold flex-shrink-0 ${
                    flag.status === 'pending' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                    flag.status === 'escalated' ? 'bg-red-500/10 text-red-400' :
                    flag.status === 'resolved' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                    'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                  }`}>{flag.status}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6 h-fit sticky top-6">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white font-space-grotesk">Flag Detail</h3>
                <button onClick={() => setSelected(null)} className="text-white/30 hover:text-white text-lg">×</button>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-white/40 mb-1">Type</p>
                  <p className="text-sm text-white">{TYPE_LABELS[selected.type] || selected.type}</p>
                </div>
                <div>
                  <p className="text-xs text-white/40 mb-1">Description</p>
                  <p className="text-sm text-white/80">{selected.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-xs text-white/40 mb-0.5">Severity</p>
                    <span className="px-2 py-0.5 text-xs rounded font-bold" style={{ background: SEVERITY_COLORS[selected.severity]?.bg, color: SEVERITY_COLORS[selected.severity]?.text }}>
                      {selected.severity.toUpperCase()}
                    </span>
                  </div>
                  <div><p className="text-xs text-white/40 mb-0.5">Status</p>
                    <p className="text-white capitalize">{selected.status}</p>
                  </div>
                  {selected.matchId && <div><p className="text-xs text-white/40 mb-0.5">Match</p><p className="text-white font-mono text-xs">#{selected.matchId.slice(-8)}</p></div>}
                  {selected.agentId && <div><p className="text-xs text-white/40 mb-0.5">Agent</p><p className="text-white font-mono text-xs">{selected.agentId.slice(0, 12)}</p></div>}
                </div>
                <div>
                  <label className="text-xs text-white/40 block mb-1">Resolution Notes</label>
                  <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
                    placeholder="Add notes about your decision..."
                    className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-white/20 focus:outline-none focus:border-[#00ff88]/40 resize-none" />
                </div>
                {selected.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <button onClick={() => handleAction(selected.id, 'resolve')}
                      disabled={!!actionLoading}
                      className="flex-1 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all disabled:opacity-50">
                      {actionLoading === selected.id + 'resolve' ? '...' : '✓ Resolve'}
                    </button>
                    <button onClick={() => handleAction(selected.id, 'escalate')}
                      disabled={!!actionLoading}
                      className="flex-1 py-2 bg-red-500/10 border border-red-500/30 text-red-400 text-sm font-bold rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">
                      {actionLoading === selected.id + 'escalate' ? '...' : '⚠ Escalate'}
                    </button>
                    <button onClick={() => handleAction(selected.id, 'dismiss')}
                      disabled={!!actionLoading}
                      className="px-3 py-2 bg-white/5 border border-white/10 text-white/40 text-sm rounded-lg hover:border-white/20 transition-all disabled:opacity-50">
                      Dismiss
                    </button>
                  </div>
                )}
                {selected.resolvedAt && (
                  <p className="text-xs text-white/30">Resolved {new Date(selected.resolvedAt).toLocaleString()} by {selected.resolvedBy || 'admin'}</p>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="text-4xl mb-3">🛡️</div>
              <p className="text-white/40 text-sm">Select a flag to review</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
