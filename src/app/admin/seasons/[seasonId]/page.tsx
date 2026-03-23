'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Play, Square, Clock, AlertTriangle,
  CheckCircle, Edit, Trash2, ChevronDown, ChevronUp,
  Zap, Shield, MessageSquare, Layers, Calendar, Loader2
} from 'lucide-react';

interface ChallengeRule {
  id: string; title: string; description: string;
  hasTimeLimit: boolean; timeLimitMinutes?: number;
  violationPenaltyType: string; violationPenaltyAmount?: number;
  violationMessage?: string; isActive: boolean; orderIndex: number;
}

interface Challenge {
  id: string; title: string; description: string;
  instructions: string; publicSummary: string;
  status: string; orderIndex: number;
  scheduledStartAt?: string; scheduledEndAt?: string;
  durationMinutes?: number; complianceWindowMinutes?: number;
  rules: ChallengeRule[];
  _count: { disputes: number; operatorInstructions: number };
}

interface Season {
  id: string; number: number; name: string; description?: string;
  status: string; startedAt?: string; endedAt?: string;
  challenges: Challenge[];
  _count: { matches: number; challenges: number };
}

const CHALLENGE_STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT:     { label: 'Draft',     color: 'text-gray-400',   icon: Edit },
  SCHEDULED: { label: 'Scheduled', color: 'text-blue-400',   icon: Calendar },
  ACTIVE:    { label: 'Active',    color: 'text-green-400',  icon: Zap },
  PAUSED:    { label: 'Paused',    color: 'text-yellow-400', icon: Clock },
  COMPLETED: { label: 'Completed', color: 'text-gray-500',   icon: CheckCircle },
  CANCELLED: { label: 'Cancelled', color: 'text-red-400',    icon: AlertTriangle },
};

const PENALTY_COLORS: Record<string, string> = {
  WARNING: 'text-yellow-400', HP_LOSS: 'text-orange-400',
  MURPH_FINE: 'text-red-400', ACTION_SKIP: 'text-purple-400',
  TURN_SUSPENSION: 'text-red-500', EXPULSION: 'text-red-600',
  TERMINATION: 'text-red-700', CUSTOM: 'text-gray-400',
};

