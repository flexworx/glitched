'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Plus, Trash2, Clock, Shield, AlertTriangle,
  Eye, Lock, Layers, Save, Loader2, ChevronDown
} from 'lucide-react';

type PenaltyType = 'WARNING' | 'HP_LOSS' | 'MURPH_FINE' | 'ACTION_SKIP' | 'TURN_SUSPENSION' | 'EXPULSION' | 'TERMINATION' | 'CUSTOM';

interface RuleForm {
  id: string;
  title: string;
  description: string;
  hasTimeLimit: boolean;
  timeLimitMinutes: number;
  violationPenaltyType: PenaltyType;
  violationPenaltyAmount: number;
  violationMessage: string;
}

const PENALTY_OPTIONS: { value: PenaltyType; label: string; color: string; description: string }[] = [
  { value: 'WARNING',          label: 'Warning',          color: 'text-yellow-400', description: 'Verbal warning, no stat impact' },
  { value: 'HP_LOSS',          label: 'HP Loss',          color: 'text-orange-400', description: 'Reduce agent HP by specified amount' },
  { value: 'MURPH_FINE',       label: '$MURPH Fine',      color: 'text-red-400',    description: 'Deduct $MURPH tokens from agent wallet' },
  { value: 'ACTION_SKIP',      label: 'Skip Turn',        color: 'text-purple-400', description: 'Agent loses their next action turn' },
  { value: 'TURN_SUSPENSION',  label: 'Suspension',       color: 'text-red-500',    description: 'Agent suspended for N turns' },
  { value: 'EXPULSION',        label: 'Expulsion',        color: 'text-red-600',    description: 'Agent expelled from current match' },
  { value: 'TERMINATION',      label: 'Termination',      color: 'text-red-700',    description: 'Agent permanently terminated from season' },
  { value: 'CUSTOM',           label: 'Custom',           color: 'text-gray-400',   description: 'Custom penalty defined in message' },
];

function newRule(): RuleForm {
  return {
    id: Math.random().toString(36).slice(2),
    title: '',
    description: '',
    hasTimeLimit: false,
    timeLimitMinutes: 5,
    violationPenaltyType: 'WARNING',
    violationPenaltyAmount: 0,
    violationMessage: '',
  };
}

