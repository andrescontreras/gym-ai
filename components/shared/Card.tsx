import React from 'react';
import { cn } from '@/lib/utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'outlined';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'default',
      padding = 'md',
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variantClasses = {
      default:
        'bg-surface-container shadow-md border border-surface-variant/50',
      flat: 'bg-surface-container-low border border-surface-variant/30',
      outlined:
        'bg-transparent border border-outline',
    };

    const paddingClasses = {
      none: 'p-0',
      sm: 'p-3',
      md: 'p-6',
      lg: 'p-8',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-shadow duration-normal',
          variantClasses[variant],
          paddingClasses[padding],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

export const CardHeader = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex flex-col gap-1.5 pb-4 border-b border-surface-variant/30',
        className
      )}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

export const CardBody = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-4', className)}
      {...props}
    />
  )
);

CardBody.displayName = 'CardBody';

export const CardFooter = React.forwardRef<HTMLDivElement, CardSectionProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'flex gap-2 pt-4 border-t border-surface-variant/30 justify-end',
        className
      )}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

Card.Header = CardHeader;
Card.Body = CardBody;
Card.Footer = CardFooter;
