'use client';

import type { EnneagramResult } from '@/types/agent';
import { getEnneagramColor } from '@/lib/creator/enneagram';

interface EnneagramBadgeProps {
  enneagram: EnneagramResult | null;
  size?: 'sm' | 'md' | 'lg';
}

export function EnneagramBadge({ enneagram, size = 'md' }: EnneagramBadgeProps) {
  if (!enneagram) {
    return (
      <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
        <span className="text-white/30 text-xs">Enneagram: —</span>
      </div>
    );
  }

  const color = getEnneagramColor(enneagram.type);
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const typeSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-xl' : 'text-base';

  return (
    <div
      className="flex items-center gap-2 rounded-lg px-3 py-2 transition-all"
      style={{
        background: `${color}15`,
        border: `1px solid ${color}44`,
      }}
      title={enneagram.description}
    >
      <div>
        <div
          className={`font-bold font-orbitron ${typeSize} leading-none`}
          style={{ color }}
        >
          Type {enneagram.type}w{enneagram.wing}
        </div>
        <div className={`${textSize} text-white/60 font-space-grotesk mt-0.5`}>
          {enneagram.label}
        </div>
      </div>
    </div>
  );
}

export default EnneagramBadge;
