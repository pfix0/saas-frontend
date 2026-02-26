/**
 * ساس — Input Component
 */

import { forwardRef } from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: string;
}

const wrapperBase: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
  width: '100%',
  padding: '0.625rem 0.75rem',
  borderRadius: '0.75rem',
  border: '1px solid #e5e5e5',
  backgroundColor: '#fff',
  transition: 'border-color 0.15s, box-shadow 0.15s',
};

const inputInner: React.CSSProperties = {
  flex: '1 1 0%',
  minWidth: 0,
  background: 'transparent',
  color: '#374151',
  fontSize: '0.875rem',
  outline: 'none',
  border: 'none',
  padding: 0,
  margin: 0,
  width: '100%',
};

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className, id, style, ...props }, ref) => {
    const inputId = id || label?.replace(/\s/g, '-');

    return (
      <div style={{ width: '100%' }}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-grey-700 mb-1.5"
          >
            {label}
          </label>
        )}
        <div
          style={{
            ...wrapperBase,
            borderColor: error ? '#dc2626' : '#e5e5e5',
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = error ? '#dc2626' : '#660033';
            e.currentTarget.style.boxShadow = error
              ? '0 0 0 2px rgba(220,38,38,0.1)'
              : '0 0 0 2px rgba(102,0,51,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = error ? '#dc2626' : '#e5e5e5';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {icon && (
            <span
              className="material-icons-outlined"
              style={{ color: '#bbb', fontSize: '1.125rem', flexShrink: 0 }}
            >
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            style={inputInner}
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
