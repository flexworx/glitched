'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface PersonalityRadarProps {
  traits: Record<string, number>;
  color?: string;
  size?: number;
}

const TRAIT_LABELS: Record<string, string> = {
  aggressiveness: 'Aggression', ambition: 'Ambition', charisma: 'Charisma',
  deceptiveness: 'Deception', empathy: 'Empathy', loyalty: 'Loyalty',
  riskTolerance: 'Risk', adaptability: 'Adapt', creativity: 'Creative',
  patience: 'Patience',
};

export function PersonalityRadar({ traits, color = '#00ff88', size = 300 }: PersonalityRadarProps) {
  const data = Object.entries(traits)
    .filter(([key]) => key in TRAIT_LABELS)
    .map(([key, value]) => ({
      trait: TRAIT_LABELS[key] || key,
      value: Math.round(value * 100),
      fullMark: 100,
    }));

  return (
    <ResponsiveContainer width="100%" height={size}>
      <RadarChart data={data}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis dataKey="trait" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11 }} />
        <Radar name="Traits" dataKey="value" stroke={color} fill={color} fillOpacity={0.15} strokeWidth={2} />
      </RadarChart>
    </ResponsiveContainer>
  );
}
export default PersonalityRadar;
