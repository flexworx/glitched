'use client';
import { useEffect, useState } from 'react';

interface AchievementPopupProps {
  achievement: { name: string; description: string; icon: string; rarity: 'common'|'rare'|'epic'|'legendary' };
  onClose: () => void;
}

const RARITY_COLORS = { common:'#ffffff', rare:'#0ea5e9', epic:'#8b5cf6', legendary:'#FFD700' };

export function AchievementPopup({ achievement, onClose }: AchievementPopupProps) {
  useEffect(() => {
    const t = setTimeout(onClose, 5000);
    return () => clearTimeout(t);
  }, [onClose]);

  const color = RARITY_COLORS[achievement.rarity];

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slide-up">
      <div className="bg-[#0d0d1a] border rounded-xl p-4 flex items-center gap-4 shadow-2xl max-w-sm"
        style={{ borderColor: color + '40' }}>
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: color + '20', border: `2px solid ${color}40` }}>
          {achievement.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider mb-0.5" style={{ color }}>Achievement Unlocked!</p>
          <p className="font-bold text-white text-sm">{achievement.name}</p>
          <p className="text-xs text-white/50 truncate">{achievement.description}</p>
        </div>
        <button onClick={onClose} className="text-white/30 hover:text-white transition-colors flex-shrink-0">✕</button>
      </div>
    </div>
  );
}
export default AchievementPopup;
