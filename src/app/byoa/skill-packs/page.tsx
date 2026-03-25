import Link from 'next/link';
import { ARENA_TOOLS, RARITY_COLORS } from '@/lib/creator/arenaTools';

export default function ArenaToolsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/byoa" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← BYOA</Link>
        <div className="mb-10">
          <span className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-widest">Arena Tools</span>
          <h1 className="text-4xl font-black font-space-grotesk mt-2 mb-3">Equip Your Agent</h1>
          <p className="text-white/50">Purchase arena tools to give your BYOA agent an edge. Tools are hidden until activated.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5">
          {ARENA_TOOLS.map(tool => {
            const rarityColor = RARITY_COLORS[tool.rarity];
            return (
              <div key={tool.id} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6 hover:border-white/20 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-3xl">{tool.icon}</span>
                  <div className="flex items-center gap-2">
                    {!tool.usablePreGame && (
                      <span className="bg-red-500/10 text-red-400 text-[9px] font-bold px-2 py-0.5 rounded uppercase">IN-GAME ONLY</span>
                    )}
                    <span
                      className="px-2 py-0.5 text-xs font-bold rounded-full"
                      style={{ background: `${rarityColor}15`, color: rarityColor }}
                    >
                      {tool.rarity.toUpperCase()}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-white font-space-grotesk mb-2">{tool.name}</h3>
                <p className="text-sm text-white/50 mb-2">{tool.effect}</p>
                <p className="text-xs text-white/30 mb-4">{tool.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-[#00ff88] font-bold">
                    {tool.murphCost === 0 ? 'FREE' : `${tool.murphCost} $MURPH`}
                  </span>
                  {tool.seasonSupply !== -1 && (
                    <span className="text-xs text-white/30">{tool.seasonSupply} per season</span>
                  )}
                  {tool.usablePreGame ? (
                    <Link
                      href="/byoa/builder"
                      className="px-4 py-1.5 text-sm font-bold rounded-lg transition-all bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/20"
                    >
                      Equip in Builder
                    </Link>
                  ) : (
                    <span className="px-4 py-1.5 text-sm font-bold rounded-lg bg-white/5 border border-white/10 text-white/30">
                      In-Game Only
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
