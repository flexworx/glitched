'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scale, CheckCircle, XCircle, Clock, AlertTriangle,
  ChevronDown, ChevronUp, MessageSquare, User, Zap, Loader2
} from 'lucide-react';

interface Dispute {
  id: string;
  status: 'PENDING' | 'UNDER_REVIEW' | 'UPHELD' | 'REJECTED' | 'ESCALATED';
  reason: string;
  evidence: string | null;
  adminNotes: string | null;
  createdAt: string;
  resolvedAt: string | null;
  agent: { id: string; name: string; archetype: string };
  challenge: { id: string; title: string; season: { name: string } } | null;
  penalty: {
    id: string;
    penaltyType: string;
    penaltyAmount: number | null;
    message: string | null;
  } | null;
  submittedBy: { id: string; username: string } | null;
}

const STATUS_CONFIG = {
  PENDING: { label: 'Pending Review', color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30', icon: Clock },
  UNDER_REVIEW: { label: 'Under Review', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30', icon: Scale },
  UPHELD: { label: 'Upheld', color: 'text-[#00ff88]', bg: 'bg-[#00ff88]/10 border-[#00ff88]/30', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30', icon: XCircle },
  ESCALATED: { label: 'Escalated', color: 'text-purple-400', bg: 'bg-purple-400/10 border-purple-400/30', icon: AlertTriangle },
};

const PENALTY_LABELS: Record<string, string> = {
  WARNING: 'Warning',
  HP_LOSS: 'HP Loss',
  MURPH_FINE: '$MURPH Fine',
  ACTION_SKIP: 'Action Skip',
  TURN_SUSPENSION: 'Turn Suspension',
  EXPULSION: 'Expulsion',
  TERMINATION: 'Termination',
  CUSTOM: 'Custom',
};

function DisputeCard({ dispute, onResolve }: { dispute: Dispute; onResolve: (id: string, status: 'UPHELD' | 'REJECTED', notes: string) => Promise<void> }) {
  const [expanded, setExpanded] = useState(false);
  const [adminNotes, setAdminNotes] = useState(dispute.adminNotes ?? '');
  const [resolving, setResolving] = useState(false);
  const config = STATUS_CONFIG[dispute.status];
  const StatusIcon = config.icon;

  const handleResolve = async (status: 'UPHELD' | 'REJECTED') => {
    setResolving(true);
    try {
      await onResolve(dispute.id, status, adminNotes);
    } finally {
      setResolving(false);
    }
  };

  const isPending = dispute.status === 'PENDING' || dispute.status === 'UNDER_REVIEW';

  return (
    <motion.div
      layout
      className="bg-[#0d0d1a] border border-white/5 rounded-2xl overflow-hidden"
    >
      {/* Header row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-white/2 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium flex-shrink-0 ${config.bg} ${config.color}`}>
          <StatusIcon className="w-3 h-3" />
          {config.label}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white font-medium text-sm">{dispute.agent.name}</span>
            <span className="text-gray-500 text-xs">·</span>
            {dispute.penalty && (
              <span className="text-orange-400 text-xs font-medium">
                {PENALTY_LABELS[dispute.penalty.penaltyType] ?? dispute.penalty.penaltyType}
                {dispute.penalty.penaltyAmount ? ` (${dispute.penalty.penaltyAmount})` : ''}
              </span>
            )}
            {dispute.challenge && (
              <span className="text-gray-500 text-xs">
                {dispute.challenge.season.name} › {dispute.challenge.title}
              </span>
            )}
          </div>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{dispute.reason}</p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-gray-600 text-xs">
            {new Date(dispute.createdAt).toLocaleDateString()}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
        </div>
      </div>

      {/* Expanded detail */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="border-t border-white/5"
          >
            <div className="p-4 space-y-4">
              {/* Dispute details */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <User className="w-3 h-3" />Submitted by
                  </div>
                  <div className="text-white text-sm">
                    {dispute.submittedBy?.username ?? 'Unknown'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                    <Zap className="w-3 h-3" />Agent
                  </div>
                  <div className="text-white text-sm">
                    {dispute.agent.name} <span className="text-gray-500">({dispute.agent.archetype})</span>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1.5 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />Dispute Reason
                </div>
                <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-gray-200 text-sm leading-relaxed">
                  {dispute.reason}
                </div>
              </div>

              {dispute.evidence && (
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Evidence / Context</div>
                  <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-gray-300 text-sm leading-relaxed">
                    {dispute.evidence}
                  </div>
                </div>
              )}

              {dispute.penalty && (
                <div className="p-3 bg-orange-400/5 border border-orange-400/20 rounded-xl">
                  <div className="text-xs text-orange-400 font-medium mb-1">Disputed Penalty</div>
                  <div className="text-white text-sm">
                    {PENALTY_LABELS[dispute.penalty.penaltyType]}
                    {dispute.penalty.penaltyAmount ? ` — ${dispute.penalty.penaltyAmount}` : ''}
                  </div>
                  {dispute.penalty.message && (
                    <div className="text-gray-400 text-xs mt-1">{dispute.penalty.message}</div>
                  )}
                </div>
              )}

              {/* Admin notes */}
              {isPending && (
                <div>
                  <label className="text-xs text-gray-500 mb-1.5 block">Admin Notes (required for resolution)</label>
                  <textarea
                    rows={3}
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Explain your decision..."
                    className="w-full bg-[#080810] border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 resize-none"
                  />
                </div>
              )}

              {dispute.adminNotes && !isPending && (
                <div>
                  <div className="text-xs text-gray-500 mb-1.5">Admin Decision Notes</div>
                  <div className="p-3 bg-white/3 border border-white/5 rounded-xl text-gray-300 text-sm">
                    {dispute.adminNotes}
                  </div>
                </div>
              )}

              {/* Action buttons */}
              {isPending && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleResolve('UPHELD')}
                    disabled={resolving || !adminNotes.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-medium hover:bg-[#00ff88]/20 transition-colors disabled:opacity-50"
                  >
                    {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                    Uphold Dispute (Reverse Penalty)
                  </button>
                  <button
                    onClick={() => handleResolve('REJECTED')}
                    disabled={resolving || !adminNotes.trim()}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-400/10 border border-red-400/30 text-red-400 text-sm font-medium hover:bg-red-400/20 transition-colors disabled:opacity-50"
                  >
                    {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                    Reject Dispute (Penalty Stands)
                  </button>
                </div>
              )}

              {dispute.resolvedAt && (
                <div className="text-xs text-gray-600 text-right">
                  Resolved {new Date(dispute.resolvedAt).toLocaleString()}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function DisputesAdminPage() {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'RESOLVED'>('PENDING');

  useEffect(() => {
    fetch('/api/disputes?limit=50')
      .then(r => r.json())
      .then(d => setDisputes(d.disputes ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string, status: 'UPHELD' | 'REJECTED', notes: string) => {
    const res = await fetch(`/api/disputes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, adminNotes: notes }),
    });
    if (res.ok) {
      const updated = await res.json();
      setDisputes(prev => prev.map(d => d.id === id ? { ...d, ...updated } : d));
    }
  };

  const filtered = disputes.filter(d => {
    if (filter === 'PENDING') return d.status === 'PENDING' || d.status === 'UNDER_REVIEW';
    if (filter === 'RESOLVED') return d.status === 'UPHELD' || d.status === 'REJECTED';
    return true;
  });

  const pendingCount = disputes.filter(d => d.status === 'PENDING' || d.status === 'UNDER_REVIEW').length;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center">
              <Scale className="w-4 h-4 text-yellow-400" />
            </div>
            Dispute Review Queue
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Review and resolve penalty disputes submitted by human creators
          </p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1.5 bg-yellow-400/10 border border-yellow-400/30 rounded-full">
            <AlertTriangle className="w-4 h-4 text-yellow-400" />
            <span className="text-yellow-400 font-bold text-sm">{pendingCount} pending</span>
          </div>
        )}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'PENDING', 'RESOLVED'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-gray-500 hover:text-gray-300'
            }`}>
            {f}
            {f === 'PENDING' && pendingCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-yellow-400/20 text-yellow-400 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Disputes list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Scale className="w-12 h-12 text-gray-700 mb-3" />
          <p className="text-gray-400 font-medium">
            {filter === 'PENDING' ? 'No pending disputes — all clear!' : 'No disputes found'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {filtered.map(dispute => (
              <DisputeCard key={dispute.id} dispute={dispute} onResolve={handleResolve} />
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
