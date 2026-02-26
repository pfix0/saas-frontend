/**
 * ساس — Input Component (Flex-based layout)
 */

import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, '-');

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-grey-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div
          className={cn(
            'flex items-center gap-2 w-full py-2.5 px-3 rounded-saas border bg-white transition-colors',
            'focus-within:border-brand-800 focus-within:ring-2 focus-within:ring-brand-800/10',
            error
              ? 'border-danger focus-within:border-danger focus-within:ring-danger/10'
              : 'border-grey-200'
          )}
        >
          {icon && (
            <span className="material-icons-outlined text-grey-300 text-lg shrink-0">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'flex-1 min-w-0 bg-transparent text-grey-800 text-sm placeholder:text-grey-400 outline-none border-none',
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="text-xs text-danger mt-1 flex items-center gap-1">
            <span className="material-icons-outlined text-xs">error</span>
            {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-grey-400 mt-1">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
