'use client';
import { ReactNode } from 'react';

interface CyberpunkCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
  hover?: boolean;
  corner?: boolean;
}

export function CyberpunkCard({ children, className = '', glowColor = '#00ff88', hover = false, corner = false }: CyberpunkCardProps) {
  return (
    <div className={['relative bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden transition-all',
      hover ? 'hover:border-white/20 cursor-pointer group' : '',
      className].join(' ')}
      style={{ boxShadow: `0 0 0 1px ${glowColor}10` }}>
      {corner && (
        <>
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 rounded-tl-sm" style={{ borderColor: glowColor }} />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 rounded-tr-sm" style={{ borderColor: glowColor }} />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 rounded-bl-sm" style={{ borderColor: glowColor }} />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 rounded-br-sm" style={{ borderColor: glowColor }} />
        </>
      )}
      {children}
    </div>
  );
}
export default CyberpunkCard;
