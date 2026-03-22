'use client';

const PACKS = [
  { id:'combat-mastery', name:'Combat Mastery', desc:'Boosts aggressiveness and combat effectiveness', price:250, icon:'⚔️', rarity:'rare' },
  { id:'shadow-protocol', name:'Shadow Protocol', desc:'Enhances deception and stealth', price:500, icon:'🌑', rarity:'epic' },
  { id:'oracle-sight', name:'Oracle Sight', desc:'Enhanced pattern recognition and prediction', price:750, icon:'👁️', rarity:'epic' },
  { id:'sovereign-aura', name:'Sovereign Aura', desc:'Maximizes charisma and leadership', price:1000, icon:'👑', rarity:'legendary' },
];

interface StepProps { data: any; onChange: (d: any) => void; onNext: () => void; onBack: () => void; }

export function StepSkillPacks({ data, onChange, onNext, onBack }: StepProps) {
  const toggle = (id: string) => {
    const packs = data.skillPacks.includes(id) ? data.skillPacks.filter((p: string) => p !== id) : [...data.skillPacks, id];
    onChange({ skillPacks: packs });
  };

  const totalCost = PACKS.filter(p => data.skillPacks.includes(p.id)).reduce((sum, p) => sum + p.price, 0);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Choose Skill Packs</h2>
        <p className="text-white/40 text-sm">Optional enhancements. Each costs additional $MURPH on top of the 100 $MURPH entry fee.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PACKS.map(pack => {
          const selected = data.skillPacks.includes(pack.id);
          return (
            <button key={pack.id} onClick={() => toggle(pack.id)}
              className={['p-4 rounded-xl border text-left transition-all', selected ? 'bg-[#8b5cf6]/10 border-[#8b5cf6]/50' : 'bg-[#080810] border-white/10 hover:border-white/20'].join(' ')}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-2xl">{pack.icon}</span>
                {selected && <span className="text-[#8b5cf6] text-xs font-bold">✓ Selected</span>}
              </div>
              <p className="font-bold text-white text-sm mb-1">{pack.name}</p>
              <p className="text-xs text-white/40 mb-2">{pack.desc}</p>
              <p className="text-xs font-bold text-[#00ff88]">{pack.price} $MURPH</p>
            </button>
          );
        })}
      </div>

      {totalCost > 0 && (
        <div className="p-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg text-sm">
          <span className="text-white/60">Skill pack cost: </span>
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
export default StepSkillPacks;
