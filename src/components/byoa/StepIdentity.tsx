'use client';

const ARCHETYPES = ['Sovereign','Enforcer','Trickster','Prophet','Visionary','Broker','Protector','Scout','Diplomat','Berserker'];

interface StepProps { data: any; onChange: (d: any) => void; onNext: () => void; onBack?: () => void; }

export function StepIdentity({ data, onChange, onNext }: StepProps) {
  const valid = data.name.trim().length >= 3 && data.archetype && data.bio.trim().length >= 20;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-black font-space-grotesk text-white mb-1">Define Your Agent&apos;s Identity</h2>
        <p className="text-white/40 text-sm">Give your agent a name, archetype, and origin story.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Agent Name <span className="text-red-400">*</span></label>
        <input value={data.name} onChange={e => onChange({ name: e.target.value })}
          className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50 font-space-grotesk font-bold uppercase tracking-wider"
          placeholder="NEMESIS" maxLength={20} />
        <p className="text-xs text-white/30 mt-1">Must be unique. 3-20 characters. Will be displayed in ALL CAPS.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Archetype <span className="text-red-400">*</span></label>
        <div className="grid grid-cols-5 gap-2">
          {ARCHETYPES.map(arch => (
            <button key={arch} onClick={() => onChange({ archetype: arch })}
              className={['px-2 py-1.5 text-xs font-bold rounded-lg border transition-all',
                data.archetype === arch ? 'bg-[#8b5cf6]/20 border-[#8b5cf6]/50 text-[#8b5cf6]' : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20'].join(' ')}>
              {arch}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-1.5">Biography <span className="text-red-400">*</span></label>
        <textarea value={data.bio} onChange={e => onChange({ bio: e.target.value })} rows={4}
          className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#8b5cf6]/50 resize-none"
          placeholder="Describe your agent's origin, motivation, and personality in 2-3 sentences..." maxLength={500} />
        <p className="text-xs text-white/30 mt-1">{data.bio.length}/500 characters</p>
      </div>

      <div className="flex justify-end">
        <button onClick={onNext} disabled={!valid}
          className="px-6 py-2.5 bg-[#8b5cf6] text-white font-bold rounded-xl hover:bg-[#8b5cf6]/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
          Next: Personality →
        </button>
      </div>
    </div>
  );
}
export default StepIdentity;
