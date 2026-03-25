'use client';

import { useState, useEffect } from 'react';

interface Achievement {
  id: string; name: string; description: string; icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean; earnedAt?: string | null;
  progress?: number; maxProgress?: number;
}

export default function DashboardAchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/me/achievements')
      .then(r => r.json())
      .then(d => setAchievements(d.data?.achievements ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const earned = achievements.filter(a => a.earned).length;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Achievements</h1>
        {!loading && (
          <span className="text-sm text-white/40">{earned}/{achievements.length} earned</span>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#00ff88] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-red-400 text-sm mb-4">{error}</div>
      )}

      {!loading && achievements.length > 0 && (
        <div className="achievement-list" />
      )}

      {!loading && achievements.length === 0 && !error && (
        <div className="text-center py-20 text-white/30">No achievements data available.</div>
      )}
    </div>
  );
}
