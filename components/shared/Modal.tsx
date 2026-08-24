import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'full';
  title?: string;
  closeOnBackdropClick?: boolean;
  children: React.ReactNode;
}

const sizeClasses = {
  sm: 'w-96',
  md: 'w-full max-w-xl',
  lg: 'w-full max-w-2xl',
  full: 'w-full h-full',
};

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      size = 'md',
      title,
      closeOnBackdropClick = true,
      children,
    },
    ref
  ) => {
    React.useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = 'unset';
        };
      }
    }, [isOpen]);

    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      if (isOpen) {
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
      }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div
        className="fixed inset-0 z-modal flex items-center justify-center"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div
          className="fixed inset-0 bg-black/50 transition-opacity duration-fast"
          onClick={() => closeOnBackdropClick && onClose()}
          aria-hidden="true"
        />

        <div
          ref={ref}
          className={cn(
            'relative z-10',
            'bg-surface-container rounded-lg',
            'shadow-xl border border-surface-variant',
            'max-h-screen overflow-y-auto',
            'mx-4 sm:mx-0',
            sizeClasses[size]
          )}
        >
          {title && (
            <div className="sticky top-0 bg-surface-container border-b border-surface-variant px-6 py-4 flex items-center justify-between">
              <h2 id="modal-title" className="text-xl font-bold text-on-surface">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="Close modal"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          )}

          {children}
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

export const ModalBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('px-6 py-4', className)} {...props} />
));

ModalBody.displayName = 'ModalBody';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'sticky bottom-0 bg-surface-container border-t border-surface-variant',
      'px-6 py-4 flex gap-2 justify-end',
      className
    )}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';

Modal.Body = ModalBody;
Modal.Footer = ModalFooter;
