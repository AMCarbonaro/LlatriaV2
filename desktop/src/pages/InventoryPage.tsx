import React, { useEffect, useState, useRef } from 'react';
import { Upload, Loader2, Undo2, Redo2, Download, FileUp, BarChart3 } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { InventorySidebar } from '@/components/inventory/InventorySidebar';
import { InventoryItemDetails } from '@/components/inventory/InventoryItemDetails';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input } from '@/components/common/Input';
import { ConfirmDialog } from '@/components/common/ConfirmDialog';
import { BulkActionsBar } from '@/components/inventory/BulkActionsBar';
import { SortAndViewOptions } from '@/components/inventory/SortAndViewOptions';
import { exportToCSV, exportToJSON } from '@/utils/export';
import { importFromCSV, importFromJSON } from '@/utils/import';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { useToastStore } from '@/store/toastStore';
import { useHistoryStore } from '@/store/historyStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { aiService } from '@/services/aiService';
import { compressImage } from '@/utils/imageCompression';

export const InventoryPage: React.FC = () => {
  const {
    filteredItems,
    searchQuery,
    viewMode,
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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadInventory().catch(console.error);
  }, [loadInventory]);

  // Close export menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showExportMenu && !(event.target as Element).closest('.relative')) {
        setShowExportMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportMenu]);

  // Keyboard shortcuts for undo/redo
  useKeyboardShortcuts([
    {
      key: 'z',
      metaKey: true,
      shiftKey: false,
      handler: async () => {
        const action = undo();
        if (action) {
          addToast({ type: 'info', message: 'Undone' });
          if (action.type === 'delete') {
            await addItem(action.item);
          } else if (action.type === 'update') {
            await updateItem(action.itemId, action.oldItem);
          } else if (action.type === 'add') {
            await deleteItem(action.item.id);
          }
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
          if (action.type === 'delete') {
            await deleteItem(action.item.id);
          } else if (action.type === 'update') {
            await updateItem(action.itemId, action.newItem);
          } else if (action.type === 'add') {
            await addItem(action.item);
          }
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
      addToast({ type: 'success', message: 'Item deleted successfully' });
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
      addToast({ type: 'success', message: 'Item marked as sold' });
      setItemToMarkSold(null);
    }
    setMarkSoldConfirmOpen(false);
  };

  const handleSelect = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleBulkDelete = () => {
    setBulkDeleteConfirmOpen(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds);
    await bulkDelete(ids);
    addToast({ type: 'success', message: `${ids.length} items deleted` });
    setSelectedIds(new Set());
    setBulkDeleteConfirmOpen(false);
  };

  const handleBulkMarkSold = () => {
    setBulkMarkSoldConfirmOpen(true);
  };

  const confirmBulkMarkSold = async () => {
    const ids = Array.from(selectedIds);
    await bulkMarkAsSold(ids);
    addToast({ type: 'success', message: `${ids.length} items marked as sold` });
    setSelectedIds(new Set());
    setBulkMarkSoldConfirmOpen(false);
  };

  const handleNameSubmit = () => {
    if (!productName.trim()) {
      addToast({ type: 'warning', message: 'Please enter a product name' });
      return;
    }

    const name = productName.trim();
    setPendingProductName(name);
    setShowNamePrompt(false);
    setProductName('');
    
    // Trigger file input after closing modal
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 100);
  };

  const handlePhotoSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      setPendingProductName(null);
      return;
    }

    // Prevent duplicate processing
    if (isProcessingRef.current) {
      // Reset file input to allow future selections
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    const name = pendingProductName || 'Untitled Item';
    setPendingProductName(null);
    await processPhotoWithName(files, name);
  };

  const processPhotoWithName = async (files: FileList, name: string) => {
    if (!files || files.length === 0) return;

    // Prevent duplicate processing
    if (isProcessingRef.current) {
      return;
    }

    const file = files[0];
    if (!file.type.startsWith('image/')) {
      addToast({ type: 'error', message: 'Please upload an image file' });
      return;
    }

    // Set processing flag
    isProcessingRef.current = true;

    try {
      // Compress the image first to reduce size
      console.log('📦 Compressing image before upload...');
      const compressedBlob = await compressImage(file);
      
      // Convert compressed blob to base64
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          console.log('✅ Image compressed, size:', Math.round(result.length / 1024), 'KB');
          resolve(result);
        };
        reader.onerror = reject;
        reader.readAsDataURL(compressedBlob);
      });
      
      // Create a draft item immediately with the user-provided name
      const draftItem = await addItem({
        title: name,
        description: 'Generating listing with AI...',
        price: 0,
        condition: 'used',
        category: 'Loading...',
        images: [imageData],
        status: 'draft',
        platforms: ['facebook', 'ebay', 'website'], // Auto-select all platforms
      });

      // Select the new item
      setSelectedItemId(draftItem.id);
      setSelectedItem(draftItem);
      setIsProcessing(true);

      // Process with AI using the compressed image
      try {
        console.log('🤖 Starting AI recognition...');
        // Convert base64 back to File for AI service
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
        
        console.log('📤 Calling AI service...');
        const aiData = await aiService.recognizeItem(aiFile);
        console.log('✅ AI recognition complete:', aiData);

        // Update the item with AI data, but keep the user-provided name
        await updateItem(draftItem.id, {
          title: name, // Use the user-provided name instead of AI recognized item
          description: aiData.description,
          price: aiData.suggestedPrice,
          condition: aiData.condition,
          category: aiData.category,
          status: 'active',
          aiData: aiData,
        });
        
        // Reload inventory to get updated item
        await loadInventory();
        const updatedItem = filteredItems.find(i => i.id === draftItem.id);
        if (updatedItem) {
          setSelectedItem(updatedItem);
        }
      } catch (error: any) {
        console.error('❌ AI processing error:', error);
        const errorMessage = error.message || 'Unknown error';
        console.error('Error details:', { errorMessage, error });
        
        // Update item status even if AI fails
        await updateItem(draftItem.id, {
          status: 'active',
        });
        
        if (errorMessage.includes('API') || errorMessage.includes('configured')) {
          addToast({ 
            type: 'error', 
            message: 'Google APIs not configured. Item created but AI features disabled.' 
          });
        } else if (errorMessage.includes('billing')) {
          addToast({ 
            type: 'warning', 
            message: 'Google Cloud billing not enabled. Item created successfully. Enable billing to use AI features.',
            duration: 10000
          });
        } else if (errorMessage.includes('authenticated') || errorMessage.includes('401')) {
          addToast({ 
            type: 'error', 
            message: 'Please log in to use AI features. Item created without AI data.' 
          });
        } else {
          addToast({ 
            type: 'warning', 
            message: `AI processing failed: ${errorMessage.substring(0, 100)}. Item created without AI data.` 
          });
        }
      } finally {
        setIsProcessing(false);
        setPendingProductName(null);
        isProcessingRef.current = false;
        // Reset file input to allow future selections
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      console.error('Error compressing or uploading image:', error);
      addToast({ type: 'error', message: 'Failed to process image. Please try again.' });
      isProcessingRef.current = false;
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4 px-6 pt-2" data-tour="inventory">
        <div className="drag-region flex-1">
          <h1 className="text-3xl font-bold">Inventory</h1>
          <p className="text-muted-foreground mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="no-drag flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Navigate to dashboard - will be handled by App.tsx
              window.dispatchEvent(new CustomEvent('navigate', { detail: 'dashboard' }));
            }}
            title="View Dashboard"
          >
            <BarChart3 className="h-4 w-4 mr-1" />
            Dashboard
          </Button>
          <SortAndViewOptions />
        </div>
        <div className="relative no-drag flex items-center gap-2">
          {/* Export/Import */}
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowExportMenu(!showExportMenu)}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
              {showExportMenu && (
                <div className="absolute top-full right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-50 min-w-[150px]">
                  <button
                    onClick={() => {
                      exportToCSV(filteredItems);
                      setShowExportMenu(false);
                      addToast({ type: 'success', message: 'Exported to CSV' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => {
                      exportToJSON(filteredItems);
                      setShowExportMenu(false);
                      addToast({ type: 'success', message: 'Exported to JSON' });
                    }}
                    className="w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors"
                  >
                    Export as JSON
                  </button>
                </div>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => importFileRef.current?.click()}
            >
              <FileUp className="h-4 w-4 mr-1" />
              Import
            </Button>
            <input
              ref={importFileRef}
              type="file"
              accept=".csv,.json"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                try {
                  let result;
                  if (file.name.endsWith('.csv')) {
                    result = await importFromCSV(file);
                  } else if (file.name.endsWith('.json')) {
                    result = await importFromJSON(file);
                  } else {
                    addToast({ type: 'error', message: 'Unsupported file format' });
                    return;
                  }

                  if (result.success && result.items.length > 0) {
                    for (const item of result.items) {
                      await addItem(item);
                    }
                    addToast({ type: 'success', message: `Imported ${result.items.length} items` });
                  } else {
                    addToast({ 
                      type: 'warning', 
                      message: `Import completed with ${result.errors.length} errors. ${result.items.length} items imported.` 
                    });
                  }
                } catch (error) {
                  addToast({ type: 'error', message: 'Failed to import file' });
                }
                
                if (importFileRef.current) {
                  importFileRef.current.value = '';
                }
              }}
            />
          </div>
          <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const action = undo();
                if (action) {
                  addToast({ type: 'info', message: 'Undone' });
                  // Apply undo action
                  if (action.type === 'delete') {
                    await addItem(action.item);
                  } else if (action.type === 'update') {
                    await updateItem(action.itemId, action.oldItem);
                  } else if (action.type === 'add') {
                    await deleteItem(action.item.id);
                  }
                }
              }}
              disabled={!canUndo}
              title="Undo (Cmd+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={async () => {
                const action = redo();
                if (action) {
                  addToast({ type: 'info', message: 'Redone' });
                  // Apply redo action
                  if (action.type === 'delete') {
                    await deleteItem(action.item.id);
                  } else if (action.type === 'update') {
                    await updateItem(action.itemId, action.newItem);
                  } else if (action.type === 'add') {
                    await addItem(action.item);
                  }
                }
              }}
              disabled={!canRedo}
              title="Redo (Cmd+Shift+Z)"
            >
              <Redo2 className="h-4 w-4" />
            </Button>
          </div>
          <Button
            onClick={() => {
              setProductName('');
              setPendingProductName(null);
              setShowNamePrompt(true);
            }}
            className="relative"
            data-tour="create-listing"
          >
            <Upload className="h-4 w-4 mr-2" />
            Generate Listing
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handlePhotoSelected(e.target.files)}
          />
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Inventory List */}
        <InventorySidebar
          items={filteredItems}
          selectedItemId={selectedItemId}
          onItemSelect={handleItemSelect}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIds={selectedIds}
          onSelect={handleSelect}
        />

        {/* Right Side - Item Details */}
        <div className="flex-1 overflow-hidden bg-background">
          <div className="h-full p-6">
            {isProcessing && selectedItem ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <h2 className="text-2xl font-semibold mb-2">Generating listing with AI</h2>
                <p className="text-muted-foreground">Please wait one moment...</p>
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

      {/* Product Name Prompt Modal */}
      <Modal
        isOpen={showNamePrompt}
        onClose={() => {
          setShowNamePrompt(false);
          setPendingProductName(null);
          setProductName('');
        }}
        title="Enter Product Name"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="Product Name"
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="e.g., iPhone 13 Pro, MacBook Pro, etc."
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleNameSubmit();
              }
            }}
          />
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setShowNamePrompt(false);
                setPendingProductName(null);
                setProductName('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleNameSubmit}>
              Continue
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

        {/* Mark as Sold Confirmation Dialog */}
      <ConfirmDialog
        isOpen={markSoldConfirmOpen}
        onClose={() => {
          setMarkSoldConfirmOpen(false);
          setItemToMarkSold(null);
        }}
        onConfirm={confirmMarkSold}
        title="Mark as Sold"
        message="Mark this item as sold? It will be removed from all platforms."
        confirmText="Mark as Sold"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Bulk Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkDeleteConfirmOpen}
        onClose={() => setBulkDeleteConfirmOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Delete Items"
        message={`Are you sure you want to delete ${selectedIds.size} ${selectedIds.size === 1 ? 'item' : 'items'}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
      />

      {/* Bulk Mark as Sold Confirmation Dialog */}
      <ConfirmDialog
        isOpen={bulkMarkSoldConfirmOpen}
        onClose={() => setBulkMarkSoldConfirmOpen(false)}
        onConfirm={confirmBulkMarkSold}
        title="Mark as Sold"
        message={`Mark ${selectedIds.size} ${selectedIds.size === 1 ? 'item' : 'items'} as sold? They will be removed from all platforms.`}
        confirmText="Mark as Sold"
        cancelText="Cancel"
        variant="warning"
      />

      {/* Bulk Actions Bar */}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onBulkDelete={handleBulkDelete}
        onBulkMarkSold={handleBulkMarkSold}
        onClearSelection={() => setSelectedIds(new Set())}
      />
    </div>
  );
};

