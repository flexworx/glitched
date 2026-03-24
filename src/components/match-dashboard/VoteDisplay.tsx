'use client';

import type { CouncilVote } from '@/lib/types/glitch-engine';

interface VoteDisplayProps {
  vote: CouncilVote;
}

export function VoteDisplay({ vote }: VoteDisplayProps) {
  const { votes, result } = vote;
  const { voteBreakdown, eliminatedAgentId, wasTiebreak, tiebreakReason } = result;

  // Sort targets by vote count descending
  const sorted = Object.entries(voteBreakdown).sort(([, a], [, b]) => b - a);
  const maxVotes = sorted.length > 0 ? sorted[0][1] : 1;

  // Build voter lookup: target -> list of voter IDs
  const votersByTarget: Record<string, string[]> = {};
  for (const [voter, target] of Object.entries(votes)) {
    if (!votersByTarget[target]) votersByTarget[target] = [];
    votersByTarget[target].push(voter);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest">
          Council Vote — Round {vote.round}
        </h3>
        {wasTiebreak && (
          <span className="font-jetbrains text-[10px] text-neon-yellow px-1.5 py-0.5 border border-neon-yellow/30 rounded bg-neon-yellow/10">
            TIEBREAK
          </span>
        )}
      </div>

      {/* Bar chart */}
      <div className="space-y-2">
        {sorted.map(([agentId, count]) => {
          const isEliminated = agentId === eliminatedAgentId;
          const barPct = maxVotes > 0 ? (count / maxVotes) * 100 : 0;
          const barColor = isEliminated ? '#FF006E' : '#00D4FF';
          const voters = votersByTarget[agentId] || [];

          return (
            <div key={agentId} className="space-y-0.5">
              <div className="flex items-center justify-between">
                <span className={[
                  'font-space-grotesk text-xs font-bold',
                  isEliminated ? 'text-status-eliminated' : 'text-white',
                ].join(' ')}>
                  {agentId}
                  {isEliminated && (
                    <span className="ml-1.5 font-orbitron text-[9px] text-status-eliminated">
                      ELIMINATED
                    </span>
                  )}
                </span>
                <span className="font-jetbrains text-xs text-gray-400">
                  {count} vote{count !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Bar */}
              <div className="w-full h-3 bg-white/5 rounded overflow-hidden">
                <div
                  className="h-full rounded transition-all duration-500"
                  style={{
                    width: `${barPct}%`,
                    background: isEliminated
                      ? 'linear-gradient(90deg, #FF006E80, #FF006E)'
                      : 'linear-gradient(90deg, #00D4FF60, #00D4FF)',
                    boxShadow: isEliminated ? '0 0 8px #FF006E60' : undefined,
                  }}
                />
              </div>

              {/* Voters */}
              <div className="flex flex-wrap gap-1">
                {voters.map((voter) => (
                  <span
                    key={voter}
                    className="font-jetbrains text-[9px] px-1 py-0.5 rounded bg-white/5 text-gray-500"
                  >
                    {voter}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Tiebreak reason */}
      {wasTiebreak && tiebreakReason && (
        <div className="text-[11px] font-jetbrains text-neon-yellow/80 border border-neon-yellow/20 rounded px-2 py-1.5 bg-neon-yellow/5">
          Tiebreak: {tiebreakReason}
        </div>
      )}
    </div>
  );
}

export default VoteDisplay;
