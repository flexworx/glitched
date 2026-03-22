'use client';
import { useMemo } from 'react';

interface PersonalityDNAVisualizerProps {
  traits: Record<string, number>;
  color?: string;
  size?: number;
}

export function PersonalityDNAVisualizer({ traits, color = '#00ff88', size = 300 }: PersonalityDNAVisualizerProps) {
  const bars = useMemo(() => Object.entries(traits).map(([key, value]) => ({
    key,
    label: key.replace(/([A-Z])/g, ' $1').trim(),
    value: Math.max(0, Math.min(1, value)),
  })), [traits]);

  return (
    <div className="space-y-2" style={{ width: size }}>
      {bars.map(bar => (
        <div key={bar.key}>
          <div className="flex justify-between items-center mb-0.5">
            <span className="text-xs text-white/50 capitalize">{bar.label}</span>
            <span className="text-xs font-mono" style={{ color }}>{Math.round(bar.value * 100)}</span>
          </div>
          <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${bar.value * 100}%`, background: `linear-gradient(90deg, ${color}80, ${color})` }} />
          </div>
        </div>
      ))}
    </div>
  );
}
export default PersonalityDNAVisualizer;
