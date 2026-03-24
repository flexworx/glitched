'use client';

interface TraitBarProps {
  code: string;
  name: string;
  value: number;
  editable?: boolean;
  onChange?: (val: number) => void;
  lowLabel?: string;
  highLabel?: string;
}

function getBarColor(value: number): string {
  const dist = Math.abs(value - 50);
  if (dist > 35) return '#ef4444';
  if (dist > 25) return '#f97316';
  if (dist > 15) return '#eab308';
  return '#06b6d4';
}

export function TraitBar({ code, name, value, editable, onChange, lowLabel, highLabel }: TraitBarProps) {
  const color = getBarColor(value);
  const pct = Math.max(0, Math.min(100, value));

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-white/60 font-medium">{name}</span>
        <span className="text-xs font-mono font-bold" style={{ color }}>{Math.round(value)}</span>
      </div>
      {editable ? (
        <div className="relative">
          <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="absolute h-full rounded-full transition-all duration-150"
              style={{ width: `${pct}%`, background: `${color}90` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={value}
            onChange={(e) => onChange?.(parseInt(e.target.value))}
            className="absolute inset-0 w-full h-2 opacity-0 cursor-pointer"
          />
          <div
            className="absolute top-0 w-3 h-3 -mt-0.5 rounded-full border-2 bg-arena-black pointer-events-none transition-all duration-150"
            style={{
              left: `calc(${pct}% - 6px)`,
              borderColor: color,
              boxShadow: `0 0 6px ${color}80`,
            }}
          />
        </div>
      ) : (
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute h-full rounded-full transition-all duration-300"
            style={{
              width: `${pct}%`,
              background: `linear-gradient(90deg, ${color}60, ${color})`,
            }}
          />
        </div>
      )}
      {(lowLabel || highLabel) && (
        <div className="flex justify-between mt-0.5">
          <span className="text-[10px] text-white/30">{lowLabel}</span>
          <span className="text-[10px] text-white/30">{highLabel}</span>
        </div>
      )}
    </div>
  );
}

export default TraitBar;
