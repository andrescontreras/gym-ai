import React from 'react';
import { cn } from '@/lib/utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'error' | 'success';
  label?: string;
  helperText?: string;
  errorMessage?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      variant = 'default',
      label,
      helperText,
      errorMessage,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        'border-outline bg-surface-container text-on-surface placeholder:text-on-surface-variant focus:border-outline focus:ring-2 focus:ring-primary/20',
      error:
        'border-error bg-surface-container text-on-surface placeholder:text-on-surface-variant focus:border-error focus:ring-2 focus:ring-error/20',
      success:
        'border-green-500 bg-surface-container text-on-surface placeholder:text-on-surface-variant focus:border-green-500 focus:ring-2 focus:ring-green-500/20',
    };

    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="block text-sm font-medium text-on-surface">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}

        <input
          ref={ref}
          disabled={disabled}
          className={cn(
            'w-full px-3 py-2.5 text-base rounded-md border',
            'transition-colors duration-normal',
            'focus:outline-none',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-surface-container-low',
            variantClasses[variant],
            className
          )}
          {...props}
        />

        {errorMessage && (
          <p className="text-sm text-error font-medium">{errorMessage}</p>
        )}

        {helperText && !errorMessage && (
          <p className="text-sm text-on-surface-variant">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
