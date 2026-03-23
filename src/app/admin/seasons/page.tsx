'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Calendar, Trophy, Zap, Clock, ChevronRight,
  Play, Square, Edit, BarChart3, Layers
} from 'lucide-react';

interface Season {
  id: string;
  number: number;
  name: string;
  description?: string;
  status: string;
  startedAt?: string;
  endedAt?: string;
  challenges: { id: string; title: string; status: string; orderIndex: number }[];
  _count: { matches: number; challenges: number };
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  UPCOMING:  { label: 'Upcoming',  color: 'text-yellow-400', bg: 'bg-yellow-400/10 border-yellow-400/30' },
  ACTIVE:    { label: 'Active',    color: 'text-green-400',  bg: 'bg-green-400/10 border-green-400/30' },
  COMPLETED: { label: 'Completed', color: 'text-gray-400',   bg: 'bg-gray-400/10 border-gray-400/30' },
  ARCHIVED:  { label: 'Archived',  color: 'text-gray-600',   bg: 'bg-gray-600/10 border-gray-600/30' },
};

export default function AdminSeasonsPage() {
  const router = useRouter();
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/seasons')
      .then(r => r.json())
      .then(d => setSeasons(d.seasons ?? []))
      .finally(() => setLoading(false));
  }, []);

  const handleAction = async (seasonId: string, action: 'activate' | 'end') => {
    setActionLoading(seasonId);
    try {
      const res = await fetch(`/api/seasons/${seasonId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const updated = await res.json();
        setSeasons(prev => prev.map(s => s.id === seasonId ? { ...s, ...updated } : s));
      }
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-space-grotesk">Season Management</h1>
          <p className="text-gray-400 text-sm mt-1">Create and manage competition seasons, challenges, and rules</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
          onClick={() => router.push('/admin/seasons/new')}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#00ff88] text-black font-bold rounded-lg hover:bg-[#00ff88]/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Season
        </motion.button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Seasons', value: seasons.length, icon: Trophy, color: 'text-yellow-400' },
          { label: 'Active', value: seasons.filter(s => s.status === 'ACTIVE').length, icon: Zap, color: 'text-green-400' },
          { label: 'Total Challenges', value: seasons.reduce((a, s) => a + s._count.challenges, 0), icon: Layers, color: 'text-blue-400' },
          { label: 'Total Matches', value: seasons.reduce((a, s) => a + s._count.matches, 0), icon: BarChart3, color: 'text-purple-400' },
        ].map(stat => (
          <div key={stat.label} className="bg-[#0d0d1a] border border-white/5 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-gray-400 text-xs">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : seasons.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 border border-dashed border-white/10 rounded-2xl">
          <Trophy className="w-12 h-12 text-gray-600 mb-4" />
          <p className="text-gray-400 font-medium">No seasons yet</p>
          <p className="text-gray-600 text-sm mt-1">Create your first season to get started</p>
          <button
            onClick={() => router.push('/admin/seasons/new')}
            className="mt-4 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] rounded-lg text-sm hover:bg-[#00ff88]/20 transition-colors"
          >
            Create Season
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {seasons.map((season, i) => {
              const cfg = STATUS_CONFIG[season.status] ?? STATUS_CONFIG.UPCOMING;
              const activeChallenges = season.challenges.filter(c => c.status === 'ACTIVE').length;
              return (
                <motion.div
                  key={season.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-[#0d0d1a] border border-white/5 rounded-2xl p-5 hover:border-white/10 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="text-gray-500 text-sm font-mono">S{season.number}</span>
                        <h3 className="text-white font-bold text-lg">{season.name}</h3>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                        {activeChallenges > 0 && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-green-400/10 border border-green-400/30 text-green-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                            {activeChallenges} active
                          </span>
                        )}
                      </div>
                      {season.description && <p className="text-gray-400 text-sm mt-1 truncate">{season.description}</p>}
                      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Layers className="w-3 h-3" />{season._count.challenges} challenges</span>
                        <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />{season._count.matches} matches</span>
                        {season.startedAt && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Started {new Date(season.startedAt).toLocaleDateString()}</span>}
                      </div>
                      {season.challenges.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {season.challenges.slice(0, 6).map(c => (
                            <span key={c.id} className={`px-2 py-0.5 rounded text-xs border ${
                              c.status === 'ACTIVE' ? 'bg-green-400/10 border-green-400/30 text-green-400' :
                              c.status === 'COMPLETED' ? 'bg-gray-600/20 border-gray-600/30 text-gray-500' :
                              'bg-white/5 border-white/10 text-gray-400'
                            }`}>{c.orderIndex + 1}. {c.title}</span>
                          ))}
                          {season.challenges.length > 6 && (
                            <span className="px-2 py-0.5 rounded text-xs bg-white/5 border border-white/10 text-gray-500">+{season.challenges.length - 6} more</span>
                          )}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {season.status === 'UPCOMING' && (
                        <button onClick={() => handleAction(season.id, 'activate')} disabled={actionLoading === season.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-400/10 border border-green-400/30 text-green-400 rounded-lg text-xs font-medium hover:bg-green-400/20 transition-colors disabled:opacity-50">
                          <Play className="w-3 h-3" />Activate
                        </button>
                      )}
                      {season.status === 'ACTIVE' && (
                        <button onClick={() => handleAction(season.id, 'end')} disabled={actionLoading === season.id}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-400/10 border border-red-400/30 text-red-400 rounded-lg text-xs font-medium hover:bg-red-400/20 transition-colors disabled:opacity-50">
                          <Square className="w-3 h-3" />End Season
                        </button>
                      )}
                      <button onClick={() => router.push(`/admin/seasons/${season.id}`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg text-xs font-medium hover:bg-white/10 transition-colors">
                        <Edit className="w-3 h-3" />Manage
                      </button>
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
