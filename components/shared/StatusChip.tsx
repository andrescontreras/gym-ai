import React from 'react';
import { cn } from '@/lib/utils/cn';

type StatusChipVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'confidence';

interface StatusChipProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: StatusChipVariant;
}

const variantClasses: Record<StatusChipVariant, string> = {
  default: 'bg-surface-container-high text-on-surface border border-outline/40',
  success: 'bg-success/15 text-success border border-success/40',
  warning: 'bg-warning/15 text-warning border border-warning/40',
  error: 'bg-error/15 text-error border border-error/40',
  info: 'bg-info/15 text-info border border-info/40',
  confidence: 'bg-primary/20 text-primary border border-primary/40 drop-shadow-glow-sm',
};

export function StatusChip({ variant = 'default', className, ...props }: StatusChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-1 text-xs font-semibold tracking-wide',
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
