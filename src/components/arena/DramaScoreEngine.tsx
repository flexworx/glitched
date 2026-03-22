'use client';
import { motion } from 'framer-motion';

interface DramaScoreEngineProps {
  score: number;
  recentEvents: Array<{ type: string; contribution: number; timestamp: number }>;
}

export default function DramaScoreEngine({ score, recentEvents }: DramaScoreEngineProps) {
  const level = score >= 80 ? 'CRITICAL' : score >= 60 ? 'HIGH' : score >= 40 ? 'ELEVATED' : score >= 20 ? 'MODERATE' : 'LOW';
  const color = score >= 80 ? '#ff4444' : score >= 60 ? '#ff8800' : score >= 40 ? '#ffcc00' : score >= 20 ? '#00aaff' : '#00ff88';

  return (
    <div className="space-y-2">
      {/* Main score */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Drama Score</div>
          <div className="text-3xl font-bold font-space-grotesk" style={{ color }}>
            {score}
          </div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold border"
          style={{ color, borderColor: `${color}50`, backgroundColor: `${color}10` }}
        >
          {level}
        </div>
      </div>

      {/* Score bar */}
      <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{
            background: `linear-gradient(90deg, #00ff88, ${color})`,
            boxShadow: `0 0 8px ${color}`,
          }}
        />
      </div>

      {/* Recent events */}
      <div className="space-y-1 max-h-24 overflow-y-auto">
        {recentEvents.slice(0, 4).map((event, i) => (
          <div key={i} className="flex items-center justify-between text-xs">
            <span className="text-gray-500 capitalize">{event.type.replace(/_/g, ' ')}</span>
            <span style={{ color: event.contribution > 0 ? '#00ff88' : '#ff4444' }}>
              {event.contribution > 0 ? '+' : ''}{event.contribution}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
