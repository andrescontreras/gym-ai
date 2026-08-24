import React from 'react';
import { cn } from '@/lib/utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      fullWidth = false,
      className,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'px-3 py-2 text-sm gap-2',
      md: 'px-4 py-2.5 text-base gap-2',
      lg: 'px-6 py-3 text-lg gap-3',
    };

    const variantClasses = {
      primary:
        'bg-primary text-on-primary hover:bg-primary-dim active:bg-primary-dim disabled:opacity-50 disabled:cursor-not-allowed',
      secondary:
        'bg-secondary text-on-secondary hover:bg-secondary-container active:bg-secondary-container disabled:opacity-50 disabled:cursor-not-allowed',
      ghost:
        'bg-transparent text-primary hover:bg-surface-container active:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed',
      danger:
        'bg-error text-on-error hover:bg-error-container active:bg-error-container disabled:opacity-50 disabled:cursor-not-allowed',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center',
          'font-medium rounded-md',
          'transition-colors duration-normal',
          'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary',
          'active:scale-95 transition-transform',
          sizeClasses[size],
          variantClasses[variant],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin w-4 h-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
