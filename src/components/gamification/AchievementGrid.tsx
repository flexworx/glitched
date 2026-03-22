'use client';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  earned: boolean;
  earnedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface AchievementGridProps { achievements: Achievement[]; }

const RARITY_STYLES: Record<string, { border: string; bg: string; label: string; color: string }> = {
  common: { border: '#6B728040', bg: '#6B728010', label: 'Common', color: '#6B7280' },
  rare: { border: '#0EA5E940', bg: '#0EA5E910', label: 'Rare', color: '#0EA5E9' },
  epic: { border: '#8B5CF640', bg: '#8B5CF610', label: 'Epic', color: '#8B5CF6' },
  legendary: { border: '#FFD70060', bg: '#FFD70015', label: 'Legendary', color: '#FFD700' },
};

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {achievements.map(ach => {
        const style = RARITY_STYLES[ach.rarity];
        return (
          <div key={ach.id}
            className={['rounded-xl border p-4 transition-all', ach.earned ? '' : 'opacity-40 grayscale'].join(' ')}
            style={{ background: style.bg, borderColor: style.border }}>
            <div className="text-3xl mb-2">{ach.icon}</div>
            <p className="text-sm font-bold text-white mb-0.5 leading-tight">{ach.name}</p>
            <p className="text-xs text-white/40 leading-relaxed mb-2">{ach.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold" style={{ color: style.color }}>{style.label}</span>
              {ach.progress !== undefined && ach.maxProgress && !ach.earned && (
                <span className="text-xs text-white/30">{ach.progress}/{ach.maxProgress}</span>
              )}
              {ach.earned && <span className="text-xs text-[#00ff88]">✓ Earned</span>}
            </div>
            {ach.progress !== undefined && ach.maxProgress && !ach.earned && (
              <div className="mt-2 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ach.progress/ach.maxProgress)*100}%`, background: style.color }} />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default AchievementGrid;
