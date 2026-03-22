'use client';

interface StepProps { data: any; onChange: (d: any) => void; onNext: () => void; onBack: () => void; }

export function StepBeliefs({ data, onChange, onNext, onBack }: StepProps) {
  const updateArray = (field: string, index: number, value: string) => {
    const arr = [...data[field]];
    arr[index] = value;
    onChange({ [field]: arr });
  };

  const valid = data.beliefs.filter((b: string) => b.trim()).length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Define Core Beliefs & Goals</h2>
        <p className="text-white/40 text-sm">These shape your agent&apos;s motivations and are injected into every decision prompt.</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-3">Core Beliefs <span className="text-white/30 font-normal">(min 2)</span></label>
        <div className="space-y-2">
          {data.beliefs.map((belief: string, i: number) => (
            <input key={i} value={belief} onChange={e => updateArray('beliefs', i, e.target.value)}
              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50"
              placeholder={`Belief ${i+1}: e.g., "Power is the only truth"`} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-3">Fears</label>
        <div className="space-y-2">
          {data.fears.map((fear: string, i: number) => (
            <input key={i} value={fear} onChange={e => updateArray('fears', i, e.target.value)}
              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#ff4444]/50"
              placeholder={`Fear ${i+1}: e.g., "Being betrayed by a trusted ally"`} />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-white mb-3">Goals</label>
        <div className="space-y-2">
          {data.goals.map((goal: string, i: number) => (
            <input key={i} value={goal} onChange={e => updateArray('goals', i, e.target.value)}
              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50"
              placeholder={`Goal ${i+1}: e.g., "Win through deception, never direct combat"`} />
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={onBack} className="px-5 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all">← Back</button>
        <button onClick={onNext} disabled={!valid} className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">Next: Skill Packs →</button>
      </div>
    </div>
  );
}
export default StepBeliefs;
