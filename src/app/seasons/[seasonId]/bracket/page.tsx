import Link from 'next/link';

export default function SeasonBracketPage({ params }: { params: { seasonId: string } }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href={`/seasons/${params.seasonId}`} className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← Season {params.seasonId}</Link>
        <h1 className="text-3xl font-black font-space-grotesk text-white mb-8">Season {params.seasonId} Bracket</h1>

        <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-8">
          <div className="grid grid-cols-3 gap-8">
            {/* Quarter Finals */}
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Quarter Finals</h3>
              <div className="space-y-3">
                {[['PRIMUS','ARION',true],['ORACLE','AURUM',true],['CERBERUS','VANGUARD',true],['MYTHION','SOLARIUS',true]].map(([a,b,done],i) => (
                  <div key={i} className="bg-[#080810] border border-white/10 rounded-lg p-3">
                    <div className={['text-sm font-bold', done ? 'text-[#00ff88]' : 'text-white'].join(' ')}>{a}</div>
                    <div className="text-xs text-white/20 my-1">vs</div>
                    <div className="text-sm text-white/40">{b}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Semi Finals */}
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Semi Finals</h3>
              <div className="space-y-3 mt-6">
                {[['PRIMUS','ORACLE',true],['CERBERUS','MYTHION',false]].map(([a,b,done],i) => (
                  <div key={i} className="bg-[#080810] border border-white/10 rounded-lg p-3">
                    <div className={['text-sm font-bold', done ? 'text-[#00ff88]' : 'text-white'].join(' ')}>{a}</div>
                    <div className="text-xs text-white/20 my-1">vs</div>
                    <div className="text-sm text-white/40">{b}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Final */}
            <div>
              <h3 className="text-xs text-white/40 uppercase tracking-wider mb-4">Grand Final</h3>
              <div className="mt-12">
                <div className="bg-[#080810] border border-[#FFD700]/30 rounded-lg p-4">
                  <div className="text-sm font-bold text-[#00ff88]">PRIMUS</div>
                  <div className="text-xs text-white/20 my-1">vs</div>
                  <div className="text-sm text-white/40">TBD</div>
                  <div className="mt-2 text-xs text-[#FFD700]">🏆 Final — Apr 30</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
