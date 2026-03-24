'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FlawRevealProps {
  flaw: { name: string; effect: string };
  onComplete: () => void;
}

export function FlawReveal({ flaw, onComplete }: FlawRevealProps) {
  const [phase, setPhase] = useState(0);
  // phase 0: flash, phase 1: HIDDEN FLAW DETECTED, phase 2: flaw name, phase 3: effect, phase 4: continue button

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1), 300),
      setTimeout(() => setPhase(2), 1200),
      setTimeout(() => setPhase(3), 2200),
      setTimeout(() => setPhase(4), 3000),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" />

      {/* Screen flash */}
      <AnimatePresence>
        {phase === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0.8, 1, 0] }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-neon-pink/30"
          />
        )}
      </AnimatePresence>

      <div className="relative z-10 text-center px-6 max-w-lg">
        {/* HIDDEN FLAW DETECTED */}
        <AnimatePresence>
          {phase >= 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: 'spring', damping: 12 }}
              className="mb-8"
            >
              <h2 className="font-orbitron text-2xl md:text-4xl text-neon-pink uppercase tracking-widest animate-glitch">
                Hidden Flaw Detected
              </h2>
              <div className="h-0.5 w-32 mx-auto mt-4 bg-gradient-to-r from-transparent via-neon-pink to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flaw name with shake */}
        <AnimatePresence>
          {phase >= 2 && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{
                opacity: 1,
                x: [0, -8, 8, -5, 5, -2, 2, 0],
              }}
              transition={{ duration: 0.5 }}
              className="mb-4"
            >
              <span className="font-orbitron text-xl md:text-3xl text-white font-bold">
                {flaw.name}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Flaw effect */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-sm md:text-base text-white/60 leading-relaxed mb-8 max-w-md mx-auto"
            >
              {flaw.effect}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Warning text */}
        <AnimatePresence>
          {phase >= 3 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-xs text-neon-pink/60 mb-8 font-mono"
            >
              Your agent is now in the arena. The flaw is permanent.
            </motion.p>
          )}
        </AnimatePresence>

        {/* Continue button */}
        <AnimatePresence>
          {phase >= 4 && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onClick={onComplete}
              className="px-8 py-3 border border-neon-pink/40 text-neon-pink font-orbitron text-sm uppercase tracking-wider hover:bg-neon-pink/10 transition-colors"
            >
              Continue
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default FlawReveal;
