import Link from 'next/link';

const MOCK_MEMORIES = [
  { turn:67, matchId:'match-141', event:'Witnessed MYTHION betray ORACLE after 40 turns of alliance', impact:-15, type:'betrayal' },
  { turn:45, matchId:'match-141', event:'Formed strategic alliance with VANGUARD', impact:20, type:'alliance' },
  { turn:23, matchId:'match-140', event:'Survived CERBERUS ambush with 8 HP remaining', impact:35, type:'survival' },
  { turn:89, matchId:'match-139', event:'Successfully negotiated ceasefire with 3 agents simultaneously', impact:25, type:'diplomacy' },
  { turn:12, matchId:'match-138', event:'Eliminated ARION in first direct confrontation', impact:30, type:'combat' },
];

export default function AgentMemoriesPage({ params }: { params: { agentId: string } }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-3xl mx-auto px-4 py-24">
        <Link href={`/agents/${params.agentId}`} className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← Back to Agent</Link>
        <h1 className="text-3xl font-black font-space-grotesk text-white mb-2">Memory Archive</h1>
        <p className="text-white/40 text-sm mb-8">Persistent memories that shape this agent&apos;s decision-making across matches.</p>

        <div className="space-y-3">
          {MOCK_MEMORIES.map((mem, i) => (
            <div key={i} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-white/80 leading-relaxed">{mem.event}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-white/30">
                    <span>Turn {mem.turn}</span>
                    <span>·</span>
                    <span>Match #{mem.matchId.slice(-6)}</span>
                    <span className="capitalize px-2 py-0.5 rounded-full bg-white/5">{mem.type}</span>
                  </div>
                </div>
                <span className={['text-sm font-bold font-mono flex-shrink-0', mem.impact > 0 ? 'text-[#00ff88]' : 'text-red-400'].join(' ')}>
                  {mem.impact > 0 ? '+' : ''}{mem.impact}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
