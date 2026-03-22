'use client';

interface BattlePassProgressProps {
  currentTier: number;
  maxTier: number;
  xp: number;
  xpPerTier: number;
  isPremium?: boolean;
}

export function BattlePassProgress({ currentTier, maxTier, xp, xpPerTier, isPremium = false }: BattlePassProgressProps) {
  const tierProgress = (xp % xpPerTier) / xpPerTier;

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">🏆</span>
          <div>
            <p className="font-bold text-white text-sm">Battle Pass</p>
            <p className="text-xs text-white/30">Season 2</p>
          </div>
        </div>
        {isPremium ? (
          <span className="px-2 py-0.5 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold rounded-full">PREMIUM</span>
        ) : (
          <button className="px-3 py-1 bg-[#FFD700]/10 border border-[#FFD700]/30 text-[#FFD700] text-xs font-bold rounded-full hover:bg-[#FFD700]/20 transition-all">
            Upgrade 500 $MURPH
          </button>
        )}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl font-black font-space-grotesk text-[#FFD700]">{currentTier}</span>
        <div className="flex-1">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Tier {currentTier}</span>
            <span>{Math.round(tierProgress * xpPerTier)}/{xpPerTier} XP</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all" style={{ width: `${tierProgress * 100}%`, background: 'linear-gradient(90deg, #FFD700, #ff6600)' }} />
          </div>
        </div>
        <span className="text-2xl font-black font-space-grotesk text-white/20">{maxTier}</span>
      </div>
    </div>
  );
}
export default BattlePassProgress;
