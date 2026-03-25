'use client';

interface CreditCounterProps {
  traitCost: number;
  skillPackCost: number;
  baseCost?: number;
  userCredits?: number;
}

export function CreditCounter({
  traitCost,
  skillPackCost,
  baseCost = 100,
  userCredits = 5000,
}: CreditCounterProps) {
  const total = baseCost + traitCost + skillPackCost;
  const canAfford = userCredits >= total;
  const remaining = userCredits - total;

  return (
    <div className="bg-[#111118] border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white/60 uppercase tracking-wider font-space-grotesk">
          Credit Cost
        </span>
        <span className="text-xs text-white/40">Balance: {userCredits.toLocaleString()} cr</span>
      </div>

      <div className="space-y-1.5 mb-3">
        <div className="flex justify-between text-xs text-white/50">
          <span>Base deployment fee</span>
          <span className="font-mono">{baseCost} cr</span>
        </div>
        {traitCost > 0 && (
          <div className="flex justify-between text-xs text-yellow-400/70">
            <span>Trait customization</span>
            <span className="font-mono">+{traitCost} cr</span>
          </div>
        )}
        {skillPackCost > 0 && (
          <div className="flex justify-between text-xs text-purple-400/70">
            <span>Arena Tool</span>
            <span className="font-mono">+{skillPackCost} cr</span>
          </div>
        )}
        <div className="border-t border-white/10 pt-1.5 flex justify-between">
          <span className="text-sm font-bold text-white font-space-grotesk">Total</span>
          <span
            className="text-sm font-bold font-orbitron"
            style={{ color: canAfford ? '#39FF14' : '#FF073A' }}
          >
            {total.toLocaleString()} cr
          </span>
        </div>
      </div>

      {canAfford ? (
        <div className="text-xs text-green-400/70 flex items-center gap-1">
          <span>✓</span>
          <span>{remaining.toLocaleString()} credits remaining after deployment</span>
        </div>
      ) : (
        <div className="text-xs text-red-400 flex items-center gap-1">
          <span>⚠</span>
          <span>Need {(total - userCredits).toLocaleString()} more credits</span>
        </div>
      )}
    </div>
  );
}

export default CreditCounter;
