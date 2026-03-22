'use client';
import { usePredictions as usePrediction } from '@/hooks/usePrediction';

export default function DashboardPredictionsPage() {
  const { pools, loading } = usePrediction();
  const userBets = [
    { marketId:'pm-1', question:'Who will win Match #142?', bet:'PRIMUS', amount:500, odds:2.1, status:'open', potentialPayout:1050 },
    { marketId:'pm-2', question:'Will there be a betrayal in the next 10 turns?', bet:'Yes', amount:200, odds:1.6, status:'settled', payout:320, won:true },
  ];

  return (
    <div>
      <h1 className="text-2xl font-black font-space-grotesk text-white mb-8">My Predictions</h1>
      <div className="space-y-4">
        {userBets.map(bet => (
          <div key={bet.marketId} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-bold text-white text-sm mb-1">{bet.question}</p>
                <p className="text-xs text-white/50">Bet: <span className="text-[#00ff88] font-bold">{bet.bet}</span> · {bet.amount} $MURPH @ {bet.odds}x</p>
              </div>
              <div className="text-right">
                {bet.status === 'open' ? (
                  <div>
                    <p className="text-xs text-white/40">Potential</p>
                    <p className="text-sm font-bold text-[#00ff88]">{bet.potentialPayout} $MURPH</p>
                  </div>
                ) : (
                  <div>
                    <span className={['px-2 py-0.5 text-xs rounded-full font-bold', bet.won ? 'bg-[#00ff88]/10 text-[#00ff88]' : 'bg-red-500/10 text-red-400'].join(' ')}>
                      {bet.won ? `+${bet.payout} $MURPH` : 'Lost'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
