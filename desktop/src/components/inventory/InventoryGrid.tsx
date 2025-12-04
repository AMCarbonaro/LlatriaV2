import React from 'react';
import { Package } from 'lucide-react';
import { InventoryItem } from './InventoryItem';
import { EmptyState } from '../common/EmptyState';
import { InventoryItem as InventoryItemType } from '@/types/inventory';

interface InventoryGridProps {
  items: InventoryItemType[];
  onEdit: (item: InventoryItemType) => void;
  onDelete: (id: string) => void;
  onMarkSold: (id: string) => void;
  selectedIds?: Set<string>;
  onSelect?: (id: string, selected: boolean) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  items,
  onEdit,
  onDelete,
  onMarkSold,
  selectedIds,
  onSelect,
}) => {
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No items found"
        description="Try adjusting your filters or create a new listing"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map((item) => (
        <InventoryItem
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onMarkSold={onMarkSold}
          viewMode="grid"
          isSelected={selectedIds?.has(item.id)}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};


