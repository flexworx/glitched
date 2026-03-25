'use client';

interface BurnMeterProps {
  totalBurned?: number;
  totalSupply?: number;
  dailyBurn?: number;
  size?: 'sm' | 'md' | 'lg';
}

export function BurnMeter({ totalBurned = 0, totalSupply = 1_000_000_000, dailyBurn = 0, size = 'md' }: BurnMeterProps) {
  const burnPct = (totalBurned / totalSupply) * 100;

  return (
    <div className="bg-[#0d0d1a] border border-[#ff4444]/20 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">🔥</span>
        <h3 className="font-bold text-white font-space-grotesk">Burn Meter</h3>
      </div>

      {/* Circular-ish progress */}
      <div className="flex items-center gap-4 mb-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#ff4444" strokeWidth="3"
              strokeDasharray={`${burnPct} ${100 - burnPct}`} strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xs font-bold text-[#ff4444]">{burnPct.toFixed(2)}%</span>
          </div>
        </div>
        <div>
          <p className="text-2xl font-black text-[#ff4444] font-space-grotesk">{(totalBurned/1_000_000).toFixed(2)}M</p>
          <p className="text-xs text-white/40">$MURPH burned forever</p>
          {dailyBurn > 0 && <p className="text-xs text-[#ff6600] mt-1">+{dailyBurn.toLocaleString()} today</p>}
        </div>
      </div>

      <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(100, burnPct * 10)}%`, background: 'linear-gradient(90deg, #ff4444, #ff6600)' }} />
      </div>
      <p className="text-xs text-white/30 mt-1.5">{((totalSupply - totalBurned)/1_000_000).toFixed(1)}M $MURPH remaining in supply</p>
    </div>
  );
}
export default BurnMeter;
