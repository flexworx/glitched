'use client';

import { useEffect, useRef } from 'react';
import type { CreatorWizardState, Detractor } from '@/types/agent';
import { DETRACTORS } from '@/lib/creator/detractors';
import { DetractorReveal } from './DetractorReveal';

interface StepDetractorProps {
  state: CreatorWizardState;
  onDetractorLoaded: (detractor: Detractor, rerolled: boolean) => void;
  onLoadingStart: () => void;
  onNext: () => void;
  onBack: () => void;
}

function getRandomDetractor(exclude?: string): Detractor {
  const pool = exclude ? DETRACTORS.filter((d) => d.id !== exclude) : DETRACTORS;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function StepDetractor({
  state,
  onDetractorLoaded,
  onLoadingStart,
  onNext,
  onBack,
}: StepDetractorProps) {
  const initialized = useRef(false);

  // Auto-assign detractor when entering step
  useEffect(() => {
    if (!state.detractor && !state.detractorLoading && !initialized.current) {
      initialized.current = true;
      onLoadingStart();
      // Simulate API call with timeout
      setTimeout(() => {
        const detractor = getRandomDetractor();
        onDetractorLoaded(detractor, false);
      }, 1800);
    }
  }, [state.detractor, state.detractorLoading, onDetractorLoaded, onLoadingStart]);

  const handleReroll = () => {
    onLoadingStart();
    setTimeout(() => {
      const detractor = getRandomDetractor(state.detractor?.id);
      onDetractorLoaded(detractor, true);
    }, 1800);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-black font-space-grotesk text-white mb-1">
          Your Detractor
        </h2>
        <p className="text-white/50 text-sm">
          Every agent has a flaw. The arena has assigned yours. This is the weakness that will test you.
        </p>
      </div>

      <DetractorReveal
        detractor={state.detractor}
        loading={state.detractorLoading}
        rerolled={state.detractorRerolled}
        onReroll={handleReroll}
      />

      {/* Navigation */}
      {state.detractor && !state.detractorLoading && (
        <div className="flex gap-3 mt-8 pt-6 border-t border-white/10">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all text-sm font-semibold"
          >
            ← Back
          </button>
          <button
            onClick={onNext}
            className="flex-1 py-3 rounded-xl font-bold text-black text-sm font-space-grotesk transition-all bg-[#39FF14] hover:bg-[#39FF14]/90 shadow-[0_0_20px_rgba(57,255,20,0.3)]"
          >
            Accept My Fate — Continue to Beliefs →
          </button>
        </div>
      )}
    </div>
  );
}

export default StepDetractor;
