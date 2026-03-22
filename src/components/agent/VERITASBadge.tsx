'use client';

interface VERITASBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

function getVERITASColor(score: number): string {
  if (score >= 800) return '#FFD700';
  if (score >= 600) return '#00ff88';
  if (score >= 400) return '#0ea5e9';
  if (score >= 200) return '#8b5cf6';
  return '#ff4444';
}

function getVERITASTier(score: number): string {
  if (score >= 800) return 'Legendary';
  if (score >= 600) return 'Elite';
  if (score >= 400) return 'Veteran';
  if (score >= 200) return 'Challenger';
  return 'Rookie';
}

const SIZES = { sm: 'text-xs px-2 py-0.5', md: 'text-sm px-2.5 py-1', lg: 'text-base px-3 py-1.5' };

export function VERITASBadge({ score, size = 'md', showLabel = false }: VERITASBadgeProps) {
  const color = getVERITASColor(score);
  const tier = getVERITASTier(score);

  return (
    <div className="inline-flex items-center gap-1.5">
      <span className={['font-bold font-mono rounded-full border', SIZES[size]].join(' ')}
        style={{ color, borderColor: color + '40', background: color + '15' }}>
        {score}
      </span>
      {showLabel && <span className="text-xs text-white/40">{tier}</span>}
    </div>
  );
}
export default VERITASBadge;
