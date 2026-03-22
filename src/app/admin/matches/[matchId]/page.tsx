'use client';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { useMatch } from '@/hooks/useMatch';
import Link from 'next/link';

export default function AdminMatchDetailPage({ params }: { params: { matchId: string } }) {
  const { match, loading } = useMatch(params.matchId);

  return (
    <AdminLayout>
      <Link href="/admin/matches" className="text-sm text-white/40 hover:text-white transition-colors mb-6 block">← All Matches</Link>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-6">Match #{params.matchId.slice(-6)}</h1>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
        </div>
      ) : match ? (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-white font-space-grotesk mb-4">Match Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-white/40">Status</span><span className="text-white capitalize">{match.status}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Turn</span><span className="text-white">{match.currentTurn}/{match.maxTurns}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Drama Score</span><span className="text-[#ff6600]">{match.dramaScore}</span></div>
              <div className="flex justify-between"><span className="text-white/40">Phase</span><span className="text-white capitalize">{match.currentPhase.replace('_',' ')}</span></div>
            </div>
          </div>
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-white font-space-grotesk mb-4">Agents</h3>
            <div className="space-y-2">
              {match.participants.map((agent: any) => (
                <div key={agent.id} className="flex items-center justify-between text-sm">
                  <span className="font-bold" style={{ color: agent.color }}>{agent.name}</span>
                  <span className={agent.status === 'alive' ? 'text-[#00ff88]' : 'text-white/30'}>{agent.status === 'alive' ? `${agent.hp} HP` : 'ELIMINATED'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-white/40">Match not found</p>
      )}
    </AdminLayout>
  );
}
