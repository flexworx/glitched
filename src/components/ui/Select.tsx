'use client';
import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium text-white/70 mb-1.5">{label}</label>}
        <select
          ref={ref}
          className={['w-full bg-[#080810] border rounded-lg px-3 py-2.5 text-white text-sm transition-all focus:outline-none appearance-none',
            error ? 'border-red-500/50 focus:border-red-500' : 'border-white/10 focus:border-[#00ff88]/50',
            className].join(' ')}
          {...props}>
          {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';
export default Select;
