'use client';
interface LevelBadgeProps { level: number; size?: 'sm' | 'md' | 'lg'; }
const LEVEL_COLORS: Record<number, string> = { 1: '#6b7280', 5: '#39FF14', 10: '#00D4FF', 20: '#7B2FBE', 30: '#FFBF00', 50: '#FF6B35', 75: '#FF006E', 100: '#FFD700' };
function getLevelColor(level: number): string {
  const thresholds = Object.keys(LEVEL_COLORS).map(Number).sort((a, b) => b - a);
  for (const t of thresholds) { if (level >= t) return LEVEL_COLORS[t]; }
  return LEVEL_COLORS[1];
}
export function LevelBadge({ level, size = 'md' }: LevelBadgeProps) {
  const color = getLevelColor(level);
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  return (
    <div className={`${sizes[size]} rounded-full border-2 flex items-center justify-center font-orbitron font-bold`} style={{ borderColor: color, background: `${color}20`, color }}>
      {level}
    </div>
  );
}
