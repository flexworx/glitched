'use client';
import { InputHTMLAttributes } from 'react';

interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  showValue?: boolean;
  valueFormatter?: (v: number) => string;
  color?: string;
}

export function Slider({ label, showValue = true, valueFormatter, color = '#00ff88', className = '', ...props }: SliderProps) {
  const value = Number(props.value || 0);
  const min = Number(props.min || 0);
  const max = Number(props.max || 1);
  const pct = ((value - min) / (max - min)) * 100;
  const displayValue = valueFormatter ? valueFormatter(value) : Math.round(value * 100) + '%';

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm text-white/60">{label}</span>}
          {showValue && <span className="text-sm font-mono font-bold" style={{ color }}>{displayValue}</span>}
        </div>
      )}
      <div className="relative h-2 bg-white/10 rounded-full">
        <div className="absolute h-full rounded-full transition-all" style={{ width: `${pct}%`, background: color + '60' }} />
        <input
          type="range"
          className={['absolute inset-0 w-full h-full opacity-0 cursor-pointer', className].join(' ')}
          {...props}
        />
        <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border-2 bg-[#0a0a0f] transition-all pointer-events-none"
          style={{ left: `calc(${pct}% - 8px)`, borderColor: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}
export default Slider;
