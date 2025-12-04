import React from 'react';
import { Search } from 'lucide-react';
import { SearchBar } from '../common/SearchBar';
import { Button } from '../common/Button';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { Card } from '../common/Card';
import { useInventoryStore } from '@/store/inventoryStore';
import { ItemStatus, Platform } from '@/types/inventory';
import { clsx } from 'clsx';

const categories = ['All', 'Electronics', 'Jewelry', 'Tools', 'Musical Instruments'];

interface InventorySidebarProps {
  items: InventoryItemType[];
  selectedItemId: string | null;
  onItemSelect: (item: InventoryItemType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
}

export const InventorySidebar: React.FC<InventorySidebarProps> = ({
  items,
  selectedItemId,
  onItemSelect,
  searchQuery,
  onSearchChange,
  selectedIds,
  onSelect,
}) => {
  const {
    statusFilter,
    selectedPlatforms,
    categoryFilter,
    setStatusFilter,
    togglePlatform,
    setCategoryFilter,
    selectedCategories,
    toggleCategory,
  } = useInventoryStore();

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Search inventory..."
            showHistory={true}
          />
        </div>
        
        {/* Filters */}
        <div className="space-y-3">
          {/* Status Filter */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</span>
            <div className="flex gap-1">
              {(['all', 'active', 'sold'] as const).map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="flex-1 text-xs"
                >
                  {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>

          {/* Platform Filter */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Platform</span>
            <div className="flex gap-1">
              {(['facebook', 'ebay', 'website'] as Platform[]).map((platform) => {
                const isSelected = selectedPlatforms.includes(platform);
                return (
                  <Button
                    key={platform}
                    variant={isSelected ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => togglePlatform(platform)}
                    className="flex-1 text-xs"
                  >
                    {platform.charAt(0).toUpperCase() + platform.slice(1)}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <span className="text-xs font-medium text-muted-foreground mb-1.5 block">Category</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat === 'All' ? 'all' : cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <p className="text-sm text-muted-foreground mb-2">No items found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your search
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-4">
            <EmptyState
              icon={Package}
              title="No items"
              description="Create a new listing to get started"
            />
          </div>
        ) : (
          <div className="p-4 space-y-3 overflow-y-auto flex-1">
            {items.map((item) => {
              const isSelected = selectedItemId === item.id;
              const isSold = item.status === 'sold';
              
              return (
                <Card
                  key={item.id}
                  className={clsx(
                    'cursor-pointer transition-all hover:shadow-md relative rounded-xl',
                    isSelected && 'ring-2 ring-primary',
                    selectedIds?.has(item.id) && 'ring-2 ring-blue-500',
                    isSold && 'opacity-60'
                  )}
                  onClick={() => onItemSelect(item)}
                >
                  {onSelect && (
                    <div className="absolute top-2 left-2 z-10" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedIds?.has(item.id)}
                        onChange={(e) => onSelect(item.id, e.target.checked)}
                        className="w-4 h-4 rounded border-border bg-background"
                      />
                    </div>
                  )}
                  <div className="p-3">
                    <div className="flex gap-3">
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                        {item.images[0] ? (
                          <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <h3 className="font-semibold text-base truncate mb-1">{item.title}</h3>
                        <span className="text-lg font-bold mb-1">${item.price.toFixed(2)}</span>
                        <span className="text-xs text-muted-foreground mb-2">{item.category}</span>
                        <div className="flex items-center justify-between mt-1">
                          {(() => {
                            // Only show icons for platforms that have been posted
                            const postedPlatforms = item.platforms.filter(platform => 
                              item.postingStatus?.[platform] === 'posted'
                            );
                            
                            return postedPlatforms.length > 0 ? (
                              <div className="flex gap-1">
                                {postedPlatforms.map((platform) => (
                                  <span key={platform} className="text-sm" title={platform}>
                                    {platform === 'facebook' && '📘'}
                                    {platform === 'ebay' && '🛒'}
                                    {platform === 'website' && '🌐'}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <div></div>
                            );
                          })()}
                          <div className="flex items-center gap-2">
                            {item.status === 'sold' && (
                              <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 font-bold">
                                SOLD
                              </span>
                            )}
                            {item.status !== 'sold' && (() => {
                              // Determine overall posting status
                              const hasPosting = item.platforms.some(platform => 
                                item.postingStatus?.[platform] === 'posting'
                              );
                              const allPosted = item.platforms.length > 0 && item.platforms.every(platform => 
                                item.postingStatus?.[platform] === 'posted'
                              );
                              
                              if (hasPosting) {
                                return (
                                  <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 font-bold">
                                    POSTING
                                  </span>
                                );
                              }
                              if (allPosted) {
                                return (
                                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 font-bold">
                                    POSTED
                                  </span>
                                );
                              }
                              return null;
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

