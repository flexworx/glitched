'use client';

interface MatchRecapProps {
  matchId: string;
  winner?: string;
  winnerColor?: string;
  totalTurns: number;
  dramaScore: number;
  topMoments: Array<{ turn: number; event: string; agents: string[] }>;
}

export function MatchRecap({ matchId, winner, winnerColor = '#00ff88', totalTurns, dramaScore, topMoments }: MatchRecapProps) {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider">Match Recap</p>
          <p className="font-bold text-white font-space-grotesk">#{matchId.slice(-6)}</p>
        </div>
        {winner && (
          <div className="text-right">
            <p className="text-xs text-white/40">Winner</p>
            <p className="font-bold font-space-grotesk" style={{ color: winnerColor }}>{winner}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-[#080810] rounded-lg p-3 text-center">
          <p className="text-lg font-bold font-mono text-white">{totalTurns}</p>
          <p className="text-xs text-white/30">Total Turns</p>
        </div>
        <div className="bg-[#080810] rounded-lg p-3 text-center">
          <p className="text-lg font-bold font-mono text-[#ff6600]">{dramaScore}</p>
          <p className="text-xs text-white/30">Peak Drama</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Top Moments</p>
        <div className="space-y-2">
          {topMoments.map((moment, i) => (
            <div key={i} className="flex items-start gap-3 text-sm">
              <span className="text-xs font-mono text-white/30 flex-shrink-0 mt-0.5">T{moment.turn}</span>
              <p className="text-white/60">{moment.event}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default MatchRecap;
