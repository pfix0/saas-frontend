/**
 * ساس — Badge Component
 */

import { cn } from '@/lib/utils';

interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'brand' | 'default';
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
  brand: 'badge-brand',
  default: 'bg-grey-100 text-grey-600',
};

export default function Badge({
  variant = 'default',
  children,
  className,
}: BadgeProps) {
  return (
    <span className={cn('badge', variants[variant], className)}>
      {children}
    </span>
  );
}
