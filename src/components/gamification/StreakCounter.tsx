'use client';

interface StreakCounterProps {
  streak: number;
  canCheckin: boolean;
  onCheckin?: () => void;
  xpMultiplier?: number;
}

const MILESTONE_REWARDS: Record<number, string> = {
  7: '500 XP + Rare Badge',
  14: '1000 XP + Epic Badge',
  30: '2500 XP + Legendary Title',
  60: '5000 XP + Exclusive Skin',
  100: '10000 XP + Hall of Fame',
};

export function StreakCounter({ streak, canCheckin, onCheckin, xpMultiplier = 1 }: StreakCounterProps) {
  const nextMilestone = Object.keys(MILESTONE_REWARDS).map(Number).find(m => m > streak);
  const streakColor = streak >= 30 ? '#FFD700' : streak >= 14 ? '#FF6B35' : streak >= 7 ? '#8B5CF6' : '#00ff88';

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-white font-space-grotesk">Daily Streak</h3>
        {xpMultiplier > 1 && (
          <span className="px-2 py-0.5 text-xs bg-[#ffcc00]/10 text-[#ffcc00] border border-[#ffcc00]/20 rounded-full font-bold">
            {xpMultiplier}x XP
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 mb-4">
        <div className="text-4xl font-black font-space-grotesk" style={{ color: streakColor }}>
          {streak}
        </div>
        <div>
          <p className="text-white text-sm font-semibold">day streak 🔥</p>
          {nextMilestone && (
            <p className="text-xs text-white/40 mt-0.5">{nextMilestone - streak} days to next reward</p>
          )}
        </div>
      </div>

      {/* Streak dots */}
      <div className="flex gap-1 mb-4 flex-wrap">
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="w-6 h-6 rounded-full flex items-center justify-center text-xs"
            style={{
              background: i < (streak % 7) ? streakColor + '30' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${i < (streak % 7) ? streakColor + '60' : 'rgba(255,255,255,0.1)'}`,
              color: i < (streak % 7) ? streakColor : 'rgba(255,255,255,0.2)',
            }}>
            {i < (streak % 7) ? '✓' : '·'}
          </div>
        ))}
      </div>

      {canCheckin ? (
        <button onClick={onCheckin}
          className="w-full py-2.5 bg-[#00ff88] text-[#0a0a0f] font-bold text-sm rounded-lg hover:bg-[#00ff88]/90 transition-all">
          Check In (+100 XP)
        </button>
      ) : (
        <div className="w-full py-2.5 bg-white/5 border border-white/10 text-white/30 text-sm rounded-lg text-center">
          ✓ Checked in today
        </div>
      )}
    </div>
  );
}
export default StreakCounter;
