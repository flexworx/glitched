'use client';
import { HTMLAttributes } from 'react';

interface NeonBorderProps extends HTMLAttributes<HTMLDivElement> {
  color?: string;
  animated?: boolean;
  thickness?: number;
}

export function NeonBorder({ color = '#00ff88', animated, thickness = 1, className = '', children, ...props }: NeonBorderProps) {
  return (
    <div
      className={['relative rounded-xl', animated ? 'animate-pulse' : '', className].join(' ')}
      style={{
        border: `${thickness}px solid ${color}40`,
        boxShadow: `0 0 15px ${color}20, inset 0 0 15px ${color}05`,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
export default NeonBorder;
