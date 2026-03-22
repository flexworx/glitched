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

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <LevelBadge level={(user as any).level ?? 1} size="lg" showLabel />
        <div>
          <h1 className="text-2xl font-black font-space-grotesk text-white">{user.username}</h1>
          <p className="text-white/40 text-sm capitalize">{(user as any).faction ?? "neutral"} Faction</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-8">
        <div className="md:col-span-2 bg-[#0d0d1a] border border-white/10 rounded-xl p-5">
          <h3 className="text-sm font-bold text-white font-space-grotesk mb-4">Experience Progress</h3>
          <XPBar currentXP={(user as any).xp ?? 0} level={(user as any).level ?? 1} xpForNextLevel={(user as any).xpForNextLevel ?? 1000} />
        </div>
        <StreakCounter streak={user.streak?.currentStreak ?? 0} canCheckin={true} onCheckin={checkin} />
      </div>

      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { label:'$MURPH Balance', value:(user.wallet?.murphBalance ?? 0).toLocaleString(), color:'#00ff88', href:'/dashboard/wallet' },
          { label:'Active Predictions', value:'3', color:'#0ea5e9', href:'/dashboard/predictions' },
          { label:'Achievements', value:`${((user as any).achievements ?? []).length}/50`, color:'#FFD700', href:'/dashboard/achievements' },
          { label:'Longest Streak', value:`${user.streak?.longestStreak ?? 0} days`, color:'#ff6600', href:'/dashboard' },
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