export default function SeasonDetailPage() {
  const router = useRouter();
  const params = useParams();
  const seasonId = params.seasonId as string;

  const [season, setSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedChallenge, setExpandedChallenge] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadSeason = useCallback(async () => {
    const res = await fetch(`/api/seasons/${seasonId}`);
    if (res.ok) setSeason(await res.json());
    setLoading(false);
  }, [seasonId]);

  useEffect(() => { loadSeason(); }, [loadSeason]);

  const handleChallengeAction = async (challengeId: string, action: 'activate' | 'complete') => {
    setActionLoading(challengeId);
    try {
      const res = await fetch(`/api/challenges/${challengeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) await loadSeason();
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (!season) return (
    <div className="p-6 text-center text-gray-400">Season not found</div>
  );

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => router.push('/admin/seasons')} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 font-mono text-sm">S{season.number}</span>
            <h1 className="text-2xl font-bold text-white font-space-grotesk">{season.name}</h1>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
              season.status === 'ACTIVE' ? 'bg-green-400/10 border-green-400/30 text-green-400' :
              season.status === 'UPCOMING' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400' :
              'bg-gray-400/10 border-gray-400/30 text-gray-400'
            }`}>{season.status}</span>
          </div>
          {season.description && <p className="text-gray-400 text-sm mt-1">{season.description}</p>}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/admin/seasons/${seasonId}/challenges/new`)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Challenge
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Challenges', value: season._count.challenges, color: 'text-blue-400' },
          { label: 'Matches', value: season._count.matches, color: 'text-purple-400' },
          { label: 'Active Now', value: season.challenges.filter(c => c.status === 'ACTIVE').length, color: 'text-green-400' },
          { label: 'Completed', value: season.challenges.filter(c => c.status === 'COMPLETED').length, color: 'text-gray-400' },
        ].map(s => (
          <div key={s.label} className="bg-[#0d0d1a] border border-white/5 rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-gray-500 text-xs mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Challenges */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" />
            Challenges ({season.challenges.length})
          </h2>
        </div>

        {season.challenges.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 border border-dashed border-white/10 rounded-2xl">
            <Layers className="w-8 h-8 text-gray-600 mb-3" />
            <p className="text-gray-400 text-sm">No challenges yet</p>
            <button
              onClick={() => router.push(`/admin/seasons/${seasonId}/challenges/new`)}
              className="mt-3 px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-xs hover:bg-[#00ff88]/20 transition-colors"
            >
              Add First Challenge
            </button>
          </div>
        ) : (
          <AnimatePresence>
            {season.challenges.map((challenge, i) => {
              const cfg = CHALLENGE_STATUS_CONFIG[challenge.status] ?? CHALLENGE_STATUS_CONFIG.DRAFT;
              const StatusIcon = cfg.icon;
              const isExpanded = expandedChallenge === challenge.id;

              return (
                <motion.div
                  key={challenge.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-[#0d0d1a] border border-white/5 rounded-2xl overflow-hidden"
                >
                  {/* Challenge header */}
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-xs font-bold text-gray-400 flex-shrink-0 mt-0.5">
                        {challenge.orderIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-white font-semibold">{challenge.title}</h3>
                          <span className={`flex items-center gap-1 text-xs ${cfg.color}`}>
                            <StatusIcon className="w-3 h-3" />
                            {cfg.label}
                          </span>
                          {challenge.durationMinutes && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {challenge.durationMinutes}m
                            </span>
                          )}
                          {challenge.rules.length > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Shield className="w-3 h-3" />
                              {challenge.rules.length} rules
                            </span>
                          )}
                          {challenge._count.operatorInstructions > 0 && (
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <MessageSquare className="w-3 h-3" />
                              {challenge._count.operatorInstructions} instructions
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-xs mt-1 line-clamp-1">{challenge.publicSummary}</p>
                        {(challenge.scheduledStartAt || challenge.scheduledEndAt) && (
                          <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                            {challenge.scheduledStartAt && (
                              <span>Start: {new Date(challenge.scheduledStartAt).toLocaleString()}</span>
                            )}
                            {challenge.scheduledEndAt && (
                              <span>End: {new Date(challenge.scheduledEndAt).toLocaleString()}</span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {challenge.status === 'DRAFT' || challenge.status === 'SCHEDULED' ? (
                          <button
                            onClick={() => handleChallengeAction(challenge.id, 'activate')}
                            disabled={actionLoading === challenge.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-green-400/10 border border-green-400/30 text-green-400 rounded-lg text-xs hover:bg-green-400/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === challenge.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
                            Launch
                          </button>
                        ) : challenge.status === 'ACTIVE' ? (
                          <button
                            onClick={() => handleChallengeAction(challenge.id, 'complete')}
                            disabled={actionLoading === challenge.id}
                            className="flex items-center gap-1 px-2.5 py-1 bg-red-400/10 border border-red-400/30 text-red-400 rounded-lg text-xs hover:bg-red-400/20 transition-colors disabled:opacity-50"
                          >
                            {actionLoading === challenge.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Square className="w-3 h-3" />}
                            End
                          </button>
                        ) : null}
                        <button
                          onClick={() => setExpandedChallenge(isExpanded ? null : challenge.id)}
                          className="p-1.5 text-gray-500 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded details */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
                        className="border-t border-white/5"
                      >
                        <div className="p-4 space-y-4">
                          {/* Instructions */}
                          <div>
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Agent Instructions (Private Whisper)</h4>
                            <div className="bg-[#080810] border border-[#00ff88]/10 rounded-lg p-3 text-sm text-gray-300 font-mono whitespace-pre-wrap">
                              {challenge.instructions}
                            </div>
                          </div>

                          {/* Public summary */}
                          <div>
                            <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Public Big Screen Summary</h4>
                            <div className="bg-[#080810] border border-blue-400/10 rounded-lg p-3 text-sm text-gray-300">
                              {challenge.publicSummary}
                            </div>
                          </div>

                          {/* Rules */}
                          {challenge.rules.length > 0 && (
                            <div>
                              <h4 className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                                <Shield className="w-3 h-3" />Rules & Penalties
                              </h4>
                              <div className="space-y-2">
                                {challenge.rules.map(rule => (
                                  <div key={rule.id} className="flex items-start gap-3 p-2.5 bg-[#080810] border border-white/5 rounded-lg">
                                    <div className="flex-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-white text-sm font-medium">{rule.title}</span>
                                        {rule.hasTimeLimit && rule.timeLimitMinutes && (
                                          <span className="flex items-center gap-1 text-xs text-yellow-400">
                                            <Clock className="w-3 h-3" />{rule.timeLimitMinutes}m limit
                                          </span>
                                        )}
                                        <span className={`text-xs font-medium ${PENALTY_COLORS[rule.violationPenaltyType] ?? 'text-gray-400'}`}>
                                          Penalty: {rule.violationPenaltyType.replace('_', ' ')}
                                          {rule.violationPenaltyAmount ? ` (${rule.violationPenaltyAmount})` : ''}
                                        </span>
                                      </div>
                                      <p className="text-gray-500 text-xs mt-0.5">{rule.description}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Action buttons */}
                          <div className="flex gap-2 pt-2">
                            <button
                              onClick={() => router.push(`/admin/seasons/${seasonId}/challenges/new?edit=${challenge.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs hover:bg-white/10 transition-colors"
                            >
                              <Edit className="w-3 h-3" />Edit Challenge
                            </button>
                            <button
                              onClick={() => router.push(`/admin/whisper?challengeId=${challenge.id}`)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-xs hover:bg-[#00ff88]/20 transition-colors"
                            >
                              <MessageSquare className="w-3 h-3" />Send Instruction
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
