import React from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useOffline } from '@/hooks/useOffline';
import { clsx } from 'clsx';

export const OfflineIndicator: React.FC = () => {
  const { isOffline, pendingActionsCount } = useOffline();

  if (!isOffline && pendingActionsCount === 0) return null;

  return (
    <div
      className={clsx(
        'fixed top-4 left-1/2 transform -translate-x-1/2 z-[100]',
        'px-4 py-2 rounded-lg shadow-lg flex items-center gap-2',
        isOffline
          ? 'bg-yellow-500 text-yellow-900 dark:bg-yellow-600 dark:text-yellow-100'
          : 'bg-green-500 text-green-900 dark:bg-green-600 dark:text-green-100'
      )}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span className="text-sm font-medium">
            You're offline. Changes will be synced when you're back online.
          </span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span className="text-sm font-medium">
            Back online! Syncing {pendingActionsCount} pending {pendingActionsCount === 1 ? 'action' : 'actions'}...
          </span>
        </>
      )}
    </div>
  );
};



