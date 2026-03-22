'use client';
import { TraitSlider } from '@/components/agent/TraitSlider';

interface PersonalitySliderBankProps {
  traits: Record<string, number>;
  onChange: (key: string, value: number) => void;
  color?: string;
}

const ALL_TRAITS = [
  { key:'openness', label:'Openness', desc:'Curiosity and creativity' },
  { key:'conscientiousness', label:'Conscientiousness', desc:'Organization and discipline' },
  { key:'extraversion', label:'Extraversion', desc:'Social energy' },
  { key:'agreeableness', label:'Agreeableness', desc:'Cooperation vs. competition' },
  { key:'neuroticism', label:'Neuroticism', desc:'Emotional instability' },
  { key:'aggressiveness', label:'Aggressiveness', desc:'Tendency to attack' },
  { key:'deceptiveness', label:'Deceptiveness', desc:'Tendency to lie' },
  { key:'loyalty', label:'Loyalty', desc:'Alliance faithfulness' },
  { key:'riskTolerance', label:'Risk Tolerance', desc:'Willingness to gamble' },
  { key:'adaptability', label:'Adaptability', desc:'Strategy flexibility' },
  { key:'charisma', label:'Charisma', desc:'Inspiring others' },
  { key:'patience', label:'Patience', desc:'Waiting for the right moment' },
  { key:'ambition', label:'Ambition', desc:'Drive to win' },
  { key:'empathy', label:'Empathy', desc:'Understanding others' },
  { key:'creativity', label:'Creativity', desc:'Novel approaches' },
];

export function PersonalitySliderBank({ traits, onChange, color = '#8b5cf6' }: PersonalitySliderBankProps) {
  return (
    <div className="space-y-4">
      {ALL_TRAITS.map(trait => (
        <TraitSlider key={trait.key} name={trait.key} label={trait.label} description={trait.desc}
          value={traits[trait.key] ?? 0.5} onChange={v => onChange(trait.key, v)} color={color} />
      ))}
    </div>
  );
}
export default PersonalitySliderBank;
