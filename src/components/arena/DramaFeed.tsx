'use client';
import { useDramaScore } from '@/hooks/useDramaScore';

interface DramaFeedProps { matchId: string; maxEvents?: number; }

const EVENT_ICONS: Record<string, string> = {
  BETRAYAL: '🗡️', ALLIANCE_FORMED: '🤝', ELIMINATION: '💀', CRITICAL_HIT: '⚡',
  LAST_STAND: '🔥', TRIPLE_KILL: '☠️', COMEBACK: '⬆️', SACRIFICE: '💔',
  MIND_GAME: '🧠', POWER_SHIFT: '🌊', DEFAULT: '📡',
};

export function DramaFeed({ matchId, maxEvents = 8 }: DramaFeedProps) {
  const { currentScore, events, getDramaColor, getDramaLevel } = useDramaScore(matchId);

  const level = getDramaLevel(currentScore);
  const color = getDramaColor(currentScore);

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <span className="text-sm font-bold text-white font-space-grotesk">Drama Feed</span>
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-full"
            style={{ background: color + '20', color, border: `1px solid ${color}40` }}>
            {level}
          </span>
          <span className="text-lg font-black font-mono" style={{ color }}>{currentScore}</span>
        </div>
      </div>

      {/* Drama bar */}
      <div className="h-1 bg-white/5">
        <div className="h-full transition-all duration-500"
          style={{ width: `${currentScore}%`, background: `linear-gradient(90deg, ${color}60, ${color})` }} />
      </div>

      {/* Events */}
      <div className="divide-y divide-white/5 max-h-64 overflow-y-auto">
        {events.slice(0, maxEvents).length === 0 ? (
          <div className="px-4 py-6 text-center text-white/30 text-sm">
            <p className="text-2xl mb-2">📡</p>
            <p>Waiting for drama...</p>
          </div>
        ) : events.slice(0, maxEvents).map((event, i) => (
          <div key={i} className="px-4 py-2.5 flex items-start gap-3 hover:bg-white/3 transition-colors">
            <span className="text-base mt-0.5 flex-shrink-0">
              {EVENT_ICONS[event.event] || EVENT_ICONS.DEFAULT}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white/80">{event.event.replace(/_/g, ' ')}</p>
              <p className="text-xs text-white/40 mt-0.5">{new Date(event.timestamp).toLocaleTimeString()}</p>
            </div>
            <span className="text-xs font-mono font-bold flex-shrink-0" style={{ color: getDramaColor(event.score) }}>
              +{event.score}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default DramaFeed;
