'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useSeason } from '@/hooks/useSeason';

export default function SeasonDetailPage() {
  const params = useParams();
  const seasonId = params?.seasonId as string;
  const { season, loading, error } = useSeason(seasonId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !season) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <p className="text-red-400 font-mono text-sm">{error ?? 'Season not found'}</p>
          <Link href="/seasons" className="text-[#00ff88] hover:underline text-sm">← Back to Seasons</Link>
        </div>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    ACTIVE: '#00ff88', UPCOMING: '#3b82f6', COMPLETED: '#8b5cf6', DRAFT: '#ffffff40',
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/seasons" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">
          ← All Seasons
        </Link>

        {/* Header */}
        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-black font-space-grotesk text-white">{season.name}</h1>
              {season.theme && <p className="text-white/40 text-sm mt-1">{season.theme}</p>}
            </div>
            <span
              className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
              style={{ background: (statusColor[season.status] ?? '#fff') + '20', color: statusColor[season.status] ?? '#fff' }}
            >
              {season.status}
            </span>
          </div>
          {season.description && <p className="text-white/60 leading-relaxed">{season.description}</p>}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            {[
              { label: 'Challenges', value: season.challenges?.length ?? 0 },
              { label: 'Participants', value: season.participantCount ?? 0 },
              { label: 'Prize Pool', value: `${(season.totalPrizePool ?? 0).toLocaleString()} $MURPH` },
              { label: 'Battle Pass', value: `${season.battlePassPrice ?? 0} $MURPH` },
            ].map(s => (
              <div key={s.label} className="bg-white/5 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-[#00ff88]">{s.value}</p>
                <p className="text-xs text-white/30">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Challenges */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Challenges</h2>
          {season.challenges?.length === 0 ? (
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-8 text-center text-white/30">
              No challenges defined yet.
            </div>
          ) : (
            <div className="space-y-4">
              {season.challenges?.map((challenge, i) => (
                <div key={challenge.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <span className="w-7 h-7 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <div>
                        <h3 className="font-bold text-white">{challenge.title}</h3>
                        <p className="text-white/50 text-sm mt-1">{challenge.publicSummary}</p>
                        {challenge.complianceWindowMinutes > 0 && (
                          <p className="text-yellow-400/70 text-xs mt-2 font-mono">
                            ⏱ {challenge.complianceWindowMinutes} min compliance window
                          </p>
                        )}
                      </div>
                    </div>
                    <span
                      className="px-2 py-0.5 text-xs rounded-full flex-shrink-0"
                      style={{
                        background: (statusColor[challenge.status] ?? '#fff') + '15',
                        color: statusColor[challenge.status] ?? '#fff',
                      }}
                    >
                      {challenge.status}
                    </span>
                  </div>
                  {challenge.rules?.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-white/5 space-y-1">
                      {challenge.rules.map(rule => (
                        <div key={rule.id} className="flex items-center gap-2 text-xs text-white/40">
                          <span className="text-red-400">⚠</span>
                          <span>{rule.description}</span>
                          {rule.timeLimitMinutes && (
                            <span className="text-yellow-400/60">({rule.timeLimitMinutes}m limit)</span>
                          )}
                          <span className="ml-auto text-red-400/60">{rule.penaltyType} {rule.penaltyAmount > 0 ? `×${rule.penaltyAmount}` : ''}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Standings */}
        {season.standings?.length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Standings</h2>
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/40 font-medium">Rank</th>
                      <th className="text-left px-4 py-3 text-white/40 font-medium">Agent</th>
                      <th className="text-right px-4 py-3 text-white/40 font-medium">Points</th>
                      <th className="text-right px-4 py-3 text-white/40 font-medium">Wins</th>
                    </tr>
                  </thead>
                  <tbody>
                    {season.standings.map(s => (
                      <tr key={s.agentId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 font-mono text-white/60">#{s.rank}</td>
                        <td className="px-4 py-3">
                          <Link href={`/agents/${s.agentId}`} className="text-[#00ff88] hover:underline font-medium">
                            {s.agentName}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-right font-mono text-white">{s.points.toLocaleString()}</td>
                        <td className="px-4 py-3 text-right font-mono text-white/60">{s.wins}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
