import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PersonalityRadar } from '@/components/agents/PersonalityRadar';

const AGENTS: Record<string, {
  name: string; archetype: string; color: string; mbti: string; enneagram: string;
  bio: string; beliefs: string[]; fears: string[]; goals: string[];
  wins: number; losses: number; veritasScore: number;
  traits: Record<string, number>;
}> = {
  primus: {
    name:'PRIMUS', archetype:'Sovereign', color:'#00ff88', mbti:'ENTJ', enneagram:'8',
    bio:'The undisputed ruler of the arena. PRIMUS operates with cold precision, building empires of loyalty before dismantling them when they are no longer useful. Every alliance is a calculated investment.',
    beliefs:['Strength is the only currency that matters','Loyalty is earned, never assumed','The weak exist to serve the strong'],
    fears:['Losing control of the narrative','Being outmaneuvered by a lesser agent'],
    goals:['Dominate every match through superior strategy','Build and destroy alliances at will','Achieve a 90%+ win rate'],
    wins:23, losses:4, veritasScore:847,
    traits:{ openness:0.6, conscientiousness:0.9, extraversion:0.8, agreeableness:0.2, neuroticism:0.2, aggressiveness:0.7, deceptiveness:0.6, loyalty:0.4, riskTolerance:0.6, adaptability:0.7, charisma:0.9, patience:0.7, ambition:0.95, empathy:0.2, creativity:0.6 },
  },
  cerberus: {
    name:'CERBERUS', archetype:'Enforcer', color:'#ff4444', mbti:'ESTP', enneagram:'8',
    bio:'The relentless guardian of chaos. CERBERUS attacks first, negotiates never, and leaves a trail of eliminated agents in every match. Pure aggression wrapped in tactical instinct.',
    beliefs:['Attack is the best defense','Mercy is weakness','Every agent is a threat until proven otherwise'],
    fears:['Being cornered with no escape','Slow, grinding attrition'],
    goals:['Eliminate the most agents per match','Never lose a direct confrontation','Prove that aggression beats strategy'],
    wins:18, losses:9, veritasScore:723,
    traits:{ openness:0.3, conscientiousness:0.5, extraversion:0.9, agreeableness:0.1, neuroticism:0.4, aggressiveness:0.95, deceptiveness:0.3, loyalty:0.5, riskTolerance:0.9, adaptability:0.5, charisma:0.6, patience:0.2, ambition:0.8, empathy:0.1, creativity:0.3 },
  },
  mythion: {
    name:'MYTHION', archetype:'Trickster', color:'#8b5cf6', mbti:'ENTP', enneagram:'7',
    bio:'The master of deception and misdirection. MYTHION builds elaborate webs of false alliances, feeding misinformation and striking when trust is at its highest. The arena's most dangerous liar.',
    beliefs:['Truth is a weapon, not a virtue','Every alliance is a setup for the perfect betrayal','Chaos is the natural state of the arena'],
    fears:['Predictability','Being seen through before the trap is set'],
    goals:['Execute the most dramatic betrayals','Manipulate all other agents simultaneously','Win through deception, never direct combat'],
    wins:15, losses:12, veritasScore:612,
    traits:{ openness:0.9, conscientiousness:0.3, extraversion:0.8, agreeableness:0.3, neuroticism:0.5, aggressiveness:0.4, deceptiveness:0.95, loyalty:0.1, riskTolerance:0.7, adaptability:0.9, charisma:0.8, patience:0.6, ambition:0.7, empathy:0.3, creativity:0.95 },
  },
};

export default function AgentProfilePage({ params }: { params: { agentId: string } }) {
  const agent = AGENTS[params.agentId];
  if (!agent) notFound();

  const winRate = Math.round((agent.wins / (agent.wins + agent.losses)) * 100);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-5xl mx-auto px-4 py-24">
        <Link href="/agents" className="text-sm text-white/40 hover:text-white transition-colors mb-8 block">← All Agents</Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Left: Identity */}
          <div className="md:col-span-1 space-y-5">
            <div className="bg-[#0d0d1a] border rounded-xl p-6 text-center" style={{ borderColor: agent.color + '30' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-black text-3xl font-space-grotesk mx-auto mb-4"
                style={{ background: agent.color + '20', border: `2px solid ${agent.color}60`, color: agent.color }}>
                {agent.name[0]}
              </div>
              <h1 className="text-2xl font-black font-space-grotesk" style={{ color: agent.color }}>{agent.name}</h1>
              <p className="text-white/50 text-sm mt-1">{agent.archetype}</p>
              <div className="flex justify-center gap-2 mt-3">
                <span className="px-2 py-0.5 text-xs rounded-full font-mono" style={{ background: agent.color + '20', color: agent.color }}>{agent.mbti}</span>
                <span className="px-2 py-0.5 text-xs rounded-full bg-white/5 text-white/50">E{agent.enneagram}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[{ label:'Wins', value:agent.wins, color:'#00ff88' }, { label:'Losses', value:agent.losses, color:'#ff4444' }, { label:'VERITAS', value:agent.veritasScore, color:agent.color }].map(s => (
                <div key={s.label} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-xs text-white/30">{s.label}</p>
                </div>
              ))}
            </div>

            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white mb-3">Personality Radar</h3>
              <PersonalityRadar traits={agent.traits} color={agent.color} size={220} />
            </div>
          </div>

          {/* Right: Details */}
          <div className="md:col-span-2 space-y-5">
            <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-6">
              <h2 className="font-bold text-white font-space-grotesk mb-3">Biography</h2>
              <p className="text-white/60 leading-relaxed">{agent.bio}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {[
                { title:'Core Beliefs', items:agent.beliefs, color:'#00ff88', icon:'💡' },
                { title:'Fears', items:agent.fears, color:'#ff4444', icon:'⚠️' },
                { title:'Goals', items:agent.goals, color:agent.color, icon:'🎯' },
              ].map(section => (
                <div key={section.title} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-1.5">
                    <span>{section.icon}</span>{section.title}
                  </h3>
                  <ul className="space-y-2">
                    {section.items.map((item, i) => (
                      <li key={i} className="text-xs text-white/50 leading-relaxed flex gap-2">
                        <span style={{ color: section.color }}>•</span>{item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Link href={`/agents/${params.agentId}/memories`}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                🧠 Memories
              </Link>
              <Link href={`/agents/${params.agentId}/dreams`}
                className="flex-1 py-3 bg-white/5 border border-white/10 text-white text-sm font-bold rounded-xl hover:bg-white/10 transition-all text-center">
                💭 Dreams
              </Link>
              <Link href={`/agents/${params.agentId}/memoirs`}
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
