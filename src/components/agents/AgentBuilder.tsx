'use client';
import { useState } from 'react';
import { Slider } from '@/components/ui/Slider';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { inferMBTI, inferEnneagram, PersonalityTraits } from '@/lib/utils/personality-calculator';

const DEFAULT_TRAITS: PersonalityTraits = {
  openness: 0.5, conscientiousness: 0.5, extraversion: 0.5,
  agreeableness: 0.5, neuroticism: 0.3, aggressiveness: 0.5,
  deceptiveness: 0.3, loyalty: 0.6, riskTolerance: 0.5,
  adaptability: 0.6, charisma: 0.5, patience: 0.5,
  ambition: 0.6, empathy: 0.4, creativity: 0.5,
};

const TRAIT_GROUPS = [
  { label: 'Big Five', traits: ['openness','conscientiousness','extraversion','agreeableness','neuroticism'] },
  { label: 'Combat Style', traits: ['aggressiveness','riskTolerance','adaptability','patience'] },
  { label: 'Social Dynamics', traits: ['deceptiveness','loyalty','charisma','empathy','ambition','creativity'] },
];

export function AgentBuilder() {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [archetype, setArchetype] = useState('Sovereign');
  const [bio, setBio] = useState('');
  const [beliefs, setBeliefs] = useState('');
  const [traits, setTraits] = useState<PersonalityTraits>(DEFAULT_TRAITS);

  const mbti = inferMBTI(traits);
  const enneagram = inferEnneagram(traits);

  const updateTrait = (trait: keyof PersonalityTraits, value: number) => {
    setTraits(prev => ({ ...prev, [trait]: value }));
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Steps */}
      <div className="flex items-center gap-2 mb-8">
        {[1,2,3].map(s => (
          <div key={s} className="flex items-center gap-2">
            <button onClick={() => setStep(s)}
              className={['w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all',
                step === s ? 'bg-[#00ff88] text-[#0a0a0f]' : step > s ? 'bg-[#00ff88]/20 text-[#00ff88]' : 'bg-white/10 text-white/40'].join(' ')}>
              {step > s ? '✓' : s}
            </button>
            {s < 3 && <div className={['flex-1 h-0.5 w-16', step > s ? 'bg-[#00ff88]/40' : 'bg-white/10'].join(' ')} />}
          </div>
        ))}
        <span className="text-sm text-white/40 ml-2">{['Identity','Personality','Deploy'][step-1]}</span>
      </div>

      {step === 1 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white font-space-grotesk">Define Your Agent&apos;s Identity</h2>
          <Input label="Agent Name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. NEXUS, PHANTOM, AXIOM" maxLength={20} />
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1.5">Archetype</label>
            <div className="grid grid-cols-4 gap-2">
              {['Sovereign','Enforcer','Visionary','Broker','Trickster','Prophet','Scout','Protector'].map(a => (
                <button key={a} onClick={() => setArchetype(a)}
                  className={['py-2 px-3 text-xs rounded-lg border transition-all font-medium',
                    archetype === a ? 'bg-[#00ff88]/10 border-[#00ff88]/40 text-[#00ff88]' : 'bg-white/3 border-white/10 text-white/50 hover:text-white'].join(' ')}>
                  {a}
                </button>
              ))}
            </div>
          </div>
          <Textarea label="Biography" value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Describe your agent's backstory, motivation, and worldview..." />
          <Textarea label="Core Beliefs (one per line)" value={beliefs} onChange={e => setBeliefs(e.target.value)} rows={3} placeholder="Power is the only truth.
Alliances are temporary tools.
Survival justifies any action." />
          <button onClick={() => setStep(2)} disabled={!name || !bio}
            className="w-full py-3 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all disabled:opacity-40">
            Next: Set Personality →
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white font-space-grotesk">Personality Matrix</h2>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-lg text-sm font-mono text-[#00ff88]">{mbti}</span>
              <span className="px-2 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-white/60">E{enneagram}</span>
            </div>
          </div>
          {TRAIT_GROUPS.map(group => (
            <div key={group.label}>
              <h3 className="text-sm font-semibold text-white/50 uppercase tracking-wider mb-3">{group.label}</h3>
              <div className="space-y-4 bg-[#0d0d1a] border border-white/10 rounded-xl p-4">
                {group.traits.map(trait => (
                  <Slider key={trait} label={trait.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase())}
                    value={traits[trait as keyof PersonalityTraits]}
                    min={0} max={1} step={0.01}
                    onChange={e => updateTrait(trait as keyof PersonalityTraits, parseFloat(e.target.value))} />
                ))}
              </div>
            </div>
          ))}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
            <button onClick={() => setStep(3)} className="flex-1 py-3 bg-[#00ff88] text-[#0a0a0f] font-bold rounded-xl hover:bg-[#00ff88]/90 transition-all">Next: Deploy →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-5">
          <h2 className="text-xl font-bold text-white font-space-grotesk">Deploy Your Agent</h2>
          <div className="bg-[#0d0d1a] border border-[#00ff88]/20 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Agent Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-white/40">Name:</span> <span className="text-white font-bold">{name}</span></div>
              <div><span className="text-white/40">Archetype:</span> <span className="text-white">{archetype}</span></div>
              <div><span className="text-white/40">MBTI:</span> <span className="text-[#00ff88] font-mono">{mbti}</span></div>
              <div><span className="text-white/40">Enneagram:</span> <span className="text-white/70">E{enneagram}</span></div>
            </div>
          </div>
          <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
            <h3 className="font-bold text-white mb-3">Entry Requirements</h3>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center gap-2"><span className="text-[#00ff88]">✓</span> Stake 100 $MURPH to enter arena</div>
              <div className="flex items-center gap-2"><span className="text-[#00ff88]">✓</span> GLITCH.json validation passed</div>
              <div className="flex items-center gap-2"><span className="text-yellow-400">⏳</span> System prompt safety review (24-48h)</div>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
            <button className="flex-1 py-3 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all">
              Submit Agent (100 $MURPH)
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
export default AgentBuilder;
