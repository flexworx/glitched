'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Shield, AlertTriangle, Eye, Zap, Trophy, Radio } from 'lucide-react';

interface ChallengeRule {
  id: string;
  title: string;
  description: string;
  hasTimeLimit: boolean;
  timeLimitMinutes?: number;
  violationPenaltyType: string;
  violationPenaltyAmount?: number;
}

interface ActiveChallenge {
  id: string;
  title: string;
  publicSummary: string;
  durationMinutes?: number;
  complianceWindowMinutes?: number;
  scheduledEndAt?: string;
  startedAt?: string;
  rules: ChallengeRule[];
  season: { name: string; number: number };
}

interface BigScreenInstruction {
  id: string;
  message: string;
  createdAt: string;
  priority: string;
}

const PENALTY_COLORS: Record<string, string> = {
  WARNING: '#facc15',
  HP_LOSS: '#fb923c',
  MURPH_FINE: '#f87171',
  ACTION_SKIP: '#c084fc',
  TURN_SUSPENSION: '#ef4444',
  EXPULSION: '#dc2626',
  TERMINATION: '#b91c1c',
  CUSTOM: '#9ca3af',
};

function CountdownTimer({ endAt, durationMinutes }: { endAt?: string; durationMinutes?: number }) {
  const [remaining, setRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!endAt && !durationMinutes) return;

    const calcRemaining = () => {
      if (endAt) {
        return Math.max(0, Math.floor((new Date(endAt).getTime() - Date.now()) / 1000));
      }
      return null;
    };

    setRemaining(calcRemaining());
    const interval = setInterval(() => setRemaining(calcRemaining()), 1000);
    return () => clearInterval(interval);
  }, [endAt, durationMinutes]);

  if (remaining === null) {
    if (durationMinutes) {
      return (
        <div className="flex items-center gap-2 text-yellow-400">
          <Clock className="w-5 h-5" />
          <span className="font-mono text-2xl font-bold">{durationMinutes}:00</span>
          <span className="text-sm text-yellow-400/60">duration</span>
        </div>
      );
    }
    return null;
  }

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const isUrgent = remaining < 120;
  const isCritical = remaining < 30;

  return (
    <div className={`flex items-center gap-2 ${isCritical ? 'text-red-400' : isUrgent ? 'text-yellow-400' : 'text-[#00ff88]'}`}>
      <Clock className={`w-5 h-5 ${isCritical ? 'animate-pulse' : ''}`} />
      <span className={`font-mono text-4xl font-black tabular-nums ${isCritical ? 'animate-pulse' : ''}`}>
        {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
      {isCritical && <span className="text-sm font-bold animate-pulse">TIME CRITICAL</span>}
    </div>
  );
}

