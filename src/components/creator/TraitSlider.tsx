'use client';

import { useCallback } from 'react';
import { calculateTraitCost, getTraitSliderColor, getTraitTierLabel } from '@/lib/creator/pricing';
import type { TraitDefinition } from '@/types/agent';

interface TraitSliderProps {
  trait: TraitDefinition;
  value: number;
  onChange: (id: string, value: number) => void;
}

export function TraitSlider({ trait, value, onChange }: TraitSliderProps) {
  const cost = calculateTraitCost(value);
  const color = getTraitSliderColor(value);
  const tierLabel = getTraitTierLabel(value);
  const isOutsideFreeRange = value < 40 || value > 60;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(trait.id, parseInt(e.target.value, 10));
    },
    [trait.id, onChange]
  );

  return (
    <div className="group relative">
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-white font-space-grotesk">{trait.name}</span>
          {isOutsideFreeRange && (
            <span
              className="text-[10px] font-bold px-1.5 py-0.5 rounded font-mono"
              style={{ color, background: `${color}22`, border: `1px solid ${color}44` }}
            >
              {tierLabel}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {cost > 0 && (
            <span className="text-xs font-bold" style={{ color }}>
              +{cost}cr
            </span>
          )}
          <span
            className="text-sm font-bold font-orbitron w-8 text-right tabular-nums"
            style={{ color }}
          >
            {value}
          </span>
        </div>
      </div>

      <div className="relative">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-white/40 w-20 text-right shrink-0">{trait.lowLabel}</span>
          <div className="relative flex-1">
            {/* Track background */}
            <div className="absolute inset-y-0 left-0 right-0 my-auto h-1.5 rounded-full bg-white/10" />
            {/* Filled portion */}
            <div
              className="absolute inset-y-0 left-0 my-auto h-1.5 rounded-full transition-all duration-150"
              style={{
                width: `${value}%`,
                background: `linear-gradient(to right, ${color}88, ${color})`,
                boxShadow: `0 0 8px ${color}66`,
              }}
            />
            {/* Free range indicator */}
            <div
              className="absolute inset-y-0 my-auto h-1.5 rounded-sm opacity-20 pointer-events-none"
              style={{ left: '40%', width: '20%', background: '#39FF14' }}
            />
            <input
              type="range"
              min={1}
              max={100}
              value={value}
              onChange={handleChange}
              className="relative w-full h-5 opacity-0 cursor-pointer z-10"
              title={`${trait.name}: ${value}`}
            />
          </div>
          <span className="text-[10px] text-white/40 w-20 shrink-0">{trait.highLabel}</span>
        </div>
      </div>

      {/* Tooltip on hover */}
      <div className="absolute left-0 -bottom-8 z-20 hidden group-hover:block pointer-events-none">
        <div className="bg-[#1a1a24] border border-white/20 rounded px-2 py-1 text-[10px] text-white/60 whitespace-nowrap max-w-xs">
          {trait.description}
        </div>
      </div>
    </div>
  );
}

export default TraitSlider;
