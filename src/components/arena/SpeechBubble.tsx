'use client';
import { motion, AnimatePresence } from 'framer-motion';

interface SpeechBubbleProps {
  text: string;
  agentColor: string;
  style?: 'aggressive' | 'diplomatic' | 'mysterious' | 'analytical';
  visible: boolean;
  position?: 'top' | 'right' | 'left';
}

export default function SpeechBubble({ text, agentColor, style = 'analytical', visible, position = 'top' }: SpeechBubbleProps) {
  const styleConfig = {
    aggressive: { border: 'border-red-500/50', bg: 'bg-red-950/80', text: 'text-red-100' },
    diplomatic: { border: 'border-blue-500/50', bg: 'bg-blue-950/80', text: 'text-blue-100' },
    mysterious: { border: 'border-purple-500/50', bg: 'bg-purple-950/80', text: 'text-purple-100' },
    analytical: { border: 'border-gray-500/50', bg: 'bg-gray-900/80', text: 'text-gray-100' },
  };

  const config = styleConfig[style];

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.2 }}
          className={`absolute z-10 max-w-48 px-3 py-2 rounded-xl border text-xs ${config.border} ${config.bg} ${config.text} backdrop-blur-sm`}
          style={{
            bottom: position === 'top' ? '110%' : undefined,
            left: position === 'right' ? '110%' : position === 'left' ? undefined : '50%',
            right: position === 'left' ? '110%' : undefined,
            transform: position === 'top' ? 'translateX(-50%)' : undefined,
            borderColor: `${agentColor}40`,
          }}
        >
          {text}
          {/* Tail */}
          {position === 'top' && (
            <div
              className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 border-b border-r"
              style={{ backgroundColor: 'inherit', borderColor: `${agentColor}40` }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
