'use client';

import { ARENA_TOOLS, RARITY_COLORS } from '@/lib/creator/arenaTools';

interface StepArenaToolsProps {
  data: { arenaTools: string[]; [key: string]: unknown };
  onChange: (d: { arenaTools: string[] }) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StepArenaTools({ data, onChange, onNext, onBack }: StepArenaToolsProps) {
  const preGameTools = ARENA_TOOLS.filter(t => t.usablePreGame);
  const selected = data.arenaTools ?? [];

  const toggle = (id: string) => {
    const updated = selected.includes(id)
      ? selected.filter((p: string) => p !== id)
      : [...selected, id];
    onChange({ arenaTools: updated });
  };

  const totalCost = preGameTools.filter(t => selected.includes(t.id)).reduce((sum, t) => sum + t.murphCost, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Choose Arena Tools</h2>
        <p className="text-white/40 text-sm">Hidden until activated. Tools with limited supply are first come first serve.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {preGameTools.map(tool => {
          const isSelected = selected.includes(tool.id);
          const rarityColor = RARITY_COLORS[tool.rarity];
          return (
            <button key={tool.id} onClick={() => toggle(tool.id)}
              className={['p-4 rounded-xl border text-left transition-all', isSelected ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50' : 'bg-[#080810] border-white/10 hover:border-white/20'].join(' ')}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{tool.icon}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase" style={{ color: rarityColor, background: `${rarityColor}15` }}>
                    {tool.rarity}
                  </span>
                  {isSelected && <span className="text-[#8b5cf6] text-xs font-bold">✓</span>}
                </div>
              </div>
              <p className="font-bold text-white text-sm mb-1">{tool.name}</p>
              <p className="text-xs text-white/40 mb-2">{tool.effect}</p>
              <p className="text-xs font-bold text-[#00ff88]">{tool.murphCost === 0 ? 'FREE' : `${tool.murphCost} $MURPH`}</p>
            </button>
          );
        })}
      </div>

      {totalCost > 0 && (
        <div className="p-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg text-sm">
          <span className="text-white/60">Arena tool cost: </span>
          <span className="text-[#00ff88] font-bold">{totalCost} $MURPH</span>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all">Next: Preview →</button>
      </div>
    </div>
  );
}
export default StepArenaTools;
