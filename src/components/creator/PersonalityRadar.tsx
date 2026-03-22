'use client';

import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import type { TraitValues } from '@/types/agent';
import { TRAIT_CATEGORIES } from '@/lib/creator/traits';

interface PersonalityRadarProps {
  traits: TraitValues;
  size?: number;
}

export function PersonalityRadar({ traits, size = 280 }: PersonalityRadarProps) {
  const data = TRAIT_CATEGORIES.map((cat) => {
    const catTraits = cat.traits.map((t) => traits[t.id] ?? 50);
    const avg = catTraits.reduce((s, v) => s + v, 0) / catTraits.length;
    return {
      category: cat.label.split(' ')[0], // Shortened label
      value: Math.round(avg),
      fullMark: 100,
      color: cat.color,
    };
  });

  return (
    <div style={{ width: size, height: size }} className="mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
          <PolarGrid
            stroke="rgba(255,255,255,0.1)"
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey="category"
            tick={{ fill: '#A0A0B0', fontSize: 11, fontFamily: 'Space Grotesk' }}
          />
          <Radar
            name="Personality"
            dataKey="value"
            stroke="#39FF14"
            fill="#39FF14"
            fillOpacity={0.15}
            strokeWidth={2}
            dot={{ fill: '#39FF14', r: 3 }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default PersonalityRadar;
