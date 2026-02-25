/**
 * ساس — Button Component
 */

import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'brand' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: string;
  loading?: boolean;
  children: React.ReactNode;
}

const variants = {
  brand: 'btn-brand',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-5 py-2.5 text-sm',
  lg: 'px-8 py-3 text-base',
};

export default function Button({
  variant = 'brand',
  size = 'md',
  icon,
  loading,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(variants[variant], sizes[size], className)}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="material-icons-outlined text-lg animate-spin">progress_activity</span>
      ) : icon ? (
        <span className="material-icons-outlined text-lg">{icon}</span>
      ) : null}
      {children}
    </button>
  );
}
