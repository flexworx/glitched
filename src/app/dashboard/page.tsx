'use client';
import { useUser } from '@/hooks/useUser';
import { XPBar } from '@/components/gamification/XPBar';
import { StreakCounter } from '@/components/gamification/StreakCounter';
import { LevelBadge } from '@/components/gamification/LevelBadge';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, loading, checkin } = useUser();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-8 h-8 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" /></div>;

  if (!user) return <div className="text-center py-20 text-white/40"><p>Please connect your wallet to access your dashboard.</p></div>;

  const activePredictions = user.predictions?.filter(p => p.status === 'OPEN' || p.status === 'LOCKED') ?? [];

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <LevelBadge level={user.level ?? 1} size="lg" showLabel />
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">{user.username}</h1>
          <p className="text-white/40 text-sm capitalize">{user.faction ?? 'neutral'} Faction</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="md:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white font-space-grotesk mb-4">Experience Progress</h3>
          <XPBar currentXP={user.xp ?? 0} level={user.level ?? 1} xpForNextLevel={user.xpForNextLevel ?? 1000} />
        </div>
        <StreakCounter streak={user.streak?.currentStreak ?? 0} canCheckin={true} onCheckin={checkin} />
      </div>

      {/* Status Tier Progress */}
      {user.statusTier && (
        <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">{user.statusTierIcon ?? '🤖'}</span>
              <h3 className="text-sm font-bold font-space-grotesk" style={{ color: user.statusTierColor ?? '#94a3b8' }}>
                {user.statusTier}
              </h3>
            </div>
            {user.nextTier && (
              <span className="text-xs text-white/30">
                {(user.murphToNext ?? 0).toLocaleString()} $MURPH to {user.nextTierLabel}
              </span>
            )}
          </div>
          <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${user.tierProgress ?? 0}%`,
                background: user.statusTierColor ?? '#94a3b8',
              }}
            />
          </div>
          <p className="text-[10px] text-white/20 mt-2">
            Lifetime: {(user.lifetimeMurph ?? 0).toLocaleString()} $MURPH
          </p>
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label: '$MURPH Balance', value: (user.wallet?.murphBalance ?? 0).toLocaleString(), color: '#00ff88', href: '/dashboard/wallet' },
          { label: 'Active Predictions', value: String(activePredictions.length), color: '#0ea5e9', href: '/dashboard/predictions' },
          { label: 'Achievements', value: `${(user.achievements ?? []).length}/50`, color: '#FFD700', href: '/dashboard/achievements' },
          { label: 'Longest Streak', value: `${user.streak?.longestStreak ?? 0} days`, color: '#ff6600', href: '/dashboard' },
        ].map(s => (
          <Link key={s.label} href={s.href} className="bg-[#0d0d1a] border border-white/10 rounded-xl p-4 hover:border-white/20 transition-all">
            <p className="text-xs text-white/40 mb-1">{s.label}</p>
            <p className="text-xl font-bold font-space-grotesk" style={{ color: s.color }}>{s.value}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