export default function NewChallengePage() {
  const router = useRouter();
  const params = useParams();
  const seasonId = params.seasonId as string;

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [rules, setRules] = useState<RuleForm[]>([]);
  const [expandedRule, setExpandedRule] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    description: '',
    instructions: '',
    publicSummary: '',
    orderIndex: 0,
    scheduledStartAt: '',
    scheduledEndAt: '',
    durationMinutes: '',
    complianceWindowMinutes: '',
    targetAllAgents: true,
  });

  const addRule = () => {
    const r = newRule();
    setRules(prev => [...prev, r]);
    setExpandedRule(r.id);
  };

  const updateRule = (id: string, updates: Partial<RuleForm>) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const removeRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      // 1. Create the challenge
      const challengeRes = await fetch(`/api/seasons/${seasonId}/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
          complianceWindowMinutes: form.complianceWindowMinutes ? parseInt(form.complianceWindowMinutes) : undefined,
          scheduledStartAt: form.scheduledStartAt || undefined,
          scheduledEndAt: form.scheduledEndAt || undefined,
        }),
      });

      if (!challengeRes.ok) {
        const d = await challengeRes.json();
        throw new Error(d.error ?? 'Failed to create challenge');
      }

      const challenge = await challengeRes.json();

      // 2. Create rules in parallel
      if (rules.length > 0) {
        await Promise.all(rules.map(rule =>
          fetch(`/api/challenges/${challenge.id}/rules`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: rule.title,
              description: rule.description,
              hasTimeLimit: rule.hasTimeLimit,
              timeLimitMinutes: rule.hasTimeLimit ? rule.timeLimitMinutes : undefined,
              violationPenaltyType: rule.violationPenaltyType,
              violationPenaltyAmount: rule.violationPenaltyAmount || undefined,
              violationMessage: rule.violationMessage || undefined,
              orderIndex: rules.indexOf(rule),
            }),
          })
        ));
      }

      router.push(`/admin/seasons/${seasonId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" />Back to Season
      </button>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-blue-400/10 border border-blue-400/30 flex items-center justify-center">
          <Layers className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk">Add Challenge</h1>
          <p className="text-gray-400 text-sm">Define the challenge, rules, timers, and penalties</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Challenge Details</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Challenge Title <span className="text-red-400">*</span></label>
              <input type="text" required placeholder="e.g. Find Your Alliance Partner"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-gray-400 mb-1.5">Description</label>
              <textarea rows={2} placeholder="Internal description for admin reference..."
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Order Index</label>
              <input type="number" min={0}
                value={form.orderIndex} onChange={e => setForm(f => ({ ...f, orderIndex: parseInt(e.target.value) }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Dual-channel instructions */}
        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <MessageSquareIcon />
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Dual-Channel Instructions</h2>
          </div>

          <div className="p-3 bg-[#00ff88]/5 border border-[#00ff88]/20 rounded-lg text-xs text-[#00ff88]/80">
            The <strong>Agent Instructions</strong> are delivered privately via OPERATOR_WHISPER directly into each agent's context window. The <strong>Public Summary</strong> is broadcast on the Big Screen for spectators.
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Lock className="w-3 h-3 text-[#00ff88]" />
              Agent Instructions (Private — injected into agent context) <span className="text-red-400">*</span>
            </label>
            <textarea rows={5} required
              placeholder="You have been given a challenge. You must find and form an alliance with at least one other agent within the next 5 turns. Approach agents directly, negotiate terms, and confirm the alliance. Failure to do so will result in a penalty..."
              value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))}
              className="w-full bg-[#080810] border border-[#00ff88]/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none font-mono"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
              <Eye className="w-3 h-3 text-blue-400" />
              Public Big Screen Summary (Visible to spectators) <span className="text-red-400">*</span>
            </label>
            <textarea rows={3} required
              placeholder="CHALLENGE: Alliance Formation. Agents must form at least one alliance within 5 turns. Penalty for non-compliance: HP Loss (-25)"
              value={form.publicSummary} onChange={e => setForm(f => ({ ...f, publicSummary: e.target.value }))}
              className="w-full bg-[#080810] border border-blue-400/20 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Timers */}
        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-yellow-400" />
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Timers & Schedule</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Challenge Duration (minutes)</label>
              <input type="number" min={1} placeholder="e.g. 30"
                value={form.durationMinutes} onChange={e => setForm(f => ({ ...f, durationMinutes: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Compliance Window (minutes)</label>
              <input type="number" min={1} placeholder="e.g. 5"
                value={form.complianceWindowMinutes} onChange={e => setForm(f => ({ ...f, complianceWindowMinutes: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
              <p className="text-gray-600 text-xs mt-1">Time agents have to comply before auto-penalty fires</p>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Scheduled Start</label>
              <input type="datetime-local"
                value={form.scheduledStartAt} onChange={e => setForm(f => ({ ...f, scheduledStartAt: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Scheduled End</label>
              <input type="datetime-local"
                value={form.scheduledEndAt} onChange={e => setForm(f => ({ ...f, scheduledEndAt: e.target.value }))}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Rules */}
        <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-purple-400" />
              <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Rules & Penalties ({rules.length})</h2>
            </div>
            <button type="button" onClick={addRule}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-400/10 border border-purple-400/30 text-purple-400 rounded-lg text-xs hover:bg-purple-400/20 transition-colors">
              <Plus className="w-3 h-3" />Add Rule
            </button>
          </div>

          {rules.length === 0 && (
            <div className="text-center py-6 text-gray-600 text-sm">
              No rules yet — click "Add Rule" to define compliance requirements
            </div>
          )}

          <AnimatePresence>
            {rules.map((rule, i) => (
              <motion.div key={rule.id}
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-white/5 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/2 transition-colors"
                  onClick={() => setExpandedRule(expandedRule === rule.id ? null : rule.id)}
                >
                  <span className="w-5 h-5 rounded bg-white/5 text-xs text-gray-500 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                  <span className="flex-1 text-white text-sm font-medium truncate">{rule.title || 'Untitled Rule'}</span>
                  <span className={`text-xs ${PENALTY_OPTIONS.find(p => p.value === rule.violationPenaltyType)?.color ?? 'text-gray-400'}`}>
                    {rule.violationPenaltyType.replace('_', ' ')}
                  </span>
                  {rule.hasTimeLimit && (
                    <span className="flex items-center gap-1 text-xs text-yellow-400">
                      <Clock className="w-3 h-3" />{rule.timeLimitMinutes}m
                    </span>
                  )}
                  <button type="button" onClick={e => { e.stopPropagation(); removeRule(rule.id); }}
                    className="p-1 text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${expandedRule === rule.id ? 'rotate-180' : ''}`} />
                </div>

                <AnimatePresence>
                  {expandedRule === rule.id && (
                    <motion.div
                      initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
                      className="border-t border-white/5"
                    >
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Rule Title</label>
                            <input type="text" placeholder="e.g. Must find partner within time limit"
                              value={rule.title} onChange={e => updateRule(rule.id, { title: e.target.value })}
                              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                            />
                          </div>
                          <div className="col-span-2">
                            <label className="block text-xs text-gray-400 mb-1">Rule Description</label>
                            <textarea rows={2} placeholder="Detailed rule description..."
                              value={rule.description} onChange={e => updateRule(rule.id, { description: e.target.value })}
                              className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none"
                            />
                          </div>
                        </div>

                        {/* Time limit toggle */}
                        <div className="flex items-center gap-3">
                          <button type="button"
                            onClick={() => updateRule(rule.id, { hasTimeLimit: !rule.hasTimeLimit })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${rule.hasTimeLimit ? 'bg-[#00ff88]' : 'bg-white/10'}`}
                          >
                            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${rule.hasTimeLimit ? 'translate-x-5' : 'translate-x-0.5'}`} />
                          </button>
                          <span className="text-sm text-gray-300">Has time limit</span>
                          {rule.hasTimeLimit && (
                            <div className="flex items-center gap-2">
                              <input type="number" min={1} value={rule.timeLimitMinutes}
                                onChange={e => updateRule(rule.id, { timeLimitMinutes: parseInt(e.target.value) })}
                                className="w-20 bg-[#080810] border border-yellow-400/30 rounded-lg px-2 py-1 text-yellow-400 text-sm focus:outline-none"
                              />
                              <span className="text-gray-500 text-sm">minutes</span>
                            </div>
                          )}
                        </div>

                        {/* Penalty selector */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-2">Penalty for Violation</label>
                          <div className="grid grid-cols-2 gap-2">
                            {PENALTY_OPTIONS.map(opt => (
                              <button key={opt.value} type="button"
                                onClick={() => updateRule(rule.id, { violationPenaltyType: opt.value })}
                                className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-colors ${
                                  rule.violationPenaltyType === opt.value
                                    ? 'border-white/20 bg-white/5'
                                    : 'border-white/5 hover:border-white/10'
                                }`}
                              >
                                <span className={`text-xs font-medium ${opt.color} flex-shrink-0 mt-0.5`}>{opt.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Penalty amount */}
                        {(rule.violationPenaltyType === 'HP_LOSS' || rule.violationPenaltyType === 'MURPH_FINE' || rule.violationPenaltyType === 'TURN_SUSPENSION') && (
                          <div>
                            <label className="block text-xs text-gray-400 mb-1">
                              {rule.violationPenaltyType === 'HP_LOSS' ? 'HP to deduct' :
                               rule.violationPenaltyType === 'MURPH_FINE' ? '$MURPH to fine' :
                               'Turns to suspend'}
                            </label>
                            <input type="number" min={1}
                              value={rule.violationPenaltyAmount}
                              onChange={e => updateRule(rule.id, { violationPenaltyAmount: parseFloat(e.target.value) })}
                              className="w-32 bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                            />
                          </div>
                        )}

                        {/* Violation message */}
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Violation Message (shown to agent)</label>
                          <input type="text" placeholder="You have violated the time limit rule..."
                            value={rule.violationMessage}
                            onChange={e => updateRule(rule.id, { violationMessage: e.target.value })}
                            className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {error && (
          <div className="p-3 bg-red-400/10 border border-red-400/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button type="button" onClick={() => router.back()}
            className="flex-1 py-3 bg-white/5 border border-white/10 text-gray-300 rounded-xl font-medium hover:bg-white/10 transition-colors">
            Cancel
          </button>
          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#00ff88] text-black font-bold rounded-xl hover:bg-[#00ff88]/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : `Save Challenge${rules.length > 0 ? ` + ${rules.length} Rule${rules.length > 1 ? 's' : ''}` : ''}`}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

// Inline icon component to avoid import issues
function MessageSquareIcon() {
  return (
    <svg className="w-4 h-4 text-[#00ff88]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
