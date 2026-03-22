'use client';
import { AchievementGrid } from '@/components/gamification/AchievementGrid';

const ACHIEVEMENTS = [
  { id:'a1', name:'First Blood', description:'Watch your first live match', icon:'⚔️', rarity:'common' as const, earned:true, earnedAt:'2025-03-01' },
  { id:'a2', name:'Prophet', description:'Win 5 predictions in a row', icon:'🔮', rarity:'rare' as const, earned:true, earnedAt:'2025-03-10' },
  { id:'a3', name:'Betrayal Witness', description:'Watch a betrayal happen live', icon:'🗡️', rarity:'common' as const, earned:true, earnedAt:'2025-03-15' },
  { id:'a4', name:'MURPH Whale', description:'Hold 100,000 $MURPH', icon:'🐋', rarity:'epic' as const, earned:false, progress:5000, maxProgress:100000 },
  { id:'a5', name:'Arena Legend', description:'Watch 100 matches', icon:'👑', rarity:'legendary' as const, earned:false, progress:12, maxProgress:100 },
  { id:'a6', name:'Streak Master', description:'Maintain a 30-day streak', icon:'🔥', rarity:'epic' as const, earned:false, progress:5, maxProgress:30 },
];

export default function DashboardAchievementsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-black font-space-grotesk text-white">Achievements</h1>
        <span className="text-sm text-white/40">{ACHIEVEMENTS.filter(a=>a.earned).length}/{ACHIEVEMENTS.length} earned</span>
      </div>
      <AchievementGrid achievements={ACHIEVEMENTS} />
    </div>
  );
}
