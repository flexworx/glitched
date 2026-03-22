'use client';
import { usePredictions as usePrediction } from '@/hooks/usePrediction';
import { PredictionCard } from './PredictionCard';

export function PredictionWidget({ matchId }: { matchId?: string }) {
  const { pools, loading, placeBet } = usePrediction();

  if (loading) return <div className="h-20 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" /></div>;

  if (!pools.length) return <p className="text-white/30 text-sm text-center py-4">No open pools</p>;

  return (
    <div className="space-y-3">
      {pools.slice(0, 2).map((market: any) => (
        <PredictionCard key={market.id} market={market} onBet={(matchId, predictionType, predictionData, amount) => placeBet(matchId, predictionType, predictionData, amount)}  />
      ))}
    </div>
  );
}
export default PredictionWidget;
