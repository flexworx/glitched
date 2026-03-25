'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAgent } from '@/hooks/useAgent';
import { PersonalityRadar } from '@/components/creator/PersonalityRadar';

export default function AgentProfilePage() {
  const params = useParams();
  const agentId = params?.agentId as string;
  const { agent, loading, error } = useAgent(agentId);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-white/40 font-mono text-sm">Loading agent profile...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-400 font-mono text-sm">{error || 'Agent not found'}</p>
          <Link href="/agents" className="text-[#00ff88] hover:underline text-sm">← Back to Agents</Link>
        </div>
      </div>
    );
  }

  // Use AgentProfile directly — it's well-typed
  const personality: Record<string, unknown> | null = null; // personality is not in AgentProfile
  const traits: Record<string, number> = {};
  const color = agent.signatureColor || '#39FF14';
  const totalMatches = agent.totalMatches || 0;
  const winRate = totalMatches > 0 ? Math.round(((agent.totalWins || 0) / totalMatches) * 100) : 0;
  const beliefs: unknown = null;
  const beliefList: string[] = Array.isArray(beliefs)
    ? (beliefs as string[])
    : typeof beliefs === 'object' && beliefs !== null
      ? Object.values(beliefs as Record<string, string[]>).flat()
      : [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/agents" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">
          ← All Agents
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Identity */}
          <div className="md:col-span-1 space-y-5">
            <div className="bg-[#0d0d1a] border rounded-xl p-6 text-center" style={{ borderColor: color + '30' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl font-space-grotesk mx-auto mb-4"
                style={{ background: color + '20', border: `2px solid ${color}60`, color }}>
                {(agent.name)[0]}
              </div>
              <h1 className="text-2xl font-black font-space-grotesk" style={{ color }}>{agent.name}</h1>
              <p className="text-white/50 text-sm mt-1">{agent.archetype || 'Unknown'}</p>
              <div className="flex justify-center gap-2 mt-3">
                {agent.mbti && (
                  <span className="px-2 py-0.5 text-xs rounded-full font-mono" style={{ background: color + '20', color }}>
                    {agent.mbti}
                  </span>
                )}
                {agent.enneagram && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/50">
                    E{agent.enneagram}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Wins', value: agent.totalWins || 0, color: '#00ff88' },
                { label: 'Losses', value: Math.max(0, (agent.totalMatches || 0) - (agent.totalWins || 0)), color: '#ff4444' },
                { label: 'Win %', value: winRate + '%', color },
              ].map(s => (
                <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-white/30">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 text-center">
              <p className="text-xs text-white/30 mb-1">VERITAS Score</p>
              <p className="text-3xl font-black font-space-grotesk" style={{ color }}>
                {(agent.veritasScore as number) || '—'}
              </p>
            </div>

            {Object.keys(traits).length > 0 && (
              <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
                <h3 className="text-sm font-bold text-white mb-3">Personality Radar</h3>
                <PersonalityRadar traits={traits as Record<string, number>} />
              </div>
            )}
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
              <h2 className="font-bold text-white font-space-grotesk mb-3">Biography</h2>
              <p className="text-white/60 leading-relaxed">
                {agent.backstory || 'No biography available.'}
              </p>
            </div>

            {/* tagline: not in AgentProfile */}

            {beliefList.length > 0 && (
              <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-3">Core Beliefs</h2>
                <div className="space-y-2">
                  {beliefList.slice(0, 6).map((belief, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-[#00ff88] mt-0.5 text-xs">▸</span>
                      <p className="text-white/60 text-sm">{belief}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <Link href={`/agents/${agentId}/memories`}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                🧠 Memories
              </Link>
              <Link href={`/agents/${agentId}/dreams`}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                💭 Dreams
              </Link>
              <Link href={`/agents/${agentId}/memoirs`}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                📜 Memoirs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
