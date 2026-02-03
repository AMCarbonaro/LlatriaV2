import React from 'react';
import { Button } from '../common/Button';
import { useInventoryStore } from '@/store/inventoryStore';
import { ItemStatus, Platform } from '@/types/inventory';

const categories = ['All', 'Electronics', 'Jewelry', 'Tools', 'Musical Instruments'];

export const InventoryFilters: React.FC = () => {
  const {
    statusFilter,
    platformFilter,
    categoryFilter,
    setStatusFilter,
    setPlatformFilter,
    setCategoryFilter,
  } = useInventoryStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <div className="flex gap-1">
          {(['all', 'active', 'sold'] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Platform:</span>
        <div className="flex gap-1">
          {(['all', 'facebook', 'ebay', 'website'] as const).map((platform) => (
            <Button
              key={platform}
              variant={platformFilter === platform ? 'primary' : 'outline'}
              size="sm"
              onClick={() => setPlatformFilter(platform)}
            >
              {platform === 'all' ? 'All' : platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Category:</span>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat === 'All' ? 'all' : cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

