'use client';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';
import Link from 'next/link';

type MatchStatus = 'PENDING' | 'RUNNING' | 'PAUSED' | 'ENDED' | 'CANCELLED';

interface AdminMatch {
  id: string;
  status: MatchStatus;
  currentTurn: number;
  maxTurns: number;
  dramaScore: number;
  currentPhase: string;
  gameMode: string;
  createdAt: string;
  participants: { agentId: string; agentName: string; status: string; score: number }[];
}

const STATUS_COLORS: Record<string, { text: string; bg: string; dot: string }> = {
  RUNNING:   { text: '#00ff88', bg: '#00ff8815', dot: '#00ff88' },
  PENDING:   { text: '#f59e0b', bg: '#f59e0b15', dot: '#f59e0b' },
  PAUSED:    { text: '#0ea5e9', bg: '#0ea5e915', dot: '#0ea5e9' },
  ENDED:     { text: '#6b7280', bg: '#6b728015', dot: '#6b7280' },
  CANCELLED: { text: '#ef4444', bg: '#ef444415', dot: '#ef4444' },
};

export default function AdminMatchesPage() {
  const { startMatch, stopMatch } = useAdmin();
  const [matches, setMatches] = useState<AdminMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ msg: string; type: 'ok' | 'err' } | null>(null);

  const showToast = (msg: string, type: 'ok' | 'err' = 'ok') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/matches?limit=50');
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches || []);
      }
    } catch { /* keep previous data */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    fetchMatches();
    const interval = setInterval(fetchMatches, 10000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const handleStop = async (matchId: string) => {
    setActionLoading(matchId);
    try {
      await stopMatch(matchId);
      showToast(`Match ${matchId.slice(-6)} stopped`);
      fetchMatches();
    } catch { showToast('Failed to stop match', 'err'); }
    finally { setActionLoading(null); }
  };

  const handleForceStart = async () => {
    setActionLoading('new');
    try {
      await startMatch([]);
      showToast('New match started');
      fetchMatches();
    } catch { showToast('Failed to start match', 'err'); }
    finally { setActionLoading(null); }
  };

  const filtered = matches.filter(m => {
    if (filter !== 'ALL' && m.status !== filter) return false;
    if (search && !m.id.toLowerCase().includes(search.toLowerCase()) &&
        !m.gameMode?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const stats = {
    running: matches.filter(m => m.status === 'RUNNING').length,
    pending: matches.filter(m => m.status === 'PENDING').length,
    ended: matches.filter(m => m.status === 'ENDED').length,
    avgDrama: matches.length ? Math.round(matches.reduce((a, m) => a + (m.dramaScore || 0), 0) / matches.length) : 0,
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
          <h1 className="text-2xl font-black font-space-grotesk text-white">Match Control</h1>
          <p className="text-white/40 text-sm mt-1">{stats.running} live · {stats.pending} pending · {stats.ended} ended</p>
        </div>
        <button onClick={handleForceStart} disabled={actionLoading === 'new'}
          className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 flex items-center gap-2">
          {actionLoading === 'new' ? <span className="w-4 h-4 border-2 border-[#0a0a0f]/30 border-t-[#0a0a0f] rounded-full animate-spin" /> : '▶'}
          Force Start Match
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Live Matches', value: stats.running, color: '#00ff88' },
          { label: 'In Queue', value: stats.pending, color: '#f59e0b' },
          { label: 'Completed Today', value: stats.ended, color: '#6b7280' },
          { label: 'Avg Drama Score', value: stats.avgDrama, color: '#ff6600' },
        ].map((s: {label: string; value: string|number; color: string}) => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className="text-2xl font-black font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by ID or game mode..."
          className="px-3 py-2 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-[#00ff88]/50 w-full sm:w-64" />
        <div className="flex gap-2 flex-wrap">
          {['ALL', 'RUNNING', 'PENDING', 'PAUSED', 'ENDED'].map((s: string) => (
            <button key={s} onClick={() => setFilter(s)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                filter === s ? 'bg-[#00ff88]/20 text-[#00ff88] border border-[#00ff88]/40' : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
              }`}>{s}</button>
          ))}
        </div>
      </div>

      <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {['Match ID', 'Status', 'Mode', 'Progress', 'Drama', 'Agents', 'Actions'].map((h: string) => (
                  <th key={h} className="px-4 py-3 text-left text-xs text-white/40 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center">
                  <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin mx-auto" />
                </td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">No matches found</td></tr>
              ) : filtered.map(match => {
                const sc = STATUS_COLORS[match.status] || STATUS_COLORS.ENDED;
                const progress = match.maxTurns > 0 ? Math.round((match.currentTurn / match.maxTurns) * 100) : 0;
                return (
                  <tr key={match.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                    <td className="px-4 py-3">
                      <Link href={`/admin/matches/${match.id}`} className="font-mono text-[#00ff88] hover:underline text-xs">
                        #{match.id.slice(-8).toUpperCase()}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 text-xs rounded-full flex items-center gap-1 w-fit font-bold" style={{ background: sc.bg, color: sc.text }}>
                        <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: sc.dot }} />
                        {match.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-white/60 text-xs">{match.gameMode || 'SOCIAL_ELIMINATION'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00ff88] rounded-full" style={{ width: `${progress}%` }} />
                        </div>
                        <span className="text-xs text-white/40 font-mono">{match.currentTurn}/{match.maxTurns}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-sm" style={{ color: match.dramaScore > 70 ? '#ff6600' : match.dramaScore > 40 ? '#f59e0b' : '#6b7280' }}>
                        {match.dramaScore || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {(match.participants || []).slice(0, 4).map((p: {agentId: string; agentName: string; status: string; score: number}) => (
                          <span key={p.agentId} className={`text-xs px-1.5 py-0.5 rounded font-mono ${
                            p.status === 'alive' ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-white/5 text-white/30 line-through'
                          }`}>{p.agentName?.slice(0, 6) || p.agentId.slice(0, 6)}</span>
                        ))}
                        {(match.participants || []).length > 4 && (
                          <span className="text-xs text-white/30">+{match.participants.length - 4}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/matches/${match.id}`} className="px-2.5 py-1 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:border-white/20 hover:text-white transition-all">View</Link>
                        {match.status === 'RUNNING' && (
                          <button onClick={() => handleStop(match.id)} disabled={actionLoading === match.id}
                            className="px-2.5 py-1 bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">
                            {actionLoading === match.id ? '...' : 'Stop'}
                          </button>
                        )}
                        {match.status === 'ENDED' && (
                          <Link href={`/arena/${match.id}`} className="px-2.5 py-1 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 text-[#0ea5e9] text-xs rounded-lg hover:bg-[#0ea5e9]/20 transition-all">Replay</Link>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
