'use client';

import type { SocialAgentState } from '@/lib/types/glitch-engine';

interface AgentCardProps {
  agent: SocialAgentState;
  isEliminated: boolean;
  isGhost: boolean;
}

const EMOTIONAL_EMOJIS: Record<string, string> = {
  confident: '\u{1F60E}',
  anxious: '\u{1F630}',
  aggressive: '\u{1F620}',
  calculating: '\u{1F9D0}',
  desperate: '\u{1F628}',
  amused: '\u{1F604}',
  suspicious: '\u{1F928}',
  betrayed: '\u{1F494}',
  triumphant: '\u{1F451}',
};

const ALLIANCE_COLORS = [
  '#39FF14', '#00D4FF', '#FF006E', '#FFD60A',
  '#8B5CF6', '#FF6B35', '#14B8A6', '#6366F1',
];

function getVeritasColor(score: number): string {
  if (score > 60) return '#39FF14';
  if (score > 40) return '#FFD60A';
  return '#FF006E';
}

function getVeritasLabel(score: number): string {
  if (score > 60) return 'TRUST';
  if (score > 40) return 'MIXED';
  return 'DECPT';
}

export function AgentCard({ agent, isEliminated, isGhost }: AgentCardProps) {
  const veritasColor = getVeritasColor(agent.veritasScore);
  const emoji = EMOTIONAL_EMOJIS[agent.emotionalState] || '\u{2753}';
  // Derive alliance color index from allianceId hash
  const allianceColorIdx = agent.allianceId
    ? Math.abs(agent.allianceId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % ALLIANCE_COLORS.length
    : -1;

  return (
    <div
      className={[
        'relative border rounded-lg p-2.5 transition-all',
        'bg-arena-dark border-arena-border',
        isEliminated ? 'opacity-40 grayscale' : 'hover:border-arena-mid',
        isGhost ? 'border-deep-purple/50' : '',
      ].join(' ')}
    >
      {/* Eliminated overlay */}
      {isEliminated && !isGhost && (
        <div className="absolute inset-0 flex items-center justify-center bg-arena-black/60 rounded-lg z-10">
          <span className="font-orbitron text-[10px] text-status-eliminated tracking-widest">ELIMINATED</span>
        </div>
      )}

      {/* Ghost icon */}
      {isGhost && (
        <div className="absolute top-1 right-1 text-sm z-10" title="Ghost Jury Member">
          {'\u{1F47B}'}
        </div>
      )}

      {/* Header: name + ranking */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {agent.allianceId && allianceColorIdx >= 0 && (
            <span
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: ALLIANCE_COLORS[allianceColorIdx] }}
              title={`Alliance: ${agent.allianceId}`}
            />
          )}
          <span className="font-space-grotesk text-xs font-bold text-white truncate">
            {agent.name}
          </span>
        </div>
        <span className="font-jetbrains text-[10px] text-gray-500 flex-shrink-0">
          #{agent.ranking}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-[10px] mb-1.5">
        <span className="font-jetbrains text-gray-400">
          IP: <span className="text-neon-yellow">{agent.influencePoints}</span>
        </span>
        <span className="font-jetbrains" style={{ color: veritasColor }}>
          V:{agent.veritasScore} {getVeritasLabel(agent.veritasScore)}
        </span>
      </div>

      {/* VERITAS bar */}
      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden mb-1.5">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${agent.veritasScore}%`,
            background: veritasColor,
          }}
        />
      </div>

      {/* Bottom row: flaw + emotion */}
      <div className="flex items-center justify-between">
        <span className={[
          'font-jetbrains text-[10px]',
          agent.flawActive ? 'text-neon-pink' : 'text-gray-500',
        ].join(' ')}>
          {agent.flawActive ? '\u{26A0}' : ''}{agent.visibleFlaw}
        </span>
        <span className="text-sm" title={agent.emotionalState}>
          {emoji}
        </span>
      </div>
    </div>
  );
}

export default AgentCard;
