'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { LeaderboardTable, LeaderboardEntry } from '@/components/gamification/LeaderboardTable';

// Deterministic mock data — NO Math.random() to prevent React hydration mismatches
const MOCK_ENTRIES: LeaderboardEntry[] = [
  { rank:1,  username:'CryptoWarlord',  level:95, xp:980000, wins:387, murph:48000, faction:'iron_veil',      change:2  },
  { rank:2,  username:'NeonPhantom',    level:92, xp:938000, wins:370, murph:45900, faction:'neon_syndicate', change:0  },
  { rank:3,  username:'VoidWalker',     level:89, xp:896000, wins:353, murph:43800, faction:'void_council',   change:-1 },
  { rank:4,  username:'GlitchMaster',   level:86, xp:854000, wins:336, murph:41700, faction:'golden_accord',  change:1  },
  { rank:5,  username:'QuantumRogue',   level:83, xp:812000, wins:319, murph:39600, faction:'iron_veil',      change:0  },
  { rank:6,  username:'ShadowBroker',   level:80, xp:770000, wins:302, murph:37500, faction:'neon_syndicate', change:-2 },
  { rank:7,  username:'IronFist',       level:77, xp:728000, wins:285, murph:35400, faction:'void_council',   change:1  },
  { rank:8,  username:'NexusKing',      level:74, xp:686000, wins:268, murph:33300, faction:'golden_accord',  change:0  },
  { rank:9,  username:'DataWraith',     level:71, xp:644000, wins:251, murph:31200, faction:'iron_veil',      change:3  },
  { rank:10, username:'ByteHunter',     level:68, xp:602000, wins:234, murph:29100, faction:'neon_syndicate', change:-1 },
  { rank:11, username:'CircuitBreaker', level:65, xp:560000, wins:217, murph:27000, faction:'void_council',   change:0  },
  { rank:12, username:'PixelReaper',    level:62, xp:518000, wins:200, murph:24900, faction:'golden_accord',  change:1  },
  { rank:13, username:'CodeSerpent',    level:59, xp:476000, wins:183, murph:22800, faction:'iron_veil',      change:-1 },
  { rank:14, username:'BinaryGhost',    level:56, xp:434000, wins:166, murph:20700, faction:'neon_syndicate', change:2  },
  { rank:15, username:'LogicBomb',      level:53, xp:392000, wins:149, murph:18600, faction:'void_council',   change:0  },
  { rank:16, username:'SynapseStrike',  level:50, xp:350000, wins:132, murph:16500, faction:'golden_accord',  change:-1 },
  { rank:17, username:'CoreMelter',     level:47, xp:308000, wins:115, murph:14400, faction:'iron_veil',      change:1  },
  { rank:18, username:'RootAccess',     level:44, xp:266000, wins:98,  murph:12300, faction:'neon_syndicate', change:0  },
  { rank:19, username:'KernelPanic',    level:41, xp:224000, wins:81,  murph:10200, faction:'void_council',   change:-2 },
  { rank:20, username:'StackOverflow',  level:38, xp:182000, wins:64,  murph:8100,  faction:'golden_accord',  change:1  },
];

const TABS = ['Global', 'Season 1', 'Weekly', 'Factions'];

export default function LeaderboardsPage() {
  const [activeTab, setActiveTab] = useState('Global');
  return (
    <div className="min-h-screen bg-arena-black pt-16">
      <div className="border-b border-arena-border bg-arena-dark px-6 py-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-orbitron text-2xl text-neon-green uppercase tracking-widest">Leaderboards</h1>
          <p className="text-sm text-gray-400 mt-1">Global rankings across all seasons and game modes</p>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex gap-2 mb-6">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-orbitron uppercase border transition-all ${
                activeTab === tab
                  ? 'bg-neon-green/20 border-neon-green text-neon-green'
                  : 'border-arena-border text-gray-500 hover:border-gray-400'
              }`}>
              {tab}
            </button>
          ))}
        </div>
        {/* Podium — top 3 */}
        <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {MOCK_ENTRIES.slice(0, 3).map((entry) => (
            <motion.div
              key={entry.rank}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-arena-surface border-2 p-4 text-center"
              style={{ borderColor: ['#FFD700', '#C0C0C0', '#CD7F32'][entry.rank - 1] }}
            >
              <div className="text-3xl mb-2">{['🥇', '🥈', '🥉'][entry.rank - 1]}</div>
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
