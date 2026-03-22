'use client';
import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  glow?: 'green' | 'blue' | 'purple' | 'none';
  variant?: 'default' | 'dark' | 'glass';
}

export function Card({ className = '', glow = 'none', variant = 'default', children, ...props }: CardProps) {
  const glowMap: Record<string, string> = {
    green: 'shadow-[0_0_20px_rgba(0,255,136,0.15)] border-[#00ff88]/20',
    blue: 'shadow-[0_0_20px_rgba(14,165,233,0.15)] border-[#0ea5e9]/20',
    purple: 'shadow-[0_0_20px_rgba(139,92,246,0.15)] border-[#8b5cf6]/20',
    none: 'border-white/10',
  };
  const variantMap: Record<string, string> = {
    default: 'bg-[#0d0d1a]',
    dark: 'bg-[#080810]',
    glass: 'bg-white/5 backdrop-blur-md',
  };
  return (
    <div
      className={['rounded-xl border p-6', variantMap[variant], glowMap[glow], className].join(' ')}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={['mb-4', className].join(' ')} {...props}>{children}</div>;
}

export function CardTitle({ className = '', children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={['text-lg font-bold text-white font-space-grotesk', className].join(' ')} {...props}>{children}</h3>;
}

export function CardContent({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={className} {...props}>{children}</div>;
}

export default Card;
