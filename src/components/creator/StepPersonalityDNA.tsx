'use client';

import type { CreatorWizardState, TraitValues } from '@/types/agent';
import { TRAIT_CATEGORIES } from '@/lib/creator/traits';
import { calculateTotalCost } from '@/lib/creator/pricing';
import { TraitSlider } from './TraitSlider';
import { TraitCategoryAccordion } from './TraitCategoryAccordion';
import { PersonalityRadar } from './PersonalityRadar';
import { MBTIBadge } from './MBTIBadge';
import { EnneagramBadge } from './EnneagramBadge';
import { CreditCounter } from './CreditCounter';

interface StepPersonalityDNAProps {
  state: CreatorWizardState;
  onTraitChange: (id: string, value: number) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepPersonalityDNA({ state, onTraitChange, onNext, onBack }: StepPersonalityDNAProps) {
  const traitCost = calculateTotalCost(state.traits);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
          Personality DNA
        </h2>
        <p className="text-white/50 text-sm">
          Configure all 34 personality traits. Values 40–60 are free. Extreme values cost credits but create more distinctive agents.
        </p>
      </div>

      {/* Credit counter */}
      <div className="mb-6">
        <CreditCounter
          traitCost={traitCost}
          skillPackCost={state.selectedSkillPack?.creditCost ?? 0}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Left/Center: trait sliders (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Desktop: all sliders visible */}
          <div className="hidden lg:block space-y-8">
            {TRAIT_CATEGORIES.map((cat) => (
              <div key={cat.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: cat.color, boxShadow: `0 0 6px ${cat.color}` }}
                  />
                  <h3 className="text-sm font-bold text-white font-space-grotesk">{cat.label}</h3>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-white/30">{cat.description}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  {cat.traits.map((trait) => (
                    <TraitSlider
                      key={trait.id}
                      trait={trait}
                      value={state.traits[trait.id] ?? 50}
                      onChange={onTraitChange}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: collapsible accordions */}
          <div className="lg:hidden space-y-2">
            {TRAIT_CATEGORIES.map((cat, i) => (
              <TraitCategoryAccordion
                key={cat.id}
                categoryId={cat.id}
                label={cat.label}
                description={cat.description}
                color={cat.color}
                traits={cat.traits}
                values={state.traits}
                onChange={onTraitChange}
                defaultOpen={i === 0}
              />
            ))}
          </div>
        </div>

        {/* Right: radar chart + badges (1/3 width) */}
        <div className="space-y-4 lg:sticky lg:top-32 lg:self-start">
          <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3 text-center">
              Personality Profile
            </p>
            <PersonalityRadar traits={state.traits} size={240} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <MBTIBadge mbti={state.mbti} size="sm" />
            <EnneagramBadge enneagram={state.enneagram} size="sm" />
          </div>

          {/* Sample dialogue preview */}
          <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Sample Dialogue</p>
            <div className="space-y-2">
              {generateSampleDialogue(state.traits).map((line, i) => (
                <p key={i} className="text-xs text-white/70 font-mono leading-relaxed italic">
                  "{line}"
                </p>
              ))}
            </div>
          </div>
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
          Continue to Arena Tool →
        </button>
      </div>
    </div>
  );
}

function generateSampleDialogue(traits: TraitValues): string[] {
  const verbosity = traits.verbosity ?? 50;
  const formality = traits.formality ?? 50;
  const directness = traits.directness ?? 50;
  const humor = traits.humor ?? 50;

  const lines: string[] = [];

  if (directness > 65) {
    lines.push('I will eliminate you in three turns. Prepare accordingly.');
  } else if (directness < 35) {
    lines.push('Perhaps we might consider... a mutually beneficial arrangement?');
  } else {
    lines.push('I propose an alliance. The terms are straightforward.');
  }

  if (humor > 65) {
    lines.push('Nothing personal — well, actually, it is very personal.');
  } else if (formality > 65) {
    lines.push('I acknowledge your strategic position and respond accordingly.');
  } else {
    lines.push('Your move. Choose wisely.');
  }

  return lines;
}

export default StepPersonalityDNA;
