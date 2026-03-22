'use client';

import type { CreatorWizardState, SkillPack } from '@/types/agent';
import { SKILL_PACKS } from '@/lib/creator/skillPacks';
import { SkillPackCard } from './SkillPackCard';

interface StepSkillPackProps {
  state: CreatorWizardState;
  onSelect: (pack: SkillPack | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepSkillPack({ state, onSelect, onNext, onBack }: StepSkillPackProps) {
  const handleSelect = (pack: SkillPack) => {
    if (state.selectedSkillPack?.id === pack.id) {
      onSelect(null); // Deselect
    } else {
      onSelect(pack);
    }
  };

  const freePacks = SKILL_PACKS.filter((p) => p.creditCost === 0);
  const paidPacks = SKILL_PACKS.filter((p) => p.creditCost > 0);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
          Choose Your Skill Pack
        </h2>
        <p className="text-white/50 text-sm">
          Each agent gets one Skill Pack — a special ability that gives them an edge in the arena. Choose wisely.
        </p>
      </div>

      {/* Selected pack summary */}
      {state.selectedSkillPack && (
        <div className="mb-6 p-4 rounded-xl border border-[#39FF14]/40 bg-[#39FF14]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{state.selectedSkillPack.icon}</span>
              <div>
                <p className="font-bold text-white text-sm">{state.selectedSkillPack.name}</p>
                <p className="text-xs text-white/50">{state.selectedSkillPack.arenaBonus}</p>
              </div>
            </div>
            <button
              onClick={() => onSelect(null)}
              className="text-xs text-white/40 hover:text-white transition-colors"
            >
              ✕ Deselect
            </button>
          </div>
        </div>
      )}

      {/* Free packs */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-white font-space-grotesk">Free Skill Packs</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-green-400/70">No credit cost</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {freePacks.map((pack) => (
            <SkillPackCard
              key={pack.id}
              pack={pack}
              selected={state.selectedSkillPack?.id === pack.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Paid packs */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-white font-space-grotesk">Premium Skill Packs</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-purple-400/70">Requires credits</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {paidPacks.map((pack) => (
            <SkillPackCard
              key={pack.id}
              pack={pack}
              selected={state.selectedSkillPack?.id === pack.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex gap-3 pt-6 border-t border-white/10">
        <button
          onClick={onBack}
          className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
        >
          ← Back
        </button>
        <button
          onClick={onNext}
          disabled={!state.selectedSkillPack}
          className={[
            'flex-1 py-3 rounded-xl font-bold text-sm font-space-grotesk transition-all',
            state.selectedSkillPack
              ? 'bg-[#39FF14] text-black hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]'
              : 'bg-white/10 text-white/30 cursor-not-allowed',
          ].join(' ')}
        >
          {state.selectedSkillPack ? 'Continue to Detractor →' : 'Select a Skill Pack to Continue'}
        </button>
      </div>
    </div>
  );
}

export default StepSkillPack;
