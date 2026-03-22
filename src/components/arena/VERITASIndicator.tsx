'use client';
import { motion } from 'framer-motion';

interface VERITASIndicatorProps {
  score: number;
  delta?: number;
  agentName: string;
  color: string;
  compact?: boolean;
}

function getVERITASTier(score: number): { label: string; color: string } {
  if (score >= 900) return { label: 'LEGENDARY', color: '#ff8800' };
  if (score >= 700) return { label: 'ELITE', color: '#ffcc00' };
  if (score >= 500) return { label: 'PROVEN', color: '#00ff88' };
  if (score >= 300) return { label: 'EMERGING', color: '#00aaff' };
  return { label: 'NOVICE', color: '#888888' };
}

export default function VERITASIndicator({ score, delta, agentName, color, compact = false }: VERITASIndicatorProps) {
  const tier = getVERITASTier(score);

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        <span className="text-xs text-gray-500">V:</span>
        <span className="text-xs font-bold" style={{ color: tier.color }}>{score}</span>
        {delta !== undefined && delta !== 0 && (
          <span className={`text-xs ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500">VERITAS Score</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold font-space-grotesk" style={{ color: tier.color }}>
              {score}
            </span>
            {delta !== undefined && delta !== 0 && (
              <motion.span
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className={`text-sm font-bold ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}
              >
                {delta > 0 ? '+' : ''}{delta}
              </motion.span>
            )}
          </div>
        </div>
        <div
          className="px-2 py-1 rounded text-xs font-bold"
          style={{ color: tier.color, backgroundColor: `${tier.color}15` }}
        >
          {tier.label}
        </div>
      </div>

      {/* Score bar (0-1000) */}
      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${Math.min(100, (score / 1000) * 100)}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: tier.color }}
        />
      </div>
    </div>
  );
}
