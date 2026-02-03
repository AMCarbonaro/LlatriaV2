import React, { useEffect, useState, useRef } from 'react';
import { Upload, Loader2, Undo2, Redo2, Download, FileUp, BarChart3, Plus, MoreHorizontal } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { InventorySidebar } from '@/components/inventory/InventorySidebar';
import { InventoryItemDetails } from '@/components/inventory/InventoryItemDetails';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { BulkActionsBar } from '@/components/inventory/BulkActionsBar';
import { exportToCSV, exportToJSON } from '@/utils/export';
import { importFromCSV, importFromJSON } from '@/utils/import';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { useToastStore } from '@/store/toastStore';
import { useHistoryStore } from '@/store/historyStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { aiService } from '@/services/aiService';
import { compressImage } from '@/utils/imageCompression';
import { clsx } from 'clsx';

export const InventoryPage: React.FC = () => {
  const {
    filteredItems,
    searchQuery,
    loadInventory,
    deleteItem,
    markAsSold,
    addItem,
    updateItem,
    setSearchQuery,
    bulkDelete,
    bulkMarkAsSold,
  } = useInventoryStore();
  const addToast = useToastStore((state) => state.addToast);
  const { canUndo, canRedo, undo, redo } = useHistoryStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<InventoryItemType | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [productName, setProductName] = useState('');
  const [pendingProductName, setPendingProductName] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [markSoldConfirmOpen, setMarkSoldConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [itemToMarkSold, setItemToMarkSold] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteConfirmOpen, setBulkDeleteConfirmOpen] = useState(false);
  const [bulkMarkSoldConfirmOpen, setBulkMarkSoldConfirmOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  useEffect(() => {
    loadInventory().catch(console.error);
  }, [loadInventory]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreMenu && !(event.target as Element).closest('.more-menu')) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMoreMenu]);

  useKeyboardShortcuts([
    {
      key: 'z',
      metaKey: true,
      shiftKey: false,
      handler: async () => {
        const action = undo();
        if (action) {
          addToast({ type: 'info', message: 'Undone' });
          if (action.type === 'delete') await addItem(action.item);
          else if (action.type === 'update') await updateItem(action.itemId, action.oldItem);
          else if (action.type === 'add') await deleteItem(action.item.id);
        }
      },
    },
    {
      key: 'z',
      metaKey: true,
      shiftKey: true,
      handler: async () => {
        const action = redo();
        if (action) {
          addToast({ type: 'info', message: 'Redone' });
          if (action.type === 'delete') await deleteItem(action.item.id);
          else if (action.type === 'update') await updateItem(action.itemId, action.newItem);
          else if (action.type === 'add') await addItem(action.item);
        }
      },
    },
  ]);

  useEffect(() => {
    if (selectedItemId) {
      const item = filteredItems.find(i => i.id === selectedItemId);
      setSelectedItem(item || null);
    } else {
      setSelectedItem(null);
    }
  }, [selectedItemId, filteredItems]);

  const handleItemSelect = (item: InventoryItemType) => {
    setSelectedItemId(item.id);
    setSelectedItem(item);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      await deleteItem(itemToDelete);
      addToast({ type: 'success', message: 'Item deleted' });
      if (selectedItemId === itemToDelete) {
        setSelectedItemId(null);
        setSelectedItem(null);
      }
      setItemToDelete(null);
    }
    setDeleteConfirmOpen(false);
  };

  const handleMarkSold = (id: string) => {
    setItemToMarkSold(id);
    setMarkSoldConfirmOpen(true);
  };

  const confirmMarkSold = async () => {
    if (itemToMarkSold) {
      await markAsSold(itemToMarkSold);
      addToast({ type: 'success', message: 'Marked as sold' });
      setItemToMarkSold(null);
    }
    setMarkSoldConfirmOpen(false);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  };

  const handleBulkDelete = () => setBulkDeleteConfirmOpen(true);
  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await bulkDelete(ids);
    addToast({ type: 'success', message: `${ids.length} items deleted` });
    setSelectedIds(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const handleBulkMarkSold = () => setBulkMarkSoldConfirmOpen(true);
  const confirmBulkMarkSold = async () => {
    const ids = Array.from(selectedIds);
    await bulkMarkAsSold(ids);
    addToast({ type: 'success', message: `${ids.length} items sold` });
    setSelectedIds(new Set());
    setBulkMarkSoldConfirmOpen(false);
  };

  const handleNameSubmit = () => {
    if (!productName.trim()) {
      addToast({ type: 'warning', message: 'Enter a product name' });
      return;
    }
    setPendingProductName(productName.trim());
    setShowNamePrompt(false);
    setProductName('');
    setTimeout(() => fileInputRef.current?.click(), 100);
  };

  const handlePhotoSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingProductName(null);
      return;
    }
    if (isProcessingRef.current) {
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const name = pendingProductName || 'Untitled Item';
    setPendingProductName(null);
    await processPhotoWithName(files, name);
  };

  const processPhotoWithName = async (files: FileList, name: string) => {
    if (!files || files.length === 0) return;
    if (isProcessingRef.current) return;

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please upload an image' });
      return;
    }

    isProcessingRef.current = true;

    try {
      const compressedBlob = await compressImage(file);
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });

      const draftItem = await addItem({
        title: name,
        description: 'Generating listing with AI...',
        price: 0,
        condition: 'used',
        category: 'Loading...',
        images: [imageData],
        status: 'unposted',
        platforms: ['facebook', 'ebay', 'website'],
      });

      setSelectedItemId(draftItem.id);
      setSelectedItem(draftItem);
      setIsProcessing(true);

      try {
        const base64Data = imageData.includes(',') 
          ? imageData.split(',')[1] 
          : imageData.replace(/^data:image\/\w+;base64,/, '');
        const byteCharacters = atob(base64Data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'image/jpeg' });
        const aiFile = new File([blob], 'image.jpg', { type: 'image/jpeg' });

        const aiData = await aiService.recognizeItem(aiFile);

        await updateItem(draftItem.id, {
          title: name,
          description: aiData.description,
          price: aiData.suggestedPrice,
          condition: aiData.condition,
          category: aiData.category,
          status: 'active',
          aiData: aiData,
        });

        await loadInventory();
        const updatedItem = filteredItems.find(i => i.id === draftItem.id);
        if (updatedItem) setSelectedItem(updatedItem);
      } catch (error: any) {
        await updateItem(draftItem.id, { status: 'active' });
        addToast({ 
          type: 'warning', 
          message: 'AI unavailable. Item created without AI data.' 
        });
      } finally {
        setIsProcessing(false);
        isProcessingRef.current = false;
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Failed to process image' });
      isProcessingRef.current = false;
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImport = async (file: File) => {
    try {
      let result;
      if (file.name.endsWith('.csv')) {
        result = await importFromCSV(file);
      } else if (file.name.endsWith('.json')) {
        result = await importFromJSON(file);
      } else {
        addToast({ type: 'error', message: 'Unsupported format' });
        return;
      }

      if (result.success && result.items.length > 0) {
        for (const item of result.items) await addItem(item);
        addToast({ type: 'success', message: `Imported ${result.items.length} items` });
      }
    } catch (error) {
      addToast({ type: 'error', message: 'Import failed' });
    }
    if (importFileRef.current) importFileRef.current.value = '';
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/50">
        <div className="drag-region flex items-center gap-4">
          <h1 className="text-xl font-bold">Inventory</h1>
        </div>
        
        <div className="no-drag flex items-center gap-2">
          {/* Undo/Redo */}
          <div className="flex items-center gap-0.5 mr-2">
            <button
              onClick={async () => {
                const action = undo();
                if (action) {
                  addToast({ type: 'info', message: 'Undone' });
                  if (action.type === 'delete') await addItem(action.item);
                  else if (action.type === 'update') await updateItem(action.itemId, action.oldItem);
                  else if (action.type === 'add') await deleteItem(action.item.id);
                }
              }}
              disabled={!canUndo}
              className="ghost-btn disabled:opacity-30"
              title="Undo (⌘Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              onClick={async () => {
                const action = redo();
                if (action) {
                  addToast({ type: 'info', message: 'Redone' });
                  if (action.type === 'delete') await deleteItem(action.item.id);
                  else if (action.type === 'update') await updateItem(action.itemId, action.newItem);
                  else if (action.type === 'add') await addItem(action.item);
                }
              }}
              disabled={!canRedo}
              className="ghost-btn disabled:opacity-30"
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* More Menu */}
          <div className="relative more-menu">
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              className="ghost-btn"
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
            {showMoreMenu && (
              <div className="absolute top-full right-0 mt-1 w-40 bg-card border border-border rounded-lg shadow-lg z-50 py-1 animate-scale">
                <button
                  onClick={() => {
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </button>
                <hr className="my-1 border-border" />
                <button
                  onClick={() => {
                    exportToCSV(filteredItems);
                    setShowMoreMenu(false);
                    addToast({ type: 'success', message: 'Exported CSV' });
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
                <button
                  onClick={() => {
                    exportToJSON(filteredItems);
                    setShowMoreMenu(false);
                    addToast({ type: 'success', message: 'Exported JSON' });
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </button>
                <button
                  onClick={() => {
                    importFileRef.current?.click();
                    setShowMoreMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                >
                  <FileUp className="h-4 w-4" />
                  Import
                </button>
              </div>
            )}
          </div>

          {/* New Listing Button */}
          <button
            onClick={() => {
              setProductName('');
              setPendingProductName(null);
              setShowNamePrompt(true);
            }}
            className="action-btn"
            data-tour="create-listing"
          >
            <Plus className="h-4 w-4" />
            New Listing
          </button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoSelected(e.target.files)}
          />
          <input
            ref={importFileRef}
            type="file"
            accept=".csv,.json"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleImport(e.target.files[0])}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <InventorySidebar
          items={filteredItems}
          selectedItemId={selectedItemId}
          onItemSelect={handleItemSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIds={selectedIds}
          onSelect={handleSelect}
        />

        {/* Details Panel */}
        <div className="flex-1 overflow-hidden">
          <div className="h-full p-6 overflow-y-auto scrollbar-thin">
            {isProcessing && selectedItem ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Generating listing...</h2>
                <p className="text-muted-foreground text-sm">AI is analyzing your item</p>
              </div>
            ) : (
              <InventoryItemDetails
                item={selectedItem}
                onDelete={handleDelete}
                onMarkSold={handleMarkSold}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showNamePrompt}
        onClose={() => {
          setShowNamePrompt(false);
          setPendingProductName(null);
          setProductName('');
        }}
        title="New Listing"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="What are you selling?"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., iPhone 13 Pro, Vintage Watch..."
            autoFocus
            onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowNamePrompt(false);
                setProductName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleNameSubmit}>
              Add Photo
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setItemToDelete(null); }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Delete this item? This can't be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={markSoldConfirmOpen}
        onClose={() => { setMarkSoldConfirmOpen(false); setItemToMarkSold(null); }}
        onConfirm={confirmMarkSold}
        title="Mark as Sold"
        message="Mark this item as sold?"
        confirmText="Mark Sold"
        cancelText="Cancel"
        variant="warning"
      />

      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Items"
        message={`Delete ${selectedIds.size} items? This can't be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      <ConfirmDialog
        isOpen={bulkMarkSoldConfirmOpen}
        onClose={() => setBulkMarkSoldConfirmOpen(false)}
        onConfirm={confirmBulkMarkSold}
        title="Mark as Sold"
        message={`Mark ${selectedIds.size} items as sold?`}
        confirmText="Mark Sold"
        cancelText="Cancel"
        variant="warning"
      />

      <BulkActionsBar
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onBulkMarkSold={handleBulkMarkSold}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
};
