'use client';
import { useState } from 'react';

interface BettingSlipProps {
  marketId: string;
  question: string;
  selectedOption: { id: string; label: string; odds: number };
  onSubmit: (amount: number) => Promise<void>;
  onCancel: () => void;
}

export function BettingSlip({ marketId, question, selectedOption, onSubmit, onCancel }: BettingSlipProps) {
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(false);
  const payout = Math.round(amount * selectedOption.odds);
  const burn = Math.floor(amount * 0.01);

  const submit = async () => {
    if (amount < 10) return;
    setLoading(true);
    await onSubmit(amount);
    setLoading(false);
  };

  return (
    <div className="bg-[#0d0d1a] border border-[#00ff88]/20 rounded-xl p-5">
      <h3 className="font-bold text-white font-space-grotesk mb-1 text-sm">Betting Slip</h3>
      <p className="text-xs text-white/40 mb-4">{question}</p>

      <div className="p-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg mb-4">
        <p className="text-xs text-white/40">Selected</p>
        <p className="font-bold text-[#00ff88]">{selectedOption.label}</p>
        <p className="text-xs text-white/40">@ {selectedOption.odds}x odds</p>
      </div>

      <div className="mb-4">
        <label className="text-xs text-white/40 block mb-1.5">Bet Amount ($MURPH)</label>
        <div className="flex gap-2">
          <input type="number" value={amount} onChange={e => setAmount(Math.max(10, parseInt(e.target.value) || 0))}
            className="flex-1 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 font-mono" />
          <div className="flex gap-1">
            {[100, 500, 1000].map(v => (
              <button key={v} onClick={() => setAmount(v)} className="px-2 py-1 bg-white/5 border border-white/10 text-white/60 text-xs rounded-lg hover:bg-white/10 transition-all">{v}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5 text-xs mb-4">
        <div className="flex justify-between"><span className="text-white/40">Potential payout</span><span className="text-[#00ff88] font-bold">{payout} $MURPH</span></div>
        <div className="flex justify-between"><span className="text-white/40">Burn (1%)</span><span className="text-red-400">{burn} $MURPH</span></div>
      </div>

      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all">Cancel</button>
        <button onClick={submit} disabled={loading || amount < 10}
          className="flex-1 py-2.5 bg-[#00ff88] text-[#0a0a0f] text-sm font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading && <span className="w-3 h-3 rounded-full border-2 border-[#0a0a0f]/20 border-t-[#0a0a0f] animate-spin" />}
          Place Bet
        </button>
      </div>
    </div>
  );
}
export default BettingSlip;
