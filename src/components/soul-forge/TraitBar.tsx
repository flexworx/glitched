'use client';

import { useState, useEffect } from 'react';

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

function calcCost(value: number): number {
  if (value > 50) return (value - 50) * 3;
  if (value < 50) return -(50 - value) * 1;
  return 0;
}

function costColor(value: number): string {
  if (value > 50) return '#f97316';
  if (value < 50) return '#22c55e';
  return '#6b7280';
}

export function TraitBar({ code, name, value, editable, onChange, lowLabel, highLabel }: TraitBarProps) {
  const color = getBarColor(value);
  const pct = Math.max(0, Math.min(100, value));
  const cost = calcCost(value);

  const [inputText, setInputText] = useState(String(Math.round(value)));

  useEffect(() => {
    setInputText(String(Math.round(value)));
  }, [value]);

  function handleInputChange(raw: string) {
    setInputText(raw);
    const parsed = parseInt(raw, 10);
    if (!isNaN(parsed)) {
      const clamped = Math.max(0, Math.min(100, parsed));
      onChange?.(clamped);
    }
  }

  function handleInputBlur() {
    const parsed = parseInt(inputText, 10);
    if (isNaN(parsed)) {
      setInputText(String(Math.round(value)));
    } else {
      const clamped = Math.max(0, Math.min(100, parsed));
      setInputText(String(clamped));
      onChange?.(clamped);
    }
  }

  const costStr = cost > 0 ? `+${cost}` : String(cost);

  return (
    <div className="group">
      <div className="flex items-center justify-between mb-1 gap-2">
        <span className="text-xs text-white/60 font-medium truncate">{name}</span>
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="text-[10px] font-mono tabular-nums"
            style={{ color: costColor(value) }}
          >
            {costStr}pt
          </span>
          {editable ? (
            <input
              type="text"
              inputMode="numeric"
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onBlur={handleInputBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }}
              className="w-9 text-right text-xs font-mono font-bold bg-white/5 border border-white/10 rounded px-1 py-0 leading-tight text-white focus:border-white/30 focus:outline-none"
              style={{ color }}
            />
          ) : (
            <span className="text-xs font-mono font-bold" style={{ color }}>{Math.round(value)}</span>
          )}
        </div>
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
            onChange={(e) => onChange?.(Math.max(0, Math.min(100, parseInt(e.target.value))))}
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
