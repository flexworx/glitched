'use client';

import { useState, useEffect } from 'react';
import type { Detractor } from '@/types/agent';

interface DetractorRevealProps {
  detractor: Detractor | null;
  loading: boolean;
  rerolled: boolean;
  onReroll: () => void;
}

const SEVERITY_COLORS = {
  mild: '#FFD700',
  moderate: '#FF6B35',
  severe: '#FF073A',
};

const TYPE_LABELS: Record<string, string> = {
  behavioral: '🧠 Behavioral',
  cognitive: '💭 Cognitive',
  social: '👥 Social',
  strategic: '♟️ Strategic',
  emotional: '❤️ Emotional',
};

export function DetractorReveal({ detractor, loading, rerolled, onReroll }: DetractorRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [typedName, setTypedName] = useState('');

  useEffect(() => {
    if (detractor && !loading) {
      setRevealed(false);
      setTypedName('');
      // Trigger reveal after a short delay
      const timer = setTimeout(() => {
        setRevealed(true);
        // Type out the name letter by letter
        let i = 0;
        const interval = setInterval(() => {
          i++;
          setTypedName(detractor.name.slice(0, i));
          if (i >= detractor.name.length) clearInterval(interval);
        }, 60);
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [detractor, loading]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-2 border-red-500/50 border-t-red-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-red-400 font-orbitron text-sm tracking-widest animate-pulse">
            THE ARENA IS JUDGING YOU...
          </p>
          <p className="text-white/30 text-xs mt-2">Assigning your weakness</p>
        </div>
      </div>
    );
  }

  if (!detractor) return null;

  const severityColor = SEVERITY_COLORS[detractor.severity];

  return (
    <div className="space-y-6">
      {/* Dramatic reveal header */}
      <div className="text-center py-4">
        <p className="text-white/40 text-xs uppercase tracking-widest mb-3">Your Detractor Has Been Assigned</p>
        <div
          className={`transition-all duration-700 ${revealed ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        >
          <h2
            className="text-3xl font-black font-orbitron tracking-wider"
            style={{
              color: severityColor,
              textShadow: `0 0 20px ${severityColor}88, 0 0 40px ${severityColor}44`,
            }}
          >
            {typedName}
            {typedName.length < detractor.name.length && (
              <span className="animate-pulse">|</span>
            )}
          </h2>
        </div>
      </div>

      {/* Detractor card */}
      <div
        className={`rounded-2xl p-6 border-2 transition-all duration-700 ${
          revealed ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          borderColor: `${severityColor}66`,
          background: `${severityColor}08`,
          boxShadow: `0 0 30px ${severityColor}22, inset 0 0 30px ${severityColor}08`,
        }}
      >
        {/* Type + Severity badges */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-semibold text-white/60 bg-white/10 px-2 py-1 rounded">
            {TYPE_LABELS[detractor.type] ?? detractor.type}
          </span>
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded"
            style={{ color: severityColor, background: `${severityColor}22` }}
          >
            {detractor.severity} severity
          </span>
        </div>

        {/* Description */}
        <p className="text-white/80 text-sm leading-relaxed mb-4">{detractor.description}</p>

        {/* Arena penalty */}
        <div
          className="rounded-lg p-3 border"
          style={{ borderColor: `${severityColor}44`, background: `${severityColor}10` }}
        >
          <div className="flex items-start gap-2">
            <span className="text-red-400 mt-0.5">⚠</span>
            <div>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-1">Arena Penalty</p>
              <p className="text-sm text-white/70">{detractor.arenapenalty}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Re-roll button */}
      <div className="flex justify-center">
        {!rerolled ? (
          <button
            onClick={onReroll}
            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-all text-sm font-semibold"
          >
            <span>🎲</span>
            <span>TEMPT FATE AGAIN</span>
            <span className="text-yellow-400 font-orbitron text-xs">— 500 Credits</span>
          </button>
        ) : (
          <div className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 text-white/30 text-sm">
            <span>🔒</span>
            <span>FATE IS SEALED</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default DetractorReveal;
