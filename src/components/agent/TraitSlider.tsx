'use client';

interface TraitSliderProps {
  name: string;
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
  color?: string;
  min?: number;
  max?: number;
}

export function TraitSlider({ name, label, description, value, onChange, color = '#00ff88', min = 0, max = 1 }: TraitSliderProps) {
  const pct = Math.round(((value - min) / (max - min)) * 100);

  return (
    <div className="group">
      <div className="flex justify-between items-center mb-1.5">
        <div>
          <span className="text-sm font-medium text-white">{label}</span>
          <p className="text-xs text-white/30 mt-0.5">{description}</p>
        </div>
        <span className="text-sm font-bold font-mono w-8 text-right" style={{ color }}>{pct}</span>
      </div>
      <div className="relative h-2 bg-white/10 rounded-full">
        <div className="absolute left-0 top-0 h-full rounded-full transition-all"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          step={0.01}
          value={value}
          onChange={e => onChange(parseFloat(e.target.value))}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
    </div>
  );
}
export default TraitSlider;
