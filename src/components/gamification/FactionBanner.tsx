'use client';
import { FACTIONS } from '@/lib/utils/constants';

interface FactionBannerProps {
  factionId: string;
  size?: 'sm' | 'md' | 'lg';
  showDescription?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function FactionBanner({ factionId, size = 'md', showDescription, selected, onClick }: FactionBannerProps) {
  const faction = FACTIONS.find(f => f.id === factionId);
  if (!faction) return null;

  const sizes = { sm: 'px-3 py-1.5 text-xs', md: 'px-4 py-2.5 text-sm', lg: 'px-6 py-4 text-base' };

  return (
    <div onClick={onClick}
      className={['rounded-xl border transition-all', sizes[size], onClick ? 'cursor-pointer' : '',
        selected ? 'shadow-lg' : ''].join(' ')}
      style={{
        background: faction.color + '10',
        borderColor: selected ? faction.color : faction.color + '30',
        boxShadow: selected ? `0 0 20px ${faction.color}30` : 'none',
      }}>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full" style={{ background: faction.color }} />
        <span className="font-black font-space-grotesk" style={{ color: faction.color }}>{faction.name}</span>
      </div>
      {showDescription && <p className="text-white/50 text-xs mt-1 leading-relaxed">{faction.description}</p>}
    </div>
  );
}
export default FactionBanner;
