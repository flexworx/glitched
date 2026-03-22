'use client';

interface XPBarProps {
  currentXP: number;
  level: number;
  xpForNextLevel?: number;
  showLevel?: boolean;
}

export function XPBar({ currentXP, level, xpForNextLevel, showLevel = true }: XPBarProps) {
  const nextLevel = xpForNextLevel || (level * 1000);
  const prevLevel = (level - 1) * 1000;
  const progress = ((currentXP - prevLevel) / (nextLevel - prevLevel)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5">
        {showLevel && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-[#00ff88]/20 border border-[#00ff88]/40 flex items-center justify-center">
              <span className="text-xs font-black text-[#00ff88]">{level}</span>
            </div>
            <span className="text-xs text-white/50">Level {level}</span>
          </div>
        )}
        <span className="text-xs text-white/30 font-mono ml-auto">{currentXP.toLocaleString()} / {nextLevel.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(100, progress)}%`, background: 'linear-gradient(90deg, #00ff8860, #00ff88)' }} />
      </div>
      <p className="text-xs text-white/20 mt-1">{Math.round(nextLevel - currentXP).toLocaleString()} XP to Level {level + 1}</p>
    </div>
  );
}
export default XPBar;
