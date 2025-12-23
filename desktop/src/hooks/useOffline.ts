import { useState, useEffect } from 'react';

export const useOffline = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingActions, setPendingActions] = useState<Array<() => Promise<void>>>([]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      // Process pending actions when back online
      processPendingActions();
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const processPendingActions = async () => {
    if (pendingActions.length === 0) return;

    const actions = [...pendingActions];
    setPendingActions([]);

    for (const action of actions) {
      try {
        await action();
      } catch (error) {
        console.error('Failed to process pending action:', error);
        // Re-add failed actions to queue
        setPendingActions((prev) => [...prev, action]);
      }
    }
  };

  const queueAction = (action: () => Promise<void>) => {
    if (isOffline) {
      setPendingActions((prev) => [...prev, action]);
      return false; // Action queued
    }
    return true; // Can execute immediately
  };

  return {
    isOffline,
    pendingActionsCount: pendingActions.length,
    queueAction,
    processPendingActions,
  };
};






