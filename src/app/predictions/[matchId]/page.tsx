'use client';
import { usePrediction } from '@/hooks/usePrediction';
import { PredictionCard } from '@/components/economy/PredictionCard';
import Link from 'next/link';

export default function MatchPredictionsPage({ params }: { params: { matchId: string } }) {
  const { markets, loading, placeBet } = usePrediction(params.matchId);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-24">
        <Link href="/predictions" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← All Markets</Link>
        <h1 className="text-3xl font-black font-space-grotesk text-white mb-2">Match #{params.matchId.slice(-6)} Markets</h1>
        <p className="text-white/40 text-sm mb-8">Live prediction markets for this match.</p>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
          </div>
        ) : markets.length === 0 ? (
          <div className="text-center py-20 text-white/30">
            <p className="text-4xl mb-3">🎯</p>
            <p>No open markets for this match</p>
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
