'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface ThoughtBubbleProps {
  thought: string;
  agentColor: string;
  visible: boolean;
  isPrivate?: boolean;
}

export default function ThoughtBubble({ thought, agentColor, visible, isPrivate = true }: ThoughtBubbleProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          className="absolute z-20 max-w-40 -top-16 left-1/2 -translate-x-1/2"
        >
          <div
            className="relative px-3 py-2 rounded-2xl text-xs italic border border-dashed"
            style={{
              borderColor: `${agentColor}30`,
              backgroundColor: `${agentColor}08`,
              color: `${agentColor}aa`,
            }}
          >
            {isPrivate && <span className="text-gray-600 mr-1">🔒</span>}
            {thought}
            {/* Thought dots */}
            <div className="absolute -bottom-4 left-1/2 flex gap-1">
              {[4, 3, 2].map((size, i) => (
                <div
                  key={i}
                  className="rounded-full"
                  style={{ width: size, height: size, backgroundColor: `${agentColor}40` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
