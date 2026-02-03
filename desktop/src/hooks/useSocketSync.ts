import { useEffect, useRef } from 'react';
import { socketService, SocketEvents } from '@/services/socketService';
import { useInventoryStore } from '@/store/inventoryStore';

/**
 * Hook to sync inventory state via Socket.io
 * Call this once at the app root level
 */
export function useSocketSync() {
  const loadInventory = useInventoryStore((state) => state.loadInventory);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Connect to socket server
    socketService.connect();

    // Handle inventory created - reload to get full item from server
    const handleCreated = (data: { item: any; userId: string }) => {
      console.log('[SocketSync] Inventory created:', data.item?.id);
      loadInventory();
    };

    // Handle inventory updated - reload to get updated item from server
    const handleUpdated = (data: { item: any; userId: string }) => {
      console.log('[SocketSync] Inventory updated:', data.item?.id);
      loadInventory();
    };

    // Handle inventory deleted
    const handleDeleted = (data: { itemId: string; userId: string }) => {
      console.log('[SocketSync] Inventory deleted:', data.itemId);
      loadInventory();
    };

    // Handle sync request (bulk operations)
    const handleSyncRequest = () => {
      console.log('[SocketSync] Sync requested');
      loadInventory();
    };

    // Register listeners
    socketService.on(SocketEvents.INVENTORY_CREATED, handleCreated);
    socketService.on(SocketEvents.INVENTORY_UPDATED, handleUpdated);
    socketService.on(SocketEvents.INVENTORY_DELETED, handleDeleted);
    socketService.on(SocketEvents.SYNC_REQUEST, handleSyncRequest);

    // Cleanup
    return () => {
      socketService.off(SocketEvents.INVENTORY_CREATED, handleCreated);
      socketService.off(SocketEvents.INVENTORY_UPDATED, handleUpdated);
      socketService.off(SocketEvents.INVENTORY_DELETED, handleDeleted);
      socketService.off(SocketEvents.SYNC_REQUEST, handleSyncRequest);
      socketService.disconnect();
    };
  }, [loadInventory]);
}

export default useSocketSync;
