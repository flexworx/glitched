'use client';

import type { SkillPack } from '@/types/agent';

interface SkillPackCardProps {
  pack: SkillPack;
  selected: boolean;
  onSelect: (pack: SkillPack) => void;
  userCredits?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  combat: '#FF073A',
  social: '#39FF14',
  economic: '#FFD700',
  intelligence: '#00D4FF',
  survival: '#FF6B35',
  chaos: '#7B2FBE',
};

export function SkillPackCard({ pack, selected, onSelect, userCredits = 5000 }: SkillPackCardProps) {
  const canAfford = userCredits >= pack.creditCost;
  const categoryColor = CATEGORY_COLORS[pack.category] ?? '#39FF14';

  return (
    <button
      onClick={() => canAfford && onSelect(pack)}
      disabled={!canAfford}
      className={[
        'relative w-full text-left rounded-xl p-4 transition-all duration-200 border',
        selected
          ? 'border-[#39FF14] bg-[#39FF14]/10 shadow-[0_0_20px_rgba(57,255,20,0.2)]'
          : canAfford
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

      {/* Premium badge */}
      {pack.isPremium && (
        <div className="absolute top-2 right-2 bg-[#7B2FBE] text-white text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
          PREMIUM
        </div>
      )}

      {/* Icon + Name */}
      <div className="flex items-center gap-3 mb-3">
        <span className="text-2xl">{pack.icon}</span>
        <div>
          <div className="font-bold text-white font-space-grotesk text-sm">{pack.name}</div>
          <div
            className="text-[10px] font-semibold uppercase tracking-wider mt-0.5"
            style={{ color: categoryColor }}
          >
            {pack.category}
          </div>
        </div>
      </div>

      {/* Arena bonus */}
      <div className="text-xs text-white/70 mb-3 leading-relaxed">{pack.arenaBonus}</div>

      {/* Cost */}
      <div className="flex items-center justify-between">
        {pack.creditCost === 0 ? (
          <span className="text-xs font-bold text-[#39FF14] bg-[#39FF14]/10 px-2 py-0.5 rounded">
            FREE
          </span>
        ) : (
          <span
            className="text-xs font-bold font-orbitron"
            style={{ color: canAfford ? '#FFD700' : '#FF073A' }}
          >
            {pack.creditCost.toLocaleString()} cr
          </span>
        )}
        {!canAfford && pack.creditCost > 0 && (
          <span className="text-[10px] text-red-400/70">
            Need {(pack.creditCost - userCredits).toLocaleString()} more
          </span>
        )}
      </div>
    </button>
  );
}

export default SkillPackCard;
