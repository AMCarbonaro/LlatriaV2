import React from 'react';
import { Search, Package, Filter } from 'lucide-react';
import { InventoryItem as InventoryItemType } from '@/types/inventory';
import { useInventoryStore } from '@/store/inventoryStore';
import { ItemStatus, Platform } from '@/types/inventory';
import { clsx } from 'clsx';

interface InventorySidebarProps {
  items: InventoryItemType[];
  selectedItemId: string | null;
  onItemSelect: (item: InventoryItemType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
}

const statusOptions = [
  { value: 'all', label: 'All' },
  { value: 'unposted', label: 'Unposted' },
  { value: 'active', label: 'Active' },
  { value: 'sold', label: 'Sold' },
] as const;

const platformOptions = [
  { value: 'facebook', label: 'FB', icon: '📘' },
  { value: 'ebay', label: 'eBay', icon: '🛒' },
  { value: 'website', label: 'Web', icon: '🌐' },
] as const;

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
    setStatusFilter,
    togglePlatform,
  } = useInventoryStore();

  const [showFilters, setShowFilters] = React.useState(false);

  return (
    <div className="w-80 sidebar border-r flex flex-col h-full">
      {/* Search Header */}
      <div className="p-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search items..."
            className="search-input"
          />
        </div>
        
        {/* Quick Filters */}
        <div className="flex items-center gap-1 flex-wrap">
          {statusOptions.map((status) => (
            <button
              key={status.value}
              onClick={() => setStatusFilter(status.value as ItemStatus | 'all')}
              className={clsx(
                'filter-chip',
                statusFilter === status.value && 'active'
              )}
            >
              {status.label}
            </button>
          ))}
        </div>

        {/* Platform Filter Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={clsx(
              'ghost-btn text-xs',
              showFilters && 'bg-muted'
            )}
          >
            <Filter className="h-3 w-3" />
            Platforms
          </button>
          {selectedPlatforms.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              {selectedPlatforms.length} selected
            </span>
          )}
        </div>

        {/* Platform Filters (Collapsible) */}
        {showFilters && (
          <div className="flex gap-1 pt-1 animate-fade">
            {platformOptions.map((platform) => {
              const isSelected = selectedPlatforms.includes(platform.value as Platform);
              return (
                <button
                  key={platform.value}
                  onClick={() => togglePlatform(platform.value as Platform)}
                  className={clsx(
                    'flex-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-medium transition-all',
                    isSelected
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'bg-muted/50 text-muted-foreground hover:bg-muted'
                  )}
                >
                  <span>{platform.icon}</span>
                  <span>{platform.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Items Count */}
      <div className="px-4 pb-2">
        <span className="text-[11px] text-muted-foreground">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pb-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <Package className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No items found</p>
            <p className="text-xs text-muted-foreground">
              Try adjusting your filters
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                isSelected={selectedItemId === item.id}
                isChecked={selectedIds?.has(item.id) || false}
                onSelect={() => onItemSelect(item)}
                onCheck={onSelect ? (checked) => onSelect(item.id, checked) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

interface ItemCardProps {
  item: InventoryItemType;
  isSelected: boolean;
  isChecked: boolean;
  onSelect: () => void;
  onCheck?: (checked: boolean) => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isSelected,
  isChecked,
  onSelect,
  onCheck,
}) => {
  const getStatusBadge = () => {
    if (item.status === 'sold') {
      return <span className="status-badge status-sold">Sold</span>;
    }
    
    const hasPosting = item.platforms.some(p => item.postingStatus?.[p] === 'posting');
    const allPosted = item.platforms.length > 0 && 
      item.platforms.every(p => item.postingStatus?.[p] === 'posted');
    
    if (hasPosting) {
      return <span className="status-badge status-posting">Posting</span>;
    }
    if (allPosted) {
      return <span className="status-badge status-active">Live</span>;
    }
    return null;
  };

  const postedPlatforms = item.platforms.filter(p => item.postingStatus?.[p] === 'posted');

  return (
    <div
      className={clsx(
        'item-card cursor-pointer',
        isSelected && 'selected',
        isChecked && !isSelected && 'border-blue-400 bg-blue-50 dark:bg-blue-950/20',
        item.status === 'sold' && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex gap-3">
          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            {onCheck && (
              <div 
                className="absolute top-1 left-1 z-10"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => onCheck(e.target.checked)}
                  className="w-4 h-4 rounded border-2 border-white/80 bg-white/80 shadow-sm"
                />
              </div>
            )}
            {item.images[0] ? (
              <img
                src={item.images[0]}
                alt={item.title}
                className="thumb-img"
              />
            ) : (
              <div className="thumb-placeholder">
                <Package className="h-6 w-6" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
            <div>
              <h3 className="font-semibold text-sm truncate leading-tight">{item.title}</h3>
              <p className="text-[11px] text-muted-foreground truncate">{item.category}</p>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="price-tag text-base">${item.price.toFixed(2)}</span>
              
              <div className="flex items-center gap-1.5">
                {postedPlatforms.length > 0 && (
                  <div className="flex -space-x-1">
                    {postedPlatforms.slice(0, 3).map((platform) => (
                      <span 
                        key={platform} 
                        className="text-[10px] w-5 h-5 rounded-full bg-muted flex items-center justify-center"
                        title={platform}
                      >
                        {platform === 'facebook' && '📘'}
                        {platform === 'ebay' && '🛒'}
                        {platform === 'website' && '🌐'}
                      </span>
                    ))}
                  </div>
                )}
                {getStatusBadge()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
