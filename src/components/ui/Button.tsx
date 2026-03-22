'use client';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const VARIANTS = {
  primary: 'bg-[#00ff88] text-[#0a0a0f] hover:bg-[#00ff88]/90 font-bold',
  secondary: 'bg-white/5 border border-white/10 text-white hover:bg-white/10',
  danger: 'bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20',
  ghost: 'text-white/60 hover:text-white hover:bg-white/5',
  outline: 'border border-[#00ff88]/30 text-[#00ff88] hover:bg-[#00ff88]/10',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3.5 text-base rounded-xl',
};

export function Button({ variant = 'primary', size = 'md', loading, leftIcon, rightIcon, children, className = '', disabled, ...props }: ButtonProps) {
  return (
    <button
      className={['inline-flex items-center justify-center gap-2 font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed',
        VARIANTS[variant], SIZES[size], className].join(' ')}
      disabled={disabled || loading}
      {...props}>
      {loading ? (
        <span className="w-4 h-4 rounded-full border-2 border-current/20 border-t-current animate-spin" />
      ) : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
export default Button;
