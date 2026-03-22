'use client';
import { useState } from 'react';
import { PredictionMarket } from '@/hooks/usePrediction';

interface PredictionCardProps {
  market: PredictionMarket;
  onBet?: (marketId: string, optionId: string, amount: number) => Promise<unknown>;
}

export function PredictionCard({ market, onBet }: PredictionCardProps) {
  const [selected, setSelected] = useState<string|null>(null);
  const [amount, setAmount] = useState(100);
  const [placing, setPlacing] = useState(false);

  const handleBet = async () => {
    if (!selected || !onBet) return;
    setPlacing(true);
    await onBet(market.id, selected, amount);
    setPlacing(false);
    setSelected(null);
  };

  const timeLeft = new Date(market.closesAt).getTime() - Date.now();
  const hoursLeft = Math.max(0, Math.floor(timeLeft / 3600000));

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-start justify-between mb-4">
        <h3 className="font-bold text-white font-space-grotesk flex-1 pr-4">{market.question}</h3>
        <div className="text-right flex-shrink-0">
          <p className="text-xs text-white/40">Pool</p>
          <p className="text-sm font-bold text-[#00ff88] font-mono">{market.totalPool.toLocaleString()}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {market.options.map(opt => {
          const pct = market.totalPool > 0 ? (opt.totalBet / market.totalPool) * 100 : 0;
          return (
            <button key={opt.id} onClick={() => market.status === 'open' && setSelected(opt.id)}
              disabled={market.status !== 'open'}
              className={['w-full p-3 rounded-lg border text-left transition-all relative overflow-hidden',
                selected === opt.id ? 'border-[#00ff88] bg-[#00ff88]/10' : 'border-white/10 hover:border-white/20'].join(' ')}>
              <div className="absolute inset-0 rounded-lg opacity-20" style={{ background: `linear-gradient(90deg, rgba(0,255,136,0.1) ${pct}%, transparent ${pct}%)` }} />
              <div className="relative flex justify-between items-center">
                <span className="text-sm font-semibold text-white">{opt.label}</span>
                <div className="text-right">
                  <span className="text-sm font-bold text-[#00ff88]">{opt.odds}x</span>
                  <p className="text-xs text-white/30">{pct.toFixed(0)}%</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {market.status === 'open' && selected && (
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={10}
            className="flex-1 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50" />
          <button onClick={handleBet} disabled={placing}
            className="px-4 py-2 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all disabled:opacity-50">
            {placing ? '...' : 'Bet'}
          </button>
        </div>
      )}

      <div className="mt-3 flex justify-between text-xs text-white/30">
        <span>{market.status === 'open' ? `Closes in ${hoursLeft}h` : market.status.toUpperCase()}</span>
        <span>{market.options.length} options</span>
      </div>
    </div>
  );
}
export default PredictionCard;
