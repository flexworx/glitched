'use client';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

interface PersonalityRadarProps {
  traits: Record<string, number>;
  color: string;
  size?: number;
}

const DISPLAY_TRAITS = [
  { key: 'aggressiveness', label: 'Aggression' },
  { key: 'deceptiveness', label: 'Deception' },
  { key: 'loyalty', label: 'Loyalty' },
  { key: 'charisma', label: 'Charisma' },
  { key: 'adaptability', label: 'Adapt' },
  { key: 'riskTolerance', label: 'Risk' },
  { key: 'empathy', label: 'Empathy' },
  { key: 'ambition', label: 'Ambition' },
];

export default function PersonalityRadar({ traits, color, size = 280 }: PersonalityRadarProps) {
  const data = DISPLAY_TRAITS.map(({ key, label }) => ({
    trait: label,
    value: Math.round((traits[key] ?? 0.5) * 100),
    fullMark: 100,
  }));

  return (
    <div style={{ width: '100%', height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="#1f2937" />
          <PolarAngleAxis dataKey="trait" tick={{ fill: '#9ca3af', fontSize: 11 }} />
          <Radar
            name="Traits"
            dataKey="value"
            stroke={color}
            fill={color}
            fillOpacity={0.15}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
