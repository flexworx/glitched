'use client';
import { motion } from 'framer-motion';

interface TurnEvent {
  turn: number;
  agentId: string;
  agentName: string;
  agentColor: string;
  action: string;
  dramaContribution: number;
}

interface TurnTimelineProps {
  events: TurnEvent[];
  currentTurn: number;
  maxTurns: number;
}

export default function TurnTimeline({ events, currentTurn, maxTurns }: TurnTimelineProps) {
  const progress = (currentTurn / maxTurns) * 100;

  return (
    <div className="space-y-2">
      {/* Timeline bar */}
      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-500 to-yellow-500 rounded-full"
        />
        {/* Drama spikes */}
        {events.filter(e => e.dramaContribution > 20).map((event, i) => (
          <div
            key={i}
            className="absolute top-0 w-0.5 h-full opacity-60"
            style={{
              left: `${(event.turn / maxTurns) * 100}%`,
              backgroundColor: event.agentColor,
            }}
          />
        ))}
      </div>

      {/* Recent events */}
      <div className="space-y-0.5 max-h-32 overflow-y-auto">
        {events.slice(-6).reverse().map((event, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -5 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-xs"
          >
            <span className="text-gray-600 w-8 text-right">T{event.turn}</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: event.agentColor }} />
            <span style={{ color: event.agentColor }}>{event.agentName}</span>
            <span className="text-gray-500 capitalize">{event.action}</span>
            {event.dramaContribution > 15 && (
              <span className="text-yellow-400 text-xs">+{event.dramaContribution}</span>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
