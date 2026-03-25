'use client';

import type { CreatorWizardState, SkillPack } from '@/types/agent';
import { ARENA_TOOLS, arenaToolToSkillPack } from '@/lib/creator/arenaTools';
import type { ArenaToolDefinition } from '@/lib/creator/arenaTools';
import { ArenaToolCard } from './ArenaToolCard';

interface StepArenaToolsProps {
  state: CreatorWizardState;
  onSelect: (pack: SkillPack | null) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepArenaTools({ state, onSelect, onNext, onBack }: StepArenaToolsProps) {
  const handleSelect = (tool: ArenaToolDefinition) => {
    if (state.selectedSkillPack?.id === tool.id) {
      onSelect(null); // Deselect
    } else {
      onSelect(arenaToolToSkillPack(tool));
    }
  };

  const preGameTools = ARENA_TOOLS.filter((t) => t.usablePreGame);
  const inGameOnlyTools = ARENA_TOOLS.filter((t) => !t.usablePreGame);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
          Choose Your Arena Tools
        </h2>
        <p className="text-white/50 text-sm">
          Arena Tools are hidden until activated. Other agents won&apos;t know what you&apos;re carrying.
          Tools with limited supply are first come first serve.
        </p>
      </div>

      {/* Selected tool summary */}
      {state.selectedSkillPack && (
        <div className="mb-6 p-4 rounded-xl border border-[#39FF14]/40 bg-[#39FF14]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">
                {ARENA_TOOLS.find((t) => t.id === state.selectedSkillPack?.id)?.icon ?? '⚡'}
              </span>
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

      {/* Pre-game equippable tools */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-white font-space-grotesk">Pre-Game Equippable</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-green-400/70">Equip before the season starts</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {preGameTools.map((tool) => (
            <ArenaToolCard
              key={tool.id}
              tool={tool}
              selected={state.selectedSkillPack?.id === tool.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* In-game only tools (display only — cannot be equipped pre-game) */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-sm font-bold text-white font-space-grotesk">In-Game Only</h3>
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-xs text-red-400/70">Must be purchased during a match</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {inGameOnlyTools.map((tool) => (
            <ArenaToolCard
              key={tool.id}
              tool={tool}
              selected={false}
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
          {state.selectedSkillPack ? 'Continue to Detractor →' : 'Select an Arena Tool to Continue'}
        </button>
      </div>
    </div>
  );
}

export default StepArenaTools;
