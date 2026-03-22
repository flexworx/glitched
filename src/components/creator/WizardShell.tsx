'use client';

import { useReducer, useCallback } from 'react';
import type { CreatorWizardState, TraitValues, SkillPack, Detractor, CreatorBeliefSystem as BeliefSystem, ArchetypeId } from '@/types/agent';
import { DEFAULT_TRAITS, ARCHETYPE_PRESETS } from '@/lib/creator/traits';
import { calculateTotalCost } from '@/lib/creator/pricing';
import { deriveMBTI } from '@/lib/creator/mbti';
import { deriveEnneagram } from '@/lib/creator/enneagram';
import { StepIdentity } from './StepIdentity';
import { StepPersonalityDNA } from './StepPersonalityDNA';
import { StepSkillPack } from './StepSkillPack';
import { StepDetractor } from './StepDetractor';
import { StepBeliefs } from './StepBeliefs';
import { StepPreview } from './StepPreview';
import { StepDeploy } from './StepDeploy';

const STEPS = [
  { id: 1, label: 'Identity', icon: '✍️', description: 'Name & personality foundation' },
  { id: 2, label: 'DNA', icon: '🧬', description: '34 personality trait sliders' },
  { id: 3, label: 'Skill Pack', icon: '⚡', description: 'Choose your arena ability' },
  { id: 4, label: 'Detractor', icon: '⚠️', description: 'Your assigned weakness' },
  { id: 5, label: 'Beliefs', icon: '💭', description: 'Core values & mantras' },
  { id: 6, label: 'Preview', icon: '👁️', description: 'Review & interview' },
  { id: 7, label: 'Deploy', icon: '🚀', description: 'Launch to the arena' },
];

type WizardAction =
  | { type: 'SET_STEP'; step: number }
  | { type: 'SET_IDENTITY'; name: string; tagline: string; backstory: string; archetype: ArchetypeId; avatarUrl: string; avatarFile: File | null }
  | { type: 'SET_TRAIT'; id: string; value: number }
  | { type: 'SET_TRAITS'; traits: TraitValues }
  | { type: 'SET_SKILL_PACK'; pack: SkillPack | null }
  | { type: 'SET_DETRACTOR'; detractor: Detractor | null; loading: boolean; rerolled: boolean }
  | { type: 'SET_BELIEFS'; beliefs: BeliefSystem };

function computeDerived(traits: TraitValues, state: CreatorWizardState): Partial<CreatorWizardState> {
  return {
    mbti: deriveMBTI(traits),
    enneagram: deriveEnneagram(traits),
    totalCreditCost: calculateTotalCost(traits) + (state.selectedSkillPack?.creditCost ?? 0),
  };
}

function wizardReducer(state: CreatorWizardState, action: WizardAction): CreatorWizardState {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.step };

    case 'SET_IDENTITY': {
      const presets = ARCHETYPE_PRESETS[action.archetype] ?? {};
      const newTraits: TraitValues = { ...DEFAULT_TRAITS };
      for (const [k, v] of Object.entries(presets)) {
        if (v !== undefined) newTraits[k] = v;
      }
      return {
        ...state,
        name: action.name,
        tagline: action.tagline,
        backstory: action.backstory,
        archetype: action.archetype,
        avatarUrl: action.avatarUrl,
        avatarFile: action.avatarFile,
        traits: newTraits,
        ...computeDerived(newTraits, state),
      };
    }

    case 'SET_TRAIT': {
      const newTraits = { ...state.traits, [action.id]: action.value };
      return {
        ...state,
        traits: newTraits,
        ...computeDerived(newTraits, state),
      };
    }

    case 'SET_TRAITS': {
      return {
        ...state,
        traits: action.traits,
        ...computeDerived(action.traits, state),
      };
    }

    case 'SET_SKILL_PACK': {
      const skillCost = action.pack?.creditCost ?? 0;
      return {
        ...state,
        selectedSkillPack: action.pack,
        totalCreditCost: calculateTotalCost(state.traits) + skillCost,
      };
    }

    case 'SET_DETRACTOR':
      return {
        ...state,
        detractor: action.detractor,
        detractorLoading: action.loading,
        detractorRerolled: action.rerolled,
      };

    case 'SET_BELIEFS':
      return { ...state, beliefs: action.beliefs };

    default:
      return state;
  }
}

