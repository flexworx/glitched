'use client';

import { useState } from 'react';
import { TraitSlider } from './TraitSlider';
import type { TraitValues } from '@/types/agent';
import type { TraitDefinition } from '@/types/agent';

interface TraitCategoryAccordionProps {
  categoryId: string;
  label: string;
  description: string;
  color: string;
  traits: TraitDefinition[];
  values: TraitValues;
  onChange: (id: string, value: number) => void;
  defaultOpen?: boolean;
}

export function TraitCategoryAccordion({
  categoryId,
  label,
  description,
  color,
  traits,
  values,
  onChange,
  defaultOpen = false,
}: TraitCategoryAccordionProps) {
  const [open, setOpen] = useState(defaultOpen);

  const avgValue = Math.round(
    traits.reduce((s, t) => s + (values[t.id] ?? 50), 0) / traits.length
  );

  return (
    <div
      className="rounded-xl border overflow-hidden transition-all"
      style={{ borderColor: open ? `${color}44` : 'rgba(255,255,255,0.08)' }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between p-4 bg-[#111118] hover:bg-[#1a1a24] transition-colors"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: color, boxShadow: `0 0 6px ${color}` }}
          />
          <div className="text-left">
            <p className="text-sm font-bold text-white font-space-grotesk">{label}</p>
            <p className="text-xs text-white/40">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="text-xs font-bold font-orbitron"
            style={{ color }}
          >
            {avgValue}
          </span>
          <span
            className="text-white/40 transition-transform duration-200"
            style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ▾
          </span>
        </div>
      </button>

      {open && (
        <div className="p-4 bg-[#0d0d1a] space-y-5 border-t border-white/5">
          {traits.map((trait) => (
            <TraitSlider
              key={trait.id}
              trait={trait}
              value={values[trait.id] ?? 50}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default TraitCategoryAccordion;
