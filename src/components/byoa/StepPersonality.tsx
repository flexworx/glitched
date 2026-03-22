'use client';
import { TraitSlider } from '@/components/agent/TraitSlider';

const TRAIT_GROUPS = [
  { label:'Big Five', color:'#00ff88', traits:[
    { key:'openness', label:'Openness', desc:'Curiosity and creativity vs. consistency' },
    { key:'conscientiousness', label:'Conscientiousness', desc:'Organization and discipline' },
    { key:'extraversion', label:'Extraversion', desc:'Social energy and assertiveness' },
    { key:'agreeableness', label:'Agreeableness', desc:'Cooperation vs. competition' },
    { key:'neuroticism', label:'Neuroticism', desc:'Emotional instability and anxiety' },
  ]},
  { label:'Combat Style', color:'#ff4444', traits:[
    { key:'aggressiveness', label:'Aggressiveness', desc:'Tendency to initiate attacks' },
    { key:'riskTolerance', label:'Risk Tolerance', desc:'Willingness to take dangerous actions' },
    { key:'adaptability', label:'Adaptability', desc:'Ability to change strategy mid-match' },
    { key:'patience', label:'Patience', desc:'Willingness to wait for the right moment' },
  ]},
  { label:'Social Dynamics', color:'#8b5cf6', traits:[
    { key:'deceptiveness', label:'Deceptiveness', desc:'Tendency to lie and manipulate' },
    { key:'loyalty', label:'Loyalty', desc:'Faithfulness to alliances' },
    { key:'charisma', label:'Charisma', desc:'Ability to inspire and lead' },
    { key:'empathy', label:'Empathy', desc:'Understanding others' motivations' },
    { key:'ambition', label:'Ambition', desc:'Drive to win at all costs' },
    { key:'creativity', label:'Creativity', desc:'Novel and unexpected approaches' },
  ]},
];

interface StepProps { data: any; onChange: (d: any) => void; onNext: () => void; onBack: () => void; }

export function StepPersonality({ data, onChange, onNext, onBack }: StepProps) {
  const updateTrait = (key: string, value: number) => onChange({ traits: { ...data.traits, [key]: value } });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Tune Your Agent&apos;s Personality</h2>
        <p className="text-white/40 text-sm">Adjust 15 traits across 3 categories. These directly control your agent&apos;s decision-making.</p>
      </div>

      {TRAIT_GROUPS.map(group => (
        <div key={group.label}>
          <h3 className="text-sm font-bold mb-3" style={{ color: group.color }}>{group.label}</h3>
          <div className="space-y-4">
            {group.traits.map(trait => (
              <TraitSlider key={trait.key} name={trait.key} label={trait.label} description={trait.desc}
                value={data.traits[trait.key] ?? 0.5} onChange={v => updateTrait(trait.key, v)} color={group.color} />
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all">Next: Beliefs →</button>
      </div>
    </div>
  );
}
export default StepPersonality;
