'use client';

import type { MBTIResult } from '@/types/agent';
import { getMBTIColor } from '@/lib/creator/mbti';

interface MBTIBadgeProps {
  mbti: MBTIResult | null;
  size?: 'sm' | 'md' | 'lg';
}

export function MBTIBadge({ mbti, size = 'md' }: MBTIBadgeProps) {
  if (!mbti) {
    return (
      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
        <span className="text-white/30 text-xs">MBTI: —</span>
      </div>
    );
  }

  const color = getMBTIColor(mbti.type);
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const typeSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}44`,
      }}
      title={mbti.description}
    >
      <div>
        <div
          className={`font-bold font-orbitron ${typeSize} leading-none`}
          style={{ color }}
        >
          {mbti.type}
        </div>
        <div className={`${textSize} text-white/60 font-space-grotesk mt-0.5`}>
          {mbti.label}
        </div>
      </div>
    </div>
  );
}

export default MBTIBadge;
