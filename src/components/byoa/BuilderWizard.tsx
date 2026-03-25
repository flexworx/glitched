'use client';
import { useState } from 'react';
import { StepIdentity } from './StepIdentity';
import { StepPersonality } from './StepPersonality';
import { StepBeliefs } from './StepBeliefs';
import { StepArenaTools } from './StepArenaTools';
import { StepPreview } from './StepPreview';
import { StepDeploy } from './StepDeploy';

const STEPS = [
  { id:1, label:'Identity', icon:'✍️' },
  { id:2, label:'Personality', icon:'🎛️' },
  { id:3, label:'Beliefs', icon:'💭' },
  { id:4, label:'Arena Tools', icon:'⚡' },
  { id:5, label:'Preview', icon:'👁️' },
  { id:6, label:'Deploy', icon:'🚀' },
];

export function BuilderWizard() {
  const [step, setStep] = useState(1);
  const [agentData, setAgentData] = useState({
    name: '', archetype: '', bio: '', beliefs: ['', '', ''], fears: ['', ''], goals: ['', ''],
    traits: { openness:0.5, conscientiousness:0.5, extraversion:0.5, agreeableness:0.5, neuroticism:0.5, aggressiveness:0.5, deceptiveness:0.5, loyalty:0.5, riskTolerance:0.5, adaptability:0.5, charisma:0.5, patience:0.5, ambition:0.5, empathy:0.5, creativity:0.5 },
    arenaTools: [] as string[],
  });

  const update = (partial: Partial<typeof agentData>) => setAgentData(prev => ({ ...prev, ...partial }));

  return (
    <div>
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => step > s.id && setStep(s.id)}
              className={['flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all',
                step === s.id ? 'bg-[#8b5cf6] text-white' :
                step > s.id ? 'bg-[#8b5cf6]/20 text-[#8b5cf6] cursor-pointer hover:bg-[#8b5cf6]/30' :
                'bg-white/5 text-white/30 cursor-default'].join(' ')}>
              <span>{s.icon}</span>{s.label}
            </button>
            {i < STEPS.length - 1 && <span className="text-white/20">→</span>}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="bg-[#0d0d1a] border border-white/10 rounded-2xl p-6">
        {step === 1 && <StepIdentity data={agentData} onChange={update} onNext={() => setStep(2)} />}
        {step === 2 && <StepPersonality data={agentData} onChange={update} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
        {step === 3 && <StepBeliefs data={agentData} onChange={update} onNext={() => setStep(4)} onBack={() => setStep(2)} />}
        {step === 4 && <StepArenaTools data={agentData} onChange={update} onNext={() => setStep(5)} onBack={() => setStep(3)} />}
        {step === 5 && <StepPreview data={agentData} onNext={() => setStep(6)} onBack={() => setStep(4)} />}
        {step === 6 && <StepDeploy data={agentData} onBack={() => setStep(5)} />}
      </div>
    </div>
  );
}
export default BuilderWizard;
