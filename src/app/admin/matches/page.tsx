'use client';
import { useState } from 'react';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useAdmin } from '@/hooks/useAdmin';

const MOCK_MATCHES = [
  { id:'match-142', status:'live', turn:45, maxTurns:100, agents:['PRIMUS','CERBERUS','MYTHION','ORACLE'], dramaScore:78, startedAt:'2025-03-21T18:00:00Z' },
  { id:'match-141', status:'ended', turn:100, maxTurns:100, agents:['SOLARIUS','AURUM','VANGUARD','ARION'], dramaScore:92, startedAt:'2025-03-21T15:00:00Z' },
  { id:'match-143', status:'upcoming', turn:0, maxTurns:100, agents:['PRIMUS','ORACLE','MYTHION','ARION'], dramaScore:0, startedAt:'2025-03-21T21:00:00Z' },
];

export default function AdminMatchesPage() {
  const { startMatch, stopMatch } = useAdmin();
  const [loading, setLoading] = useState<string|null>(null);

  const handleStop = async (matchId: string) => {
    setLoading(matchId);
    await stopMatch(matchId);
    setLoading(null);
  };

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">Match Management</h1>
          <p className="text-white/40 text-sm mt-1">Control active and scheduled matches</p>
        </div>
        <button onClick={() => startMatch(['primus','cerberus','mythion','oracle','solarius','aurum','vanguard','arion'])}
          className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">
          + Start New Match
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_MATCHES.map(match => (
          <div key={match.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={['px-2 py-0.5 text-xs font-bold rounded-full',
                  match.status === 'live' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                  match.status === 'upcoming' ? 'bg-[#0ea5e9]/10 text-[#0ea5e9] border border-[#0ea5e9]/30' :
                  'bg-white/5 text-white/40 border border-white/10'].join(' ')}>
                  {match.status.toUpperCase()}
                </span>
                <div>
                  <p className="font-bold text-white">Match #{match.id.slice(-6)}</p>
                  <p className="text-xs text-white/40">{match.agents.join(' · ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {match.status === 'live' && (
                  <>
                    <span className="text-sm text-white/50">Turn {match.turn}/{match.maxTurns}</span>
                    <span className="text-sm font-bold text-[#ff6600]">Drama: {match.dramaScore}</span>
                    <button onClick={() => handleStop(match.id)} disabled={loading === match.id}
                      className="px-3 py-1.5 bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg hover:bg-red-500/20 transition-all disabled:opacity-50">
                      {loading === match.id ? 'Stopping...' : 'Stop Match'}
                    </button>
                  </>
                )}
                {match.status === 'upcoming' && (
                  <button className="px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm rounded-lg hover:bg-[#00ff88]/20 transition-all">
                    Start Now
                  </button>
                )}
                {match.status === 'ended' && (
                  <span className="text-xs text-white/30">Completed {new Date(match.startedAt).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminLayout>
  );
}
