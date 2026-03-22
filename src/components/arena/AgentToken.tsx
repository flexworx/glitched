'use client';

interface AgentTokenProps {
  name: string;
  color: string;
  hp: number;
  maxHp?: number;
  position?: [number, number];
  status: 'alive' | 'eliminated';
  isSelected?: boolean;
  dramaScore?: number;
  onClick?: () => void;
}

export function AgentToken({ name, color, hp, maxHp = 100, status, isSelected, dramaScore = 0, onClick }: AgentTokenProps) {
  const hpPct = (hp / maxHp) * 100;
  const hpColor = hpPct > 60 ? '#00ff88' : hpPct > 30 ? '#ffcc00' : '#ff4444';

  return (
    <div
      onClick={onClick}
      className={['relative flex flex-col items-center gap-1 cursor-pointer transition-all duration-200',
        status === 'eliminated' ? 'opacity-30' : 'opacity-100',
        isSelected ? 'scale-110' : 'hover:scale-105'].join(' ')}>
      {/* Drama glow */}
      {dramaScore > 70 && (
        <div className="absolute inset-0 rounded-full animate-ping opacity-30"
          style={{ background: color, transform: 'scale(1.5)' }} />
      )}

      {/* Token circle */}
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm font-space-grotesk relative z-10"
        style={{
          background: color + '20',
          border: `2px solid ${isSelected ? color : color + '60'}`,
          color,
          boxShadow: isSelected ? `0 0 16px ${color}60` : 'none',
        }}>
        {status === 'eliminated' ? '✕' : name[0]}
      </div>

      {/* HP bar */}
      {status === 'alive' && (
        <div className="w-10 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all"
            style={{ width: `${hpPct}%`, background: hpColor }} />
        </div>
      )}

      {/* Name */}
      <span className="text-xs font-bold" style={{ color: status === 'eliminated' ? '#ffffff40' : color }}>
        {name.slice(0, 6)}
      </span>
    </div>
  );
}
export default AgentToken;