export default function BigScreenPage() {
  const [challenge, setChallenge] = useState<ActiveChallenge | null>(null);
  const [instructions, setInstructions] = useState<BigScreenInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const fetchData = useCallback(async () => {
    try {
      const [challengeRes, instrRes] = await Promise.all([
        fetch('/api/big-screen/active-challenge'),
        fetch('/api/big-screen/instructions?limit=5'),
      ]);
      if (challengeRes.ok) setChallenge(await challengeRes.json());
      if (instrRes.ok) {
        const d = await instrRes.json();
        setInstructions(d.instructions ?? []);
      }
      setLastUpdate(new Date());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [fetchData]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'linear-gradient(#00ff88 1px, transparent 1px), linear-gradient(90deg, #00ff88 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Scanline effect */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)',
        }}
      />

      <div className="relative z-10 min-h-screen flex flex-col p-8 gap-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00ff88] animate-pulse" />
              <span className="text-[#00ff88] font-mono text-sm font-bold tracking-widest uppercase">LIVE</span>
            </div>
            {challenge && (
              <div className="text-gray-400 font-mono text-sm">
                {challenge.season.name} · Season {challenge.season.number}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 text-xs font-mono">
              <Eye className="w-3 h-3" />
              Updated {lastUpdate.toLocaleTimeString()}
            </div>
            <div className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 rounded-full">
              <span className="text-[#00ff88] font-bold font-mono text-sm tracking-widest">GLITCHED.GG</span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : !challenge ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 rounded-2xl bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center"
            >
              <Trophy className="w-12 h-12 text-[#00ff88]" />
            </motion.div>
            <div className="text-center">
              <h2 className="text-4xl font-black font-space-grotesk text-white mb-2">STANDBY</h2>
              <p className="text-gray-400 text-lg">No active challenge — waiting for operator</p>
            </div>
          </div>
        ) : (
          <div className="flex-1 grid lg:grid-cols-3 gap-6">
            {/* Main challenge panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Challenge title */}
              <motion.div
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
                className="bg-[#0d0d1a]/80 backdrop-blur border border-[#00ff88]/20 rounded-3xl p-8"
              >
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-[#00ff88]" />
                      <span className="text-[#00ff88] font-mono text-sm font-bold uppercase tracking-widest">Active Challenge</span>
                    </div>
                    <h1 className="text-5xl font-black font-space-grotesk text-white leading-tight">
                      {challenge.title}
                    </h1>
                  </div>
                  <CountdownTimer
                    endAt={challenge.scheduledEndAt}
                    durationMinutes={challenge.durationMinutes}
                  />
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-gray-200 text-xl leading-relaxed font-medium">
                    {challenge.publicSummary}
                  </p>
                </div>

                {challenge.complianceWindowMinutes && (
                  <div className="mt-4 flex items-center gap-2 text-yellow-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Compliance window: {challenge.complianceWindowMinutes} minutes from instruction delivery
                    </span>
                  </div>
                )}
              </motion.div>

              {/* Rules */}
              {challenge.rules.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  className="bg-[#0d0d1a]/80 backdrop-blur border border-white/5 rounded-3xl p-6"
                >
                  <div className="flex items-center gap-2 mb-5">
                    <Shield className="w-5 h-5 text-purple-400" />
                    <h2 className="text-white font-bold text-lg">Rules & Penalties</h2>
                  </div>
                  <div className="space-y-3">
                    {challenge.rules.map((rule, i) => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + i * 0.05 }}
                        className="flex items-start gap-4 p-4 bg-white/3 border border-white/5 rounded-2xl"
                      >
                        <span className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap mb-1">
                            <span className="text-white font-semibold text-base">{rule.title}</span>
                            {rule.hasTimeLimit && rule.timeLimitMinutes && (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-medium">
                                <Clock className="w-3 h-3" />
                                {rule.timeLimitMinutes} min limit
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-sm">{rule.description}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-500 mb-0.5">Penalty</div>
                          <div
                            className="text-sm font-bold"
                            style={{ color: PENALTY_COLORS[rule.violationPenaltyType] ?? '#9ca3af' }}
                          >
                            {rule.violationPenaltyType.replace('_', ' ')}
                            {rule.violationPenaltyAmount ? ` (${rule.violationPenaltyAmount})` : ''}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right panel — live instructions feed */}
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-[#0d0d1a]/80 backdrop-blur border border-white/5 rounded-3xl p-5 h-full flex flex-col"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                  <h2 className="text-white font-bold text-sm uppercase tracking-wider">Live Broadcast</h2>
                </div>

                {instructions.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <Radio className="w-8 h-8 text-gray-700 mb-2" />
                    <p className="text-gray-600 text-sm">Awaiting operator instructions</p>
                  </div>
                ) : (
                  <div className="flex-1 space-y-3 overflow-y-auto">
                    <AnimatePresence>
                      {instructions.map((inst, i) => (
                        <motion.div
                          key={inst.id}
                          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`p-3 rounded-xl border ${
                            inst.priority === 'CRITICAL' ? 'bg-red-400/10 border-red-400/30' :
                            inst.priority === 'HIGH' ? 'bg-yellow-400/10 border-yellow-400/30' :
                            'bg-white/3 border-white/5'
                          }`}
                        >
                          {inst.priority !== 'NORMAL' && (
                            <div className={`text-xs font-bold mb-1 ${inst.priority === 'CRITICAL' ? 'text-red-400' : 'text-yellow-400'}`}>
                              ⚡ {inst.priority}
                            </div>
                          )}
                          <p className="text-gray-200 text-sm leading-relaxed">{inst.message}</p>
                          <div className="text-gray-600 text-xs mt-1.5">
                            {new Date(inst.createdAt).toLocaleTimeString()}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        )}

        {/* Bottom ticker */}
        <div className="flex items-center gap-4 py-2 border-t border-white/5">
          <span className="text-[#00ff88] font-mono text-xs font-bold tracking-widest flex-shrink-0">GLITCHED.GG</span>
          <div className="flex-1 overflow-hidden">
            <motion.div
              animate={{ x: [0, -1000] }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
              className="flex gap-8 text-gray-600 text-xs font-mono whitespace-nowrap"
            >
              <span>SEASON ACTIVE</span>
              <span>·</span>
              <span>PREDICTIONS OPEN</span>
              <span>·</span>
              <span>$MURPH LIVE</span>
              <span>·</span>
              <span>AGENTS COMPETING</span>
              <span>·</span>
              <span>SEASON ACTIVE</span>
              <span>·</span>
              <span>PREDICTIONS OPEN</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
