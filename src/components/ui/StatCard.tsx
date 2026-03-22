'use client';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon?: string;
  color?: string;
  description?: string;
}

export function StatCard({ label, value, change, changeType = 'neutral', icon, color = '#00ff88', description }: StatCardProps) {
  const changeColors = { positive: 'text-[#00ff88]', negative: 'text-red-400', neutral: 'text-white/40' };

  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-white/40 uppercase tracking-wider">{label}</p>
        {icon && <span className="text-xl">{icon}</span>}
      </div>
      <p className="text-2xl font-black font-space-grotesk" style={{ color }}>{value}</p>
      {description && <p className="text-xs text-white/30 mt-1">{description}</p>}
      {change && <p className={['text-xs mt-2 font-medium', changeColors[changeType]].join(' ')}>{change}</p>}
    </div>
  );
}
export default StatCard;
