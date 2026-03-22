'use client';

import type { CreatorWizardState } from '@/types/agent';
import { PersonalityRadar } from './PersonalityRadar';
import { MBTIBadge } from './MBTIBadge';
import { EnneagramBadge } from './EnneagramBadge';

interface AgentPreviewCardProps {
  state: CreatorWizardState;
}

const ARCHETYPE_ICONS: Record<string, string> = {
  strategist: '♟️',
  guardian: '🛡️',
  chaos_agent: '💥',
  merchant: '💰',
  deceiver: '🎭',
  speedster: '⚡',
  planner: '📋',
  analyst: '🔬',
  custom: '✨',
};

export function AgentPreviewCard({ state }: AgentPreviewCardProps) {
  const hasIdentity = state.name && state.archetype;

  return (
    <div className="bg-[#111118] border border-white/10 rounded-2xl overflow-hidden">
      {/* Header banner */}
      <div className="relative h-24 bg-gradient-to-br from-[#39FF14]/20 via-[#7B2FBE]/20 to-[#00D4FF]/20 flex items-end p-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative flex items-end gap-4">
          {/* Avatar */}
          <div className="w-16 h-16 rounded-xl border-2 border-white/20 bg-[#0a0a0f] flex items-center justify-center overflow-hidden">
            {state.avatarUrl ? (
              <img src={state.avatarUrl} alt="Agent avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-3xl">{ARCHETYPE_ICONS[state.archetype ?? 'custom'] ?? '🤖'}</span>
            )}
          </div>
          <div>
            <h3 className="text-lg font-black text-white font-space-grotesk">
              {state.name || 'UNNAMED AGENT'}
            </h3>
            {state.tagline && (
              <p className="text-xs text-white/50 italic">"{state.tagline}"</p>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Archetype + Status */}
        {state.archetype && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-white/60 bg-white/10 px-2 py-1 rounded capitalize">
              {ARCHETYPE_ICONS[state.archetype]} {state.archetype.replace('_', ' ')}
            </span>
            <span className="text-xs font-semibold text-green-400 bg-green-400/10 px-2 py-1 rounded">
              ARENA READY
            </span>
          </div>
        )}

        {/* Personality Radar */}
        <div>
          <p className="text-xs text-white/40 uppercase tracking-wider mb-2">Personality DNA</p>
          <PersonalityRadar traits={state.traits} size={200} />
        </div>

        {/* MBTI + Enneagram */}
        <div className="grid grid-cols-2 gap-2">
          <MBTIBadge mbti={state.mbti} size="sm" />
          <EnneagramBadge enneagram={state.enneagram} size="sm" />
        </div>

        {/* Skill Pack */}
        {state.selectedSkillPack && (
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1">Skill Pack</p>
            <div className="flex items-center gap-2">
              <span className="text-lg">{state.selectedSkillPack.icon}</span>
              <div>
                <p className="text-sm font-bold text-white">{state.selectedSkillPack.name}</p>
                <p className="text-[10px] text-white/50">{state.selectedSkillPack.arenaBonus}</p>
              </div>
            </div>
          </div>
        )}

        {/* Detractor */}
        {state.detractor && (
          <div className="bg-[#0a0a0f] rounded-lg p-3 border border-red-500/20">
            <p className="text-[10px] text-red-400/70 uppercase tracking-wider mb-1">Detractor</p>
            <div>
              <p className="text-sm font-bold text-red-400">{state.detractor.name}</p>
              <p className="text-[10px] text-white/40">{state.detractor.arenapenalty}</p>
            </div>
          </div>
        )}

        {/* Beliefs preview */}
        {(state.beliefs.tier1Ethics.length > 0 || state.beliefs.tier2Mantras.length > 0) && (
          <div className="bg-[#0a0a0f] rounded-lg p-3">
            <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2">Core Beliefs</p>
            <div className="space-y-1">
              {state.beliefs.tier1Ethics.slice(0, 2).map((b, i) => (
                <p key={i} className="text-[10px] text-red-400/70 italic">"{b}"</p>
              ))}
              {state.beliefs.tier2Mantras.slice(0, 1).map((b, i) => (
                <p key={i} className="text-[10px] text-yellow-400/70 italic">"{b}"</p>
              ))}
            </div>
          </div>
        )}

        {/* Total cost */}
        <div className="flex items-center justify-between pt-2 border-t border-white/10">
          <span className="text-xs text-white/40">Total deployment cost</span>
          <span className="text-sm font-bold font-orbitron text-yellow-400">
            {(100 + state.totalCreditCost).toLocaleString()} cr
          </span>
        </div>
      </div>
    </div>
  );
}

export default AgentPreviewCard;
