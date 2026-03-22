'use client';
import { useState } from 'react';

interface DailyRewardProps {
  streak: number;
  canClaim: boolean;
  onClaim: () => Promise<void>;
}

export function DailyReward({ streak, canClaim, onClaim }: DailyRewardProps) {
  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const reward = 100 + streak * 10;

  const claim = async () => {
    setClaiming(true);
    await onClaim();
    setClaiming(false);
    setClaimed(true);
  };

  return (
    <div className="bg-[#0d0d1a] border border-[#FFD700]/20 rounded-xl p-5 text-center">
      <div className="text-3xl mb-2">⭐</div>
      <p className="font-bold text-white font-space-grotesk mb-1">Daily Reward</p>
      <p className="text-sm text-white/40 mb-3">Day {streak} streak · {reward} $MURPH</p>

      {claimed ? (
        <p className="text-[#00ff88] text-sm font-bold">Claimed! Come back tomorrow.</p>
      ) : canClaim ? (
        <button onClick={claim} disabled={claiming}
          className="px-5 py-2 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] font-bold text-sm rounded-xl hover:bg-[#FFD700]/20 transition-all disabled:opacity-60 flex items-center gap-2 mx-auto">
          {claiming && <span className="w-3 h-3 rounded-full border-2 border-[#FFD700]/20 border-t-[#FFD700] animate-spin" />}
          Claim {reward} $MURPH
        </button>
      ) : (
        <p className="text-white/30 text-sm">Already claimed today</p>
      )}
    </div>
  );
}
export default DailyReward;
