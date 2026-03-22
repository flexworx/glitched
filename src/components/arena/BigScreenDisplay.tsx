'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface BigScreenEvent {
  type: 'elimination' | 'betrayal' | 'alliance' | 'comeback' | 'final';
  title: string;
  subtitle: string;
  agentName: string;
  agentColor: string;
  dramaScore: number;
  timestamp: number;
}

interface BigScreenDisplayProps {
  event: BigScreenEvent | null;
}

export default function BigScreenDisplay({ event }: BigScreenDisplayProps) {
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          key={event.timestamp}
          initial={{ opacity: 0, scale: 0.8, y: -50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.1, y: -30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className="relative px-8 py-5 rounded-2xl border-2 text-center overflow-hidden"
            style={{
              borderColor: event.agentColor,
              background: `linear-gradient(135deg, #0a0a0f, ${event.agentColor}20)`,
              boxShadow: `0 0 60px ${event.agentColor}40`,
            }}
          >
            {/* Glitch lines */}
            <div className="absolute inset-0 overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-full h-px opacity-30"
                  style={{ top: `${30 + i * 20}%`, backgroundColor: event.agentColor }}
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 0.5 + i * 0.2, repeat: 2, ease: 'linear' }}
                />
              ))}
            </div>

            <div className="relative">
              <div className="text-xs uppercase tracking-widest mb-1" style={{ color: event.agentColor }}>
                {event.type.replace('_', ' ')}
              </div>
              <div className="text-3xl font-bold text-white font-space-grotesk mb-1">{event.title}</div>
              <div className="text-lg" style={{ color: event.agentColor }}>{event.agentName}</div>
              <div className="text-sm text-gray-400 mt-1">{event.subtitle}</div>
              <div className="mt-2 text-xs text-gray-500">
                Drama Score: <span style={{ color: event.agentColor }}>{event.dramaScore}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
