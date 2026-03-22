'use client';

interface ProgressBarProps {
  value: number;
  max?: number;
  color?: string;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function ProgressBar({ value, max = 100, color = '#00ff88', label, showValue, size = 'md', animated }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  const heights = { sm: 'h-1', md: 'h-2', lg: 'h-3' };

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && <span className="text-xs text-white/50">{label}</span>}
          {showValue && <span className="text-xs font-mono text-white/50">{value}/{max}</span>}
        </div>
      )}
      <div className={['w-full bg-white/10 rounded-full overflow-hidden', heights[size]].join(' ')}>
        <div
          className={['h-full rounded-full transition-all duration-500', animated ? 'animate-pulse' : ''].join(' ')}
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }}
        />
      </div>
    </div>
  );
}
export default ProgressBar;
