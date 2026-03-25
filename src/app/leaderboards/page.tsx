'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLeaderboard } from '@/hooks/useLeaderboard';

export default function LeaderboardsPage() {
  const [limit, setLimit] = useState(50);
  const { entries, loading, error } = useLeaderboard(limit);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white pt-16">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-black font-space-grotesk text-white">Leaderboards</h1>
          <p className="text-white/40 text-sm mt-1">Top predictors ranked by $MURPH earned</p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <>
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
              <div className="overflow-x-auto table-scroll">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left px-4 py-3 text-white/40 font-medium">Rank</th>
                      <th className="text-left px-4 py-3 text-white/40 font-medium">Player</th>
                      <th className="text-right px-4 py-3 text-white/40 font-medium">$MURPH Balance</th>
                      <th className="text-right px-4 py-3 text-white/40 font-medium hidden sm:table-cell">Win Rate</th>
                      <th className="text-right px-4 py-3 text-white/40 font-medium hidden md:table-cell">Predictions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {entries.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-white/30">No leaderboard data yet.</td>
                      </tr>
                    ) : (
                      entries.map(entry => (
                        <tr key={entry.userId} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <span className={`font-mono font-bold ${
                              entry.rank === 1 ? 'text-yellow-400' :
                              entry.rank === 2 ? 'text-gray-300' :
                              entry.rank === 3 ? 'text-orange-400' : 'text-white/40'
                            }`}>
                              #{entry.rank}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center text-[#00ff88] text-xs font-bold flex-shrink-0">
                                {(entry.displayName ?? entry.username)[0]?.toUpperCase()}
                              </div>
                              <span className="font-medium text-white">{entry.displayName ?? entry.username}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#00ff88] font-bold">
                            {entry.murphBalance.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/60 hidden sm:table-cell">
                            {entry.winRate.toFixed(1)}%
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-white/40 hidden md:table-cell">
                            {entry.predictionCount}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {entries.length >= limit && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => setLimit(l => l + 50)}
                  className="px-6 py-2 bg-white/5 border border-white/10 text-white/60 text-sm rounded-xl hover:bg-white/10 transition-all"
                >
                  Load more
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
