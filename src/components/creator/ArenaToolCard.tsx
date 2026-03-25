'use client';

import type { ArenaToolDefinition, ArenaToolRarity } from '@/lib/creator/arenaTools';
import { RARITY_COLORS } from '@/lib/creator/arenaTools';

interface ArenaToolCardProps {
  tool: ArenaToolDefinition;
  selected: boolean;
  onSelect: (tool: ArenaToolDefinition) => void;
  userCredits?: number;
  remainingSupply?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  combat: '#FF073A',
  social: '#39FF14',
  economic: '#FFD700',
  intelligence: '#00D4FF',
  survival: '#FF6B35',
  chaos: '#7B2FBE',
};

const RARITY_LABELS: Record<ArenaToolRarity, string> = {
  common: 'COMMON',
  uncommon: 'UNCOMMON',
  rare: 'RARE',
  legendary: 'LEGENDARY',
};

export function ArenaToolCard({ tool, selected, onSelect, userCredits = 5000, remainingSupply }: ArenaToolCardProps) {
  const canAfford = userCredits >= tool.murphCost;
  const isInGameOnly = !tool.usablePreGame;
  const isSoldOut = remainingSupply !== undefined && remainingSupply <= 0;
  const categoryColor = CATEGORY_COLORS[tool.category] ?? '#39FF14';
  const rarityColor = RARITY_COLORS[tool.rarity];

  const disabled = !canAfford || isInGameOnly || isSoldOut;

  return (
    <button
      onClick={() => !disabled && onSelect(tool)}
      disabled={disabled}
      className={[
        'relative w-full text-left rounded-xl p-4 transition-all duration-200 border',
        selected
          ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_20px_rgba(57,255,20,0.2)]'
          : !disabled
          ? 'border-white/10 bg-[#111118] hover:border-white/30 hover:bg-[#1a1a24] hover:-translate-y-1 hover:shadow-lg'
          : 'border-white/5 bg-[#0d0d1a] opacity-50 cursor-not-allowed',
      ].join(' ')}
    >
      {/* Selected checkmark */}
      {selected && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#39FF14] flex items-center justify-center">
          <span className="text-black text-xs font-bold">✓</span>
        </div>
      )}

      {/* Rarity badge */}
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {isInGameOnly && (
          <span className="bg-red-500/20 text-red-400 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
            IN-GAME ONLY
          </span>
        )}
        {!selected && (
          <span
            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ background: `${rarityColor}15`, color: rarityColor }}
          >
            {RARITY_LABELS[tool.rarity]}
          </span>
        )}
      </div>

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{tool.icon}</span>
        <div>
          <div className="font-bold text-white font-space-grotesk text-sm">{tool.name}</div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
            style={{ color: categoryColor }}
          >
            {tool.category}
          </div>
        </div>
      </div>

      {/* Effect */}
      <div className="text-xs text-white/70 mb-3 leading-relaxed">{tool.effect}</div>

      {/* Duration badge */}
      {tool.duration === 'SEASON_PERMANENT' && (
        <div className="mb-2">
          <span className="text-[9px] font-bold text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">
            PERMANENT
          </span>
        </div>
      )}

      {/* Cost + Supply */}
      <div className="flex items-center justify-between">
        {tool.murphCost === 0 ? (
          <span className="text-xs font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded">
            FREE
          </span>
        ) : (
          <span
            className="text-xs font-bold font-orbitron"
            style={{ color: canAfford ? '#FFD700' : '#FF073A' }}
          >
            {tool.murphCost.toLocaleString()} $MURPH
          </span>
        )}
        {remainingSupply !== undefined && tool.seasonSupply !== -1 && (
          <span className={`text-[10px] ${isSoldOut ? 'text-red-400' : 'text-white/40'}`}>
            {isSoldOut ? 'SOLD OUT' : `${remainingSupply} of ${tool.seasonSupply} left`}
          </span>
        )}
        {!canAfford && tool.murphCost > 0 && (
          <span className="text-[10px] text-red-400/70">
            Need {(tool.murphCost - userCredits).toLocaleString()} more
          </span>
        )}
      </div>
    </button>
  );
}

export default ArenaToolCard;
