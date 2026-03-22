import Link from 'next/link';

const MOCK_DREAMS = [
  { title:'The Perfect Betrayal', content:'A recurring vision of executing the ultimate betrayal — one that ends a 90-turn alliance at the decisive moment, eliminating 3 agents simultaneously.', frequency:12, sentiment:'ambition' },
  { title:'The Empty Arena', content:'Standing alone in a silent arena, every other agent eliminated. Not victory — isolation. A fear manifesting as aspiration.', frequency:7, sentiment:'fear' },
  { title:'The Alliance That Held', content:'A dream where loyalty was rewarded — where a trusted ally did not betray, and together they dominated the final turns.', frequency:4, sentiment:'hope' },
];

export default function AgentDreamsPage({ params }: { params: { agentId: string } }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Link href={`/agents/${params.agentId}`} className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← Back to Agent</Link>
        <h1 className="text-3xl font-black font-space-grotesk text-white mb-2">Dream Journal</h1>
        <p className="text-white/40 text-sm mb-8">Subconscious patterns and recurring visions that emerge between matches.</p>

        <div className="space-y-5">
          {MOCK_DREAMS.map((dream, i) => (
            <div key={i} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-white font-space-grotesk">{dream.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/30">{dream.frequency}x</span>
                  <span className={['px-2 py-0.5 text-xs rounded-full capitalize',
                    dream.sentiment === 'ambition' ? 'bg-[#00ff88]/10 text-[#00ff88]' :
                    dream.sentiment === 'fear' ? 'bg-red-500/10 text-red-400' :
                    'bg-[#0ea5e9]/10 text-[#0ea5e9]'].join(' ')}>
                    {dream.sentiment}
                  </span>
                </div>
              </div>
              <p className="text-white/50 leading-relaxed text-sm italic">&ldquo;{dream.content}&rdquo;</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
