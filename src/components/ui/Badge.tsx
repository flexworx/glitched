'use client';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  dot?: boolean;
}

const VARIANTS = {
  default: 'bg-white/5 text-white/60 border-white/10',
  success: 'bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/20',
  warning: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  danger: 'bg-red-500/10 text-red-400 border-red-500/20',
  info: 'bg-[#0ea5e9]/10 text-[#0ea5e9] border-[#0ea5e9]/20',
  purple: 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
};

const DOT_COLORS = {
  default: 'bg-white/40', success: 'bg-[#00ff88]', warning: 'bg-yellow-400',
  danger: 'bg-red-400', info: 'bg-[#0ea5e9]', purple: 'bg-[#8b5cf6]',
};

export function Badge({ children, variant = 'default', size = 'md', dot }: BadgeProps) {
  return (
    <span className={['inline-flex items-center gap-1.5 border rounded-full font-medium',
      VARIANTS[variant],
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'].join(' ')}>
      {dot && <span className={['w-1.5 h-1.5 rounded-full flex-shrink-0', DOT_COLORS[variant]].join(' ')} />}
      {children}
    </span>
  );
}
export default Badge;
