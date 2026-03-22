'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface Ghost {
  agentId: string;
  agentName: string;
  agentColor: string;
  eliminatedTurn: number;
  lastWords: string;
}

interface GhostOverlayProps {
  ghosts: Ghost[];
  visible: boolean;
}

export default function GhostOverlay({ ghosts, visible }: GhostOverlayProps) {
  if (!visible || ghosts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {ghosts.map((ghost, i) => (
        <motion.div
          key={ghost.agentId}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 4, delay: i * 1.5, repeat: Infinity, repeatDelay: 8 }}
          className="absolute text-center"
          style={{
            left: `${20 + (i * 15) % 60}%`,
            top: `${30 + (i * 20) % 40}%`,
          }}
        >
          <div className="text-xs font-bold mb-1" style={{ color: ghost.agentColor }}>
            {ghost.agentName} (Turn {ghost.eliminatedTurn})
          </div>
          <div className="text-xs italic text-gray-400 max-w-32">
            "{ghost.lastWords}"
          </div>
        </motion.div>
      ))}
    </div>
  );
}
