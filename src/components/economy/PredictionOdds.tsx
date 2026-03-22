'use client';

interface PredictionOddsProps {
  options: Array<{ id: string; label: string; odds: number; totalBet: number }>;
  totalPool: number;
  selectedId?: string;
  onSelect?: (id: string) => void;
}

export function PredictionOdds({ options, totalPool, selectedId, onSelect }: PredictionOddsProps) {
  return (
    <div className="space-y-2">
      {options.map(opt => {
        const pct = totalPool > 0 ? Math.round((opt.totalBet / totalPool) * 100) : 0;
        const selected = selectedId === opt.id;

        return (
          <button key={opt.id} onClick={() => onSelect?.(opt.id)}
            className={['w-full p-3 rounded-lg border text-left transition-all', selected ? 'bg-[#00ff88]/10 border-[#00ff88]/40' : 'bg-[#080810] border-white/10 hover:border-white/20'].join(' ')}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={['text-sm font-bold', selected ? 'text-[#00ff88]' : 'text-white'].join(' ')}>{opt.label}</span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-white/40">{pct}%</span>
                <span className="text-sm font-bold font-mono text-[#00ff88]">{opt.odds}x</span>
              </div>
            </div>
            <div className="h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: selected ? '#00ff88' : '#ffffff30' }} />
            </div>
          </button>
        );
      })}
    </div>
  );
}
export default PredictionOdds;
