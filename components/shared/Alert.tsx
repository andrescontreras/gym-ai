import React from 'react';
import { cn } from '@/lib/utils/cn';

type AlertVariant = 'info' | 'success' | 'warning' | 'error';

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
  title?: string;
  onClose?: () => void;
}

const variantConfig = {
  info: {
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    icon: '💡',
    titleColor: 'text-blue-700',
    textColor: 'text-blue-600',
  },
  success: {
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    icon: '✓',
    titleColor: 'text-green-700',
    textColor: 'text-green-600',
  },
  warning: {
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/30',
    icon: '⚠',
    titleColor: 'text-yellow-700',
    textColor: 'text-yellow-600',
  },
  error: {
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: '✕',
    titleColor: 'text-error',
    textColor: 'text-error/80',
  },
};

export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  (
    {
      variant = 'info',
      title,
      onClose,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const config = variantConfig[variant];

    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          'rounded-lg border p-4',
          'transition-all duration-normal',
          config.bg,
          config.border,
          className
        )}
        {...props}
      >
        <div className="flex gap-3">
          <div className="flex-shrink-0 text-lg">{config.icon}</div>

          <div className="flex-1">
            {title && (
              <h3 className={cn('font-semibold mb-1', config.titleColor)}>
                {title}
              </h3>
            )}
            <div className={cn('text-sm', config.textColor)}>
              {children}
            </div>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                'flex-shrink-0 text-lg leading-none',
                'opacity-50 hover:opacity-100 transition-opacity',
                config.textColor
              )}
              aria-label="Close alert"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  }
);

Alert.displayName = 'Alert';