const initialState: CreatorWizardState = {
  step: 1,
  name: '',
  tagline: '',
  backstory: '',
  archetype: null,
  avatarUrl: '',
  avatarFile: null,
  traits: DEFAULT_TRAITS,
  selectedSkillPack: null,
  detractor: null,
  detractorLoading: false,
  detractorRerolled: false,
  beliefs: { tier1Ethics: [''], tier2Mantras: [''], tier3RoleBeliefs: [''] },
  totalCreditCost: 0,
  mbti: deriveMBTI(DEFAULT_TRAITS),
  enneagram: deriveEnneagram(DEFAULT_TRAITS),
};

export function WizardShell() {
  const [state, dispatch] = useReducer(wizardReducer, initialState);

  const goTo = useCallback((step: number) => dispatch({ type: 'SET_STEP', step }), []);
  const next = useCallback(() => dispatch({ type: 'SET_STEP', step: state.step + 1 }), [state.step]);
  const back = useCallback(() => dispatch({ type: 'SET_STEP', step: state.step - 1 }), [state.step]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0a0a0f]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-black font-space-grotesk text-white">
                Agent Creator Console
              </h1>
              <p className="text-xs text-white/40">
                Step {state.step} of {STEPS.length} — {STEPS[state.step - 1]?.description}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-white/40">Total Cost</p>
              <p className="text-sm font-bold font-orbitron text-yellow-400">
                {(100 + state.totalCreditCost).toLocaleString()} cr
              </p>
            </div>
          </div>

          {/* Step progress */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {STEPS.map((s, i) => {
              const isCompleted = state.step > s.id;
              const isCurrent = state.step === s.id;
              const isClickable = isCompleted;
              return (
                <div key={s.id} className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => isClickable && goTo(s.id)}
                    disabled={!isClickable && !isCurrent}
                    className={[
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                      isCurrent
                        ? 'bg-[#39FF14]/20 text-[#39FF14] border border-[#39FF14]/50'
                        : isCompleted
                        ? 'bg-white/10 text-white/70 hover:bg-white/20 cursor-pointer'
                        : 'bg-white/5 text-white/20 cursor-default',
                    ].join(' ')}
                  >
                    <span>{s.icon}</span>
                    <span className="hidden sm:inline">{s.label}</span>
                    {isCompleted && <span className="text-green-400">✓</span>}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div
                      className="w-4 h-px"
                      style={{ background: isCompleted ? '#39FF14' : 'rgba(255,255,255,0.1)' }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {state.step === 1 && (
          <StepIdentity
            state={state}
            onSubmit={(data) => {
              dispatch({ type: 'SET_IDENTITY', ...data });
              next();
            }}
          />
        )}
        {state.step === 2 && (
          <StepPersonalityDNA
            state={state}
            onTraitChange={(id, value) => dispatch({ type: 'SET_TRAIT', id, value })}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 3 && (
          <StepSkillPack
            state={state}
            onSelect={(pack) => dispatch({ type: 'SET_SKILL_PACK', pack })}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 4 && (
          <StepDetractor
            state={state}
            onDetractorLoaded={(detractor, rerolled) =>
              dispatch({ type: 'SET_DETRACTOR', detractor, loading: false, rerolled })
            }
            onLoadingStart={() =>
              dispatch({ type: 'SET_DETRACTOR', detractor: null, loading: true, rerolled: false })
            }
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 5 && (
          <StepBeliefs
            state={state}
            onBeliefChange={(beliefs) => dispatch({ type: 'SET_BELIEFS', beliefs })}
            onNext={next}
            onBack={back}
          />
        )}
        {state.step === 6 && (
          <StepPreview
            state={state}
            onNext={next}
            onBack={back}
            onGoToStep={goTo}
          />
        )}
        {state.step === 7 && (
          <StepDeploy
            state={state}
            onBack={back}
          />
        )}
      </div>
    </div>
  );
}

export default WizardShell;
