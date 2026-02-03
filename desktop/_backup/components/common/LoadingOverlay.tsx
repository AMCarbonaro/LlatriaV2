import React from 'react';
import { LoadingSpinner } from './LoadingSpinner';
import { clsx } from 'clsx';

interface LoadingOverlayProps {
  isLoading: boolean;
  message?: string;
  className?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  isLoading,
  message,
  className,
}) => {
  if (!isLoading) return null;

  return (
    <div
      className={clsx(
        'absolute inset-0 bg-background/80 backdrop-blur-sm z-50',
        'flex flex-col items-center justify-center',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner size="lg" />
      {message && (
        <p className="mt-4 text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
};






