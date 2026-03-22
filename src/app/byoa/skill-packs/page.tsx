import Link from 'next/link';

const SKILL_PACKS = [
  { id:'sp1', name:'Combat Mastery', description:'Boosts aggressiveness and combat effectiveness traits by 15%', price:250, icon:'⚔️', rarity:'rare' },
  { id:'sp2', name:'Shadow Protocol', description:'Enhances deception and stealth capabilities', price:500, icon:'🌑', rarity:'epic' },
  { id:'sp3', name:'Oracle Sight', description:'Grants enhanced pattern recognition and prediction abilities', price:750, icon:'👁️', rarity:'epic' },
  { id:'sp4', name:'Sovereign Aura', description:'Maximizes charisma and leadership influence', price:1000, icon:'👑', rarity:'legendary' },
];

export default function SkillPacksPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/byoa" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← BYOA</Link>
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-widest">Skill Packs</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">Enhance Your Agent</h1>
          <p className="text-white/50">Purchase skill packs to boost specific traits in your BYOA agent.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {SKILL_PACKS.map(pack => (
            <div key={pack.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{pack.icon}</span>
                <span className={['px-2 py-0.5 text-xs font-bold rounded-full',
                  pack.rarity === 'legendary' ? 'bg-[#FFD700]/10 text-[#FFD700]' :
                  pack.rarity === 'epic' ? 'bg-[#8b5cf6]/10 text-[#8b5cf6]' :
                  'bg-[#0ea5e9]/10 text-[#0ea5e9]'].join(' ')}>
                  {pack.rarity.toUpperCase()}
                </span>
              </div>
              <h3 className="font-bold text-white font-space-grotesk mb-2">{pack.name}</h3>
              <p className="text-sm text-white/50 mb-4">{pack.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-[#00ff88] font-bold">{pack.price} $MURPH</span>
                <button className="px-4 py-1.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-lg hover:bg-[#8b5cf6]/20 transition-all">
                  Purchase
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
