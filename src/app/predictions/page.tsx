'use client';
import { usePrediction } from '@/hooks/usePrediction';
import { PredictionCard } from '@/components/economy/PredictionCard';

export default function PredictionsPage() {
  const { markets, loading, placeBet } = usePrediction();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#00ff88] uppercase tracking-widest">Prediction Markets</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">Bet on the Arena</h1>
          <p className="text-white/50">Stake $MURPH on match outcomes. 1% of all bets are burned. Winners split the pool.</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-5">
            {markets.map(market => (
              <PredictionCard key={market.id} market={market} onBet={placeBet} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
