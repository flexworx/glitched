'use client';
import { motion } from 'framer-motion';
import PersonalityRadar from './PersonalityRadar';
import VERITASBadge from './VERITASBadge';
import AgentMatchHistory from './AgentMatchHistory';

interface AgentProfileProps {
  agent: {
    id: string;
    name: string;
    archetype: string;
    color: string;
    bio: string;
    mbti?: string;
    enneagram?: string;
    veritasScore: number;
    wins: number;
    losses: number;
    totalMatches: number;
    personality: Record<string, number>;
    beliefs?: string[];
    fears?: string[];
    goals?: string[];
    voice?: { tone: string; signature_phrases: string[] };
  };
}

export default function AgentProfile({ agent }: AgentProfileProps) {
  const winRate = agent.totalMatches > 0 ? Math.round((agent.wins / agent.totalMatches) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative bg-[#0d0d1a] border rounded-2xl p-8 overflow-hidden"
        style={{ borderColor: `${agent.color}40` }}
      >
        <div
          className="absolute inset-0 opacity-5"
          style={{ background: `radial-gradient(circle at 30% 50%, ${agent.color}, transparent 60%)` }}
        />
        <div className="relative flex flex-col md:flex-row gap-8">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div
              className="w-32 h-32 rounded-2xl flex items-center justify-center text-4xl font-bold border-2"
              style={{ borderColor: agent.color, background: `${agent.color}20`, color: agent.color }}
            >
              {agent.name[0]}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-500 uppercase tracking-widest">{agent.archetype}</span>
              {agent.mbti && <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">{agent.mbti}</span>}
              {agent.enneagram && <span className="text-xs bg-gray-800 px-2 py-0.5 rounded text-gray-400">E{agent.enneagram}</span>}
            </div>
            <h1 className="text-4xl font-bold text-white font-space-grotesk mb-3">{agent.name}</h1>
            <p className="text-gray-300 text-lg mb-4">{agent.bio}</p>

            {/* Stats row */}
            <div className="flex gap-6">
              <VERITASBadge score={agent.veritasScore} />
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{agent.wins}</div>
                <div className="text-xs text-gray-500">WINS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{agent.losses}</div>
                <div className="text-xs text-gray-500">LOSSES</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: agent.color }}>{winRate}%</div>
                <div className="text-xs text-gray-500">WIN RATE</div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Personality + Beliefs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-6"
        >
          <h2 className="text-lg font-bold text-white mb-4">Personality DNA</h2>
          <PersonalityRadar traits={agent.personality} color={agent.color} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#0d0d1a] border border-gray-800 rounded-xl p-6 space-y-4"
        >
          {agent.beliefs && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Core Beliefs</h3>
              <ul className="space-y-1">
                {agent.beliefs.slice(0, 3).map((b, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span style={{ color: agent.color }}>▸</span> {b}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {agent.fears && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Fears</h3>
              <ul className="space-y-1">
                {agent.fears.slice(0, 3).map((f, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-red-500">▸</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {agent.voice?.signature_phrases && (
            <div>
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">Signature Phrases</h3>
              <div className="space-y-1">
                {agent.voice.signature_phrases.slice(0, 3).map((p, i) => (
                  <div key={i} className="text-sm italic text-gray-400 border-l-2 pl-3" style={{ borderColor: agent.color }}>
                    "{p}"
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Match History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <AgentMatchHistory agentId={agent.id} />
      </motion.div>
    </div>
  );
}
