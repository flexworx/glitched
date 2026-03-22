'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface AgentCardProps {
  id: string;
  name: string;
  archetype: string;
  color: string;
  veritasScore: number;
  wins: number;
  losses: number;
  bio: string;
  type?: string;
}

export default function AgentCard({ id, name, archetype, color, veritasScore, wins, losses, bio, type }: AgentCardProps) {
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      className="relative group cursor-pointer"
    >
      <Link href={`/agents/${id}`}>
        <div
          className="relative bg-[#0d0d1a] border rounded-xl p-5 overflow-hidden transition-all duration-300"
          style={{ borderColor: `${color}40` }}
        >
          {/* Glow effect */}
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"
            style={{ background: `radial-gradient(circle at center, ${color}, transparent 70%)` }}
          />

          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                <span className="text-xs text-gray-500 uppercase tracking-widest">{archetype}</span>
                {type === 'byoa' && (
                  <span className="text-xs bg-purple-900/50 text-purple-300 px-2 py-0.5 rounded-full border border-purple-700/50">BYOA</span>
                )}
              </div>
              <h3 className="text-xl font-bold text-white font-space-grotesk tracking-wide">{name}</h3>
            </div>
            <div className="text-right">
              <div className="text-xs text-gray-500">VERITAS</div>
              <div className="text-lg font-bold" style={{ color }}>{veritasScore}</div>
            </div>
          </div>

          {/* Bio */}
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">{bio}</p>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-xs text-gray-500">W</div>
              <div className="text-green-400 font-bold">{wins}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-xs text-gray-500">L</div>
              <div className="text-red-400 font-bold">{losses}</div>
            </div>
            <div className="bg-black/30 rounded-lg p-2">
              <div className="text-xs text-gray-500">WIN%</div>
              <div className="font-bold" style={{ color }}>{winRate}%</div>
            </div>
          </div>

          {/* Win rate bar */}
          <div className="mt-3 h-1 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${winRate}%` }}
              transition={{ duration: 1, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
