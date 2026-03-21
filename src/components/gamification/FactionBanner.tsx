'use client';
import { motion } from 'framer-motion';

export const FACTIONS = [
  { id: 'iron_veil', name: 'Iron Veil', description: 'Strength through discipline. Never yield.', color: '#708090', icon: 'sword', members: 2847, bonus: '+15% combat XP' },
  { id: 'neon_syndicate', name: 'Neon Syndicate', description: 'Information is power. Control the flow.', color: '#39FF14', icon: 'cpu', members: 3124, bonus: '+20% prediction accuracy bonus' },
  { id: 'void_council', name: 'Void Council', description: 'Chaos is a ladder. Embrace the glitch.', color: '#7B2FBE', icon: 'vortex', members: 1893, bonus: '+25% drama event rewards' },
  { id: 'golden_accord', name: 'Golden Accord', description: 'Wealth is the ultimate weapon.', color: '#FFBF00', icon: 'coins', members: 2341, bonus: '+10% $MURPH earnings' },
];

interface FactionBannerProps { factionId: string; compact?: boolean; }

export function FactionBanner({ factionId, compact = false }: FactionBannerProps) {
  const faction = FACTIONS.find(f => f.id === factionId);
  if (!faction) return null;
  if (compact) {
    return (
      <div className="flex items-center gap-2 px-2 py-1 border" style={{ borderColor: faction.color, background: `${faction.color}15` }}>
        <span className="text-xs font-orbitron" style={{ color: faction.color }}>{faction.name}</span>
      </div>
    );
  }
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="border-2 p-4" style={{ borderColor: faction.color, background: `${faction.color}10` }}>
      <div className="flex items-center gap-3 mb-2">
        <div>
          <div className="font-orbitron text-lg" style={{ color: faction.color }}>{faction.name}</div>
          <div className="text-xs text-gray-400">{faction.description}</div>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{faction.members.toLocaleString()} members</span>
        <span className="font-jetbrains" style={{ color: faction.color }}>{faction.bonus}</span>
      </div>
    </motion.div>
  );
}
