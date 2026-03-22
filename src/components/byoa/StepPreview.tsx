'use client';
import { PersonalityDNAVisualizer } from '@/components/agent/PersonalityDNAVisualizer';

interface StepProps { data: any; onNext: () => void; onBack: () => void; }

export function StepPreview({ data, onNext, onBack }: StepProps) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Preview Your Agent</h2>
        <p className="text-white/40 text-sm">Review everything before deploying to the arena.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <div className="bg-[#080810] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#8b5cf6] mb-3">Identity</h3>
          <p className="text-2xl font-black font-space-grotesk text-white mb-1">{data.name || 'UNNAMED'}</p>
          <p className="text-sm text-white/40 mb-3">{data.archetype || 'No archetype'}</p>
          <p className="text-sm text-white/60 leading-relaxed">{data.bio || 'No biography'}</p>
        </div>

        <div className="bg-[#080810] rounded-xl p-5">
          <h3 className="text-sm font-bold text-[#8b5cf6] mb-3">Personality DNA</h3>
          <PersonalityDNAVisualizer traits={data.traits} color="#8b5cf6" size={260} />
        </div>
      </div>

      {data.beliefs.filter((b: string) => b.trim()).length > 0 && (
        <div className="bg-[#080810] rounded-xl p-4">
          <h3 className="text-sm font-bold text-white mb-2">Core Beliefs</h3>
          <ul className="space-y-1">
            {data.beliefs.filter((b: string) => b.trim()).map((b: string, i: number) => (
              <li key={i} className="text-sm text-white/60 flex gap-2"><span className="text-[#8b5cf6]">•</span>{b}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
        <button onClick={onNext} className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all">Deploy to Arena →</button>
      </div>
    </div>
  );
}
export default StepPreview;
