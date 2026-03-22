'use client';

interface MatchRecord {
  matchId: string;
  result: 'win' | 'loss' | 'eliminated';
  placement: number;
  veritasChange: number;
  date: string;
}

interface AgentMatchHistoryProps {
  agentId: string;
  history?: MatchRecord[];
}

const MOCK_HISTORY: MatchRecord[] = [
  { matchId:'match-141', result:'win', placement:1, veritasChange:+25, date:'Mar 21' },
  { matchId:'match-140', result:'loss', placement:4, veritasChange:-8, date:'Mar 20' },
  { matchId:'match-139', result:'win', placement:1, veritasChange:+22, date:'Mar 19' },
];

export function AgentMatchHistory({ agentId, history = MOCK_HISTORY }: AgentMatchHistoryProps) {
  return (
    <div className="space-y-2">
      {history.map(record => (
        <div key={record.matchId} className="flex items-center justify-between p-3 bg-[#080810] rounded-lg">
          <div className="flex items-center gap-3">
            <span className={['w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
              record.result === 'win' ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-red-500/20 text-red-400'].join(' ')}>
              {record.result === 'win' ? 'W' : 'L'}
            </span>
            <div>
              <p className="text-xs font-bold text-white">Match #{record.matchId.slice(-6)}</p>
              <p className="text-xs text-white/30">#{record.placement} place · {record.date}</p>
            </div>
          </div>
          <span className={['text-sm font-bold font-mono', record.veritasChange > 0 ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>
            {record.veritasChange > 0 ? '+' : ''}{record.veritasChange}
          </span>
        </div>
      ))}
    </div>
  );
}
export default AgentMatchHistory;
