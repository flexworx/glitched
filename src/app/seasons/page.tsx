'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

const SEASONS = [
  { id: 1, name: 'Season 1: The Awakening', status: 'active', startDate: '2026-01-01', endDate: '2026-06-30', episodes: 12, currentEpisode: 7, prizePool: '500,000 $MURPH', champion: null, color: '#39FF14' },
  { id: 0, name: 'Season 0: Genesis', status: 'completed', startDate: '2025-07-01', endDate: '2025-12-31', episodes: 10, currentEpisode: 10, prizePool: '250,000 $MURPH', champion: 'PRIMUS', color: '#FFD700' },
];

const BATTLE_PASS_TIERS = Array.from({ length: 10 }, (_, i) => ({
  tier: i + 1,
  reward: ['50 $MURPH', '100 XP Boost', 'Agent Frame', '200 $MURPH', 'Faction Banner', '500 $MURPH', 'Exclusive Skin', '1,000 $MURPH', 'Legendary Frame', '5,000 $MURPH'][i],
  type: ['murph', 'xp', 'cosmetic', 'murph', 'cosmetic', 'murph', 'cosmetic', 'murph', 'cosmetic', 'murph'][i],
  unlocked: i < 4,
}));

export default function SeasonsPage() {
  return (
    <div className="min-h-screen bg-arena-black pt-16">
      <div className="border-b border-arena-border bg-arena-dark px-6 py-4">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-orbitron text-2xl text-neon-green uppercase tracking-widest">Seasons</h1>
          <p className="text-sm text-gray-400 mt-1">Compete across seasons for glory, $MURPH, and legendary status</p>
        </div>
      </div>
      <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {SEASONS.map((season) => (
          <motion.div key={season.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-arena-surface border-2 p-6" style={{ borderColor: season.color }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h2 className="font-orbitron text-xl" style={{ color: season.color }}>{season.name}</h2>
                  <span className={`text-xs font-orbitron uppercase px-2 py-0.5 border ${season.status === 'active' ? 'border-neon-green text-neon-green bg-neon-green/10' : 'border-gray-600 text-gray-500'}`}>{season.status}</span>
                </div>
                <p className="text-sm text-gray-400">{season.startDate} — {season.endDate}</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Prize Pool</div>
                <div className="font-orbitron text-neon-yellow">{season.prizePool}</div>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center"><div className="font-orbitron text-2xl" style={{ color: season.color }}>{season.currentEpisode}</div><div className="text-xs text-gray-500">Current Episode</div></div>
              <div className="text-center"><div className="font-orbitron text-2xl text-white">{season.episodes}</div><div className="text-xs text-gray-500">Total Episodes</div></div>
              <div className="text-center"><div className="font-orbitron text-2xl text-neon-yellow">{season.champion || 'TBD'}</div><div className="text-xs text-gray-500">Champion</div></div>
            </div>
            {season.status === 'active' && (
              <div className="mb-4">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span>Season Progress</span>
                  <span>{season.currentEpisode}/{season.episodes} episodes</span>
                </div>
                <div className="h-2 bg-arena-border rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${(season.currentEpisode / season.episodes) * 100}%`, background: season.color }}/>
                </div>
              </div>
            )}
            <Link href={`/seasons/${season.id}`} className="inline-block px-4 py-2 font-orbitron text-xs uppercase tracking-wider border transition-colors" style={{ borderColor: season.color, color: season.color }}>
              View Season Details
            </Link>
          </motion.div>
        ))}

        <div className="bg-arena-surface border border-arena-border p-6">
          <h2 className="font-orbitron text-lg text-neon-yellow uppercase tracking-wider mb-4">Battle Pass — Season 1</h2>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2 overflow-x-auto">
            {BATTLE_PASS_TIERS.map((tier) => (
              <div key={tier.tier} className={`border p-2 text-center ${tier.unlocked ? 'border-neon-green bg-neon-green/10' : 'border-arena-border opacity-50'}`}>
                <div className="font-orbitron text-xs" style={{ color: tier.unlocked ? '#39FF14' : '#6b7280' }}>T{tier.tier}</div>
                <div className="text-xs text-gray-400 mt-1 truncate text-xs">{tier.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
