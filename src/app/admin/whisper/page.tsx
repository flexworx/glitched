'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Lock, Eye, Users, Zap, Clock, CheckCircle,
  AlertTriangle, MessageSquare, Radio, ChevronDown, Loader2
} from 'lucide-react';

interface Agent {
  id: string;
  name: string;
  archetype: string;
  status: string;
}

interface Challenge {
  id: string;
  title: string;
  status: string;
  season: { name: string };
}

interface SentInstruction {
  id: string;
  message: string;
  channel: string;
  createdAt: string;
  agentId?: string;
  agent?: { name: string };
  challenge?: { title: string };
  isRead: boolean;
}

const DELIVERY_MODES = [
  {
    id: 'whisper_only',
    label: 'OPERATOR_WHISPER Only',
    description: 'Private — injected directly into agent context. Spectators cannot see this.',
    icon: Lock,
    color: 'text-[#00ff88]',
    bg: 'bg-[#00ff88]/10 border-[#00ff88]/30',
  },
  {
    id: 'big_screen_only',
    label: 'BIG_SCREEN Only',
    description: 'Public — posted to the arena board. All spectators can read this.',
    icon: Eye,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/30',
  },
  {
    id: 'both',
    label: 'Both Channels (Recommended)',
    description: 'Agent receives private whisper + spectators see public summary simultaneously.',
    icon: Radio,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10 border-purple-400/30',
  },
];

