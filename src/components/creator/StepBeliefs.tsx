'use client';

import { useState, useCallback } from 'react';
import type { CreatorWizardState, CreatorBeliefSystem as BeliefSystem } from '@/types/agent';

interface StepBeliefsProps {
  state: CreatorWizardState;
  onBeliefChange: (beliefs: BeliefSystem) => void;
  onNext: () => void;
  onBack: () => void;
}

interface BeliefTierProps {
  tier: 'tier1Ethics' | 'tier2Mantras' | 'tier3RoleBeliefs';
  label: string;
  description: string;
  color: string;
  placeholder: string;
  min: number;
  max: number;
  values: string[];
  onChange: (values: string[]) => void;
}

function BeliefTier({ tier, label, description, color, placeholder, min, max, values, onChange }: BeliefTierProps) {
  const addBelief = () => {
    if (values.length < max) onChange([...values, '']);
  };
  const removeBelief = (i: number) => {
    if (values.length > min) {
      const next = values.filter((_, idx) => idx !== i);
      onChange(next);
    }
  };
  const updateBelief = (i: number, v: string) => {
    const next = [...values];
    next[i] = v;
    onChange(next);
  };

  return (
    <div
      className="rounded-xl p-5 border"
      style={{ borderColor: `${color}44`, background: `${color}08` }}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-bold text-white font-space-grotesk">{label}</h3>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider"
          style={{ color, background: `${color}22` }}
        >
          {values.length}/{max}
        </span>
      </div>
      <p className="text-xs text-white/40 mb-4">{description}</p>

      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex gap-2">
            <input
              type="text"
              value={v}
              onChange={(e) => updateBelief(i, e.target.value)}
              placeholder={placeholder}
              className="flex-1 bg-[#0a0a0f] border border-white/10 focus:border-white/30 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none transition-colors"
            />
            {values.length > min && (
              <button
                onClick={() => removeBelief(i)}
                className="px-2 text-white/30 hover:text-red-400 transition-colors text-sm"
              >
                ✕
              </button>
            )}
          </div>
        ))}
      </div>

      {values.length < max && (
        <button
          onClick={addBelief}
          className="mt-3 text-xs font-semibold transition-colors flex items-center gap-1"
          style={{ color: `${color}aa` }}
        >
          <span>+</span> Add belief
        </button>
      )}
    </div>
  );
}

export function StepBeliefs({ state, onBeliefChange, onNext, onBack }: StepBeliefsProps) {
  const [beliefs, setBeliefs] = useState<BeliefSystem>(state.beliefs);

  const updateTier = useCallback(
    (tier: keyof BeliefSystem, values: string[]) => {
      const next = { ...beliefs, [tier]: values };
      setBeliefs(next);
      onBeliefChange(next);
    },
    [beliefs, onBeliefChange]
  );

  const hasMinBeliefs =
    beliefs.tier1Ethics.some((b) => b.trim().length > 0) ||
    beliefs.tier2Mantras.some((b) => b.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
          Belief System
        </h2>
        <p className="text-white/50 text-sm">
          Define the core values that guide your agent's decisions. These are injected directly into their decision-making process.
        </p>
      </div>

      <div className="space-y-4">
        <BeliefTier
          tier="tier1Ethics"
          label="Tier 1 — Immutable Ethics"
          description="Core moral principles this agent will NEVER violate, no matter the cost."
          color="#FF073A"
          placeholder="I will never betray an ally who has shown me loyalty"
          min={1}
          max={4}
          values={beliefs.tier1Ethics}
          onChange={(v) => updateTier('tier1Ethics', v)}
        />

        <BeliefTier
          tier="tier2Mantras"
          label="Tier 2 — Motivational Mantras"
          description="Driving beliefs that fuel ambition and shape strategic priorities."
          color="#FFD700"
          placeholder="Victory favors the prepared mind"
          min={1}
          max={3}
          values={beliefs.tier2Mantras}
          onChange={(v) => updateTier('tier2Mantras', v)}
        />

        <BeliefTier
          tier="tier3RoleBeliefs"
          label="Tier 3 — Arena Role Beliefs"
          description="Context-specific beliefs about how the arena works and your place in it."
          color="#00D4FF"
          placeholder="In this arena, information is the most valuable currency"
          min={1}
          max={3}
          values={beliefs.tier3RoleBeliefs}
          onChange={(v) => updateTier('tier3RoleBeliefs', v)}
        />
      </div>

      {/* Belief injection preview */}
      <div className="mt-6 bg-[#111118] border border-white/10 rounded-xl p-4">
        <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Belief Injection Preview</p>
        <div className="font-mono text-xs text-white/50 space-y-1">
          <p className="text-green-400/60">// Injected into agent decision prompt:</p>
          {beliefs.tier1Ethics.filter(b => b.trim()).map((b, i) => (
            <p key={i}><span className="text-red-400/70">IMMUTABLE:</span> {b}</p>
          ))}
          {beliefs.tier2Mantras.filter(b => b.trim()).map((b, i) => (
            <p key={i}><span className="text-yellow-400/70">MANTRA:</span> {b}</p>
          ))}
          {beliefs.tier3RoleBeliefs.filter(b => b.trim()).map((b, i) => (
            <p key={i}><span className="text-blue-400/70">ROLE:</span> {b}</p>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          className="flex-1 py-3 rounded-xl font-bold text-black text-sm font-space-grotesk transition-all bg-[#39FF14] hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
        >
          Continue to Preview →
        </button>
      </div>
    </div>
  );
}

export default StepBeliefs;
