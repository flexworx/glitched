'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LeaderboardTable, LeaderboardEntry } from '@/components/gamification/LeaderboardTable';

const MOCK_ENTRIES: LeaderboardEntry[] = Array.from({ length: 20 }, (_, i) => ({
  rank: i + 1,
  username: ['CryptoWarlord', 'NeonPhantom', 'VoidWalker', 'GlitchMaster', 'QuantumRogue', 'ShadowBroker', 'IronFist', 'NexusKing', 'DataWraith', 'ByteHunter', 'CircuitBreaker', 'PixelReaper', 'CodeSerpent', 'BinaryGhost', 'LogicBomb', 'SynapseStrike', 'CoreMelter', 'RootAccess', 'KernelPanic', 'StackOverflow'][i],
  level: Math.floor(Math.random() * 50) + 10 + (20 - i),
  xp: Math.floor(Math.random() * 100000) + 50000 - i * 2000,
  wins: Math.floor(Math.random() * 30) + 10 - Math.floor(i * 0.5),
  murph: Math.floor(Math.random() * 50000) + 10000 - i * 400,
  faction: ['iron_veil', 'neon_syndicate', 'void_council', 'golden_accord'][i % 4],
  change: Math.floor(Math.random() * 5) - 2,
}));

const TABS = ['Global', 'Season 1', 'Weekly', 'Factions'];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('Global');
  return (
    <div className="min-h-screen bg-arena-black">
      <div className="border-b border-arena-border bg-arena-dark px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-2xl text-neon-green uppercase tracking-widest">Leaderboards</h1>
          <p className="text-sm text-gray-400 mt-1">Global rankings across all seasons and game modes</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 text-xs font-orbitron uppercase border transition-all ${activeTab === tab ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'border-arena-border text-gray-500 hover:border-gray-400'}`}>{tab}</button>
          ))}
        </div>
        <div className="mb-4 grid grid-cols-3 gap-4">
          {MOCK_ENTRIES.slice(0, 3).map((entry) => (
            <motion.div key={entry.rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-arena-surface border-2 p-4 text-center" style={{ borderColor: [' #FFD700', '#C0C0C0', '#CD7F32'][entry.rank - 1] }}>
              <div className="text-3xl mb-2">{['1st', '2nd', '3rd'][entry.rank - 1]}</div>
              <div className="font-orbitron text-white">{entry.username}</div>
              <div className="text-xs text-gray-400 mt-1">Level {entry.level}</div>
              <div className="font-orbitron text-neon-green mt-2">{(entry.xp ?? 0).toLocaleString()} XP</div>
            </motion.div>
          ))}
        </div>
        <LeaderboardTable entries={MOCK_ENTRIES} />
      </div>
    </div>
  );
}