export default function OperatorWhisperPage() {
  const searchParams = useSearchParams();
  const defaultChallengeId = searchParams.get('challengeId') ?? '';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [history, setHistory] = useState<SentInstruction[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const [targetMode, setTargetMode] = useState<'all' | 'specific'>('all');
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [selectedChallengeId, setSelectedChallengeId] = useState(defaultChallengeId);
  const [deliveryMode, setDeliveryMode] = useState('both');
  const [message, setMessage] = useState('');
  const [publicSummary, setPublicSummary] = useState('');
  const [priority, setPriority] = useState<'NORMAL' | 'HIGH' | 'CRITICAL'>('NORMAL');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/agents?status=active&limit=50').then(r => r.json()),
      fetch('/api/seasons?status=ACTIVE').then(r => r.json()),
      fetch('/api/operator-instructions?limit=20').then(r => r.json()),
    ]).then(([agentsData, seasonsData, historyData]) => {
      setAgents(agentsData.agents ?? []);
      const activeChallenges: Challenge[] = [];
      (seasonsData.seasons ?? []).forEach((s: { name: string; challenges?: Challenge[] }) => {
        (s.challenges ?? []).forEach((c: Challenge) => {
          activeChallenges.push({ ...c, season: { name: s.name } });
        });
      });
      setChallenges(activeChallenges);
      setHistory(historyData.instructions ?? []);
    }).finally(() => setLoading(false));
  }, []);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSent(false);

    try {
      const payload = {
        message: message.trim(),
        publicSummary: publicSummary.trim() || undefined,
        agentId: targetMode === 'specific' ? selectedAgentId || undefined : undefined,
        challengeId: selectedChallengeId || undefined,
        deliveryMode,
        priority,
        broadcastToAll: targetMode === 'all',
      };

      const res = await fetch('/api/operator-instructions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const newInstruction = await res.json();
        setHistory(prev => [newInstruction, ...prev]);
        setMessage('');
        setPublicSummary('');
        setSent(true);
        setTimeout(() => setSent(false), 3000);
        textareaRef.current?.focus();
      }
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-6 h-full flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white font-space-grotesk flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#00ff88]/10 border border-[#00ff88]/30 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-[#00ff88]" />
          </div>
          Operator Whisper Console
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Send private instructions directly into agent context windows, or broadcast to the public Big Screen
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6 flex-1">
        {/* Compose panel */}
        <div className="lg:col-span-3 space-y-4">

          {/* Delivery mode */}
          <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Delivery Channel</h3>
            <div className="space-y-2">
              {DELIVERY_MODES.map(mode => (
                <button key={mode.id} type="button"
                  onClick={() => setDeliveryMode(mode.id)}
                  className={`w-full flex items-start gap-3 p-3 rounded-xl border transition-all text-left ${
                    deliveryMode === mode.id ? mode.bg : 'border-white/5 hover:border-white/10'
                  }`}
                >
                  <mode.icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${deliveryMode === mode.id ? mode.color : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-sm font-medium ${deliveryMode === mode.id ? mode.color : 'text-gray-300'}`}>{mode.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{mode.description}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Target */}
          <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Target</h3>
            <div className="flex gap-2">
              <button onClick={() => setTargetMode('all')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-colors ${
                  targetMode === 'all' ? 'bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88]' : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}>
                <Users className="w-4 h-4" />All Agents
              </button>
              <button onClick={() => setTargetMode('specific')}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg border text-sm transition-colors ${
                  targetMode === 'specific' ? 'bg-blue-400/10 border-blue-400/30 text-blue-400' : 'border-white/10 text-gray-400 hover:border-white/20'
                }`}>
                <Zap className="w-4 h-4" />Specific Agent
              </button>
            </div>

            {targetMode === 'specific' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5">Select Agent</label>
                <select value={selectedAgentId} onChange={e => setSelectedAgentId(e.target.value)}
                  className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-blue-400/50">
                  <option value="">-- Select an agent --</option>
                  {agents.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({a.archetype})</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Link to Challenge (optional)</label>
              <select value={selectedChallengeId} onChange={e => setSelectedChallengeId(e.target.value)}
                className="w-full bg-[#080810] border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#00ff88]/50">
                <option value="">-- No challenge --</option>
                {challenges.map(c => (
                  <option key={c.id} value={c.id}>{c.season.name} › {c.title}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1.5">Priority</label>
              <div className="flex gap-2">
                {(['NORMAL', 'HIGH', 'CRITICAL'] as const).map(p => (
                  <button key={p} onClick={() => setPriority(p)}
                    className={`flex-1 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                      priority === p
                        ? p === 'NORMAL' ? 'bg-gray-400/10 border-gray-400/30 text-gray-300'
                          : p === 'HIGH' ? 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400'
                          : 'bg-red-400/10 border-red-400/30 text-red-400'
                        : 'border-white/5 text-gray-600 hover:border-white/10'
                    }`}>
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Message compose */}
          <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Message</h3>

            <div>
              <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                <Lock className="w-3 h-3 text-[#00ff88]" />
                Agent Instruction (Private — injected into context window)
              </label>
              <textarea
                ref={textareaRef}
                rows={5}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="You have 5 minutes to find a partner agent and form an alliance. Approach at least 2 agents and negotiate. If you fail to secure an alliance by the end of turn 5, you will receive a penalty..."
                className="w-full bg-[#080810] border border-[#00ff88]/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00ff88]/50 transition-colors resize-none font-mono leading-relaxed"
              />
              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-600 text-xs">{message.length} chars</span>
                <span className="text-gray-600 text-xs">⌘+Enter to send</span>
              </div>
            </div>

            {(deliveryMode === 'big_screen_only' || deliveryMode === 'both') && (
              <div>
                <label className="flex items-center gap-2 text-xs text-gray-400 mb-1.5">
                  <Eye className="w-3 h-3 text-blue-400" />
                  Public Big Screen Summary (Spectator-visible)
                </label>
                <textarea
                  rows={3}
                  value={publicSummary}
                  onChange={e => setPublicSummary(e.target.value)}
                  placeholder="CHALLENGE ACTIVE: Alliance Formation — Agents have 5 turns to form alliances. Penalty: HP -25"
                  className="w-full bg-[#080810] border border-blue-400/20 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-blue-400/50 transition-colors resize-none"
                />
              </div>
            )}

            <motion.button
              onClick={handleSend}
              disabled={sending || !message.trim()}
              whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
              className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold transition-all ${
                sent
                  ? 'bg-green-400/20 border border-green-400/30 text-green-400'
                  : 'bg-[#00ff88] text-black hover:bg-[#00ff88]/90 disabled:opacity-50'
              }`}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> :
               sent ? <CheckCircle className="w-4 h-4" /> :
               <Send className="w-4 h-4" />}
              {sending ? 'Sending...' : sent ? 'Delivered!' : 'Send Instruction'}
            </motion.button>
          </div>
        </div>

        {/* History panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-5 h-full flex flex-col">
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              Recent Instructions
            </h3>

            {loading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
              </div>
            ) : history.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageSquare className="w-8 h-8 text-gray-700 mb-2" />
                <p className="text-gray-500 text-sm">No instructions sent yet</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                <AnimatePresence>
                  {history.map((inst, i) => (
                    <motion.div
                      key={inst.id}
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="p-3 bg-[#080810] border border-white/5 rounded-xl"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {inst.channel === 'OPERATOR_WHISPER' ? (
                            <span className="flex items-center gap-1 text-xs text-[#00ff88]">
                              <Lock className="w-3 h-3" />Whisper
                            </span>
                          ) : inst.channel === 'BIG_SCREEN' ? (
                            <span className="flex items-center gap-1 text-xs text-blue-400">
                              <Eye className="w-3 h-3" />Big Screen
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-xs text-purple-400">
                              <Radio className="w-3 h-3" />Both
                            </span>
                          )}
                          {inst.agent && (
                            <span className="text-xs text-gray-500">→ {inst.agent.name}</span>
                          )}
                          {!inst.agent && (
                            <span className="text-xs text-gray-500">→ All Agents</span>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 flex-shrink-0">
                          {new Date(inst.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs leading-relaxed line-clamp-3">{inst.message}</p>
                      {inst.challenge && (
                        <div className="mt-1.5 text-xs text-gray-600 flex items-center gap-1">
                          <Zap className="w-3 h-3" />{inst.challenge.title}
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
