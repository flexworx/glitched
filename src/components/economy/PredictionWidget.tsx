'use client';
import { usePrediction } from '@/hooks/usePrediction';
import { PredictionCard } from './PredictionCard';

export function PredictionWidget({ matchId }: { matchId?: string }) {
  const { markets, loading, placeBet } = usePrediction(matchId);

  if (loading) return <div className="h-20 flex items-center justify-center"><div className="w-5 h-5 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" /></div>;

  if (!markets.length) return <p className="text-white/30 text-sm text-center py-4">No open markets</p>;

  return (
    <div className="space-y-3">
      {markets.slice(0, 2).map(market => (
        <PredictionCard key={market.id} market={market} onBet={placeBet}  />
      ))}
    </div>
  );
}
export default PredictionWidget;
