'use client';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getLevelTier(level: number): { tier: string; color: string; bg: string } {
  if (level >= 100) return { tier: 'LEGEND', color: '#FFD700', bg: '#FFD70020' };
  if (level >= 75) return { tier: 'MASTER', color: '#FF6B35', bg: '#FF6B3520' };
  if (level >= 50) return { tier: 'ELITE', color: '#8B5CF6', bg: '#8B5CF620' };
  if (level >= 25) return { tier: 'VETERAN', color: '#0EA5E9', bg: '#0EA5E920' };
  if (level >= 10) return { tier: 'PLAYER', color: '#00FF88', bg: '#00FF8820' };
  return { tier: 'ROOKIE', color: '#6B7280', bg: '#6B728020' };
}

export function LevelBadge({ level, size = 'md', showLabel }: LevelBadgeProps) {
  const { tier, color, bg } = getLevelTier(level);
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className={['rounded-full flex items-center justify-center font-black font-space-grotesk border-2', sizes[size]].join(' ')}
        style={{ background: bg, borderColor: color + '60', color, boxShadow: `0 0 12px ${color}30` }}>
        {level}
      </div>
      {showLabel && <span className="text-xs font-bold" style={{ color }}>{tier}</span>}
    </div>
  );
}
export default LevelBadge;
