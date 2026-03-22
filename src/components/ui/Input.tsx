'use client';
import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, rightIcon, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>}
        <div className="relative">
          {leftIcon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">{leftIcon}</div>}
          <input
            ref={ref}
            className={['w-full bg-[#080810] border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 transition-all focus:outline-none',
              error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#00ff88]/50',
              leftIcon ? 'pl-9' : '',
              rightIcon ? 'pr-9' : '',
              className].join(' ')}
            {...props}
          />
          {rightIcon && <div className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">{rightIcon}</div>}
        </div>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-white/30">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';
export default Input;
