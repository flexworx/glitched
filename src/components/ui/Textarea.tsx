'use client';
import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>}
        <textarea
          ref={ref}
          className={['w-full bg-[#080810] border rounded-lg px-3 py-2.5 text-white text-sm placeholder-white/20 transition-all focus:outline-none resize-none',
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#00ff88]/50',
            className].join(' ')}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
        {hint && !error && <p className="mt-1 text-xs text-white/30">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';
export default Textarea;
