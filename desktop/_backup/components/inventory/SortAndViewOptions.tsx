import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { Button } from '../common/Button';
import { useInventoryStore } from '@/store/inventoryStore';

export const SortAndViewOptions: React.FC = () => {
  const {
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
  } = useInventoryStore();

  const sortOptions: Array<{ value: 'date' | 'price' | 'name' | 'status' | 'category'; label: string }> = [
    { value: 'date', label: 'Date' },
    { value: 'price', label: 'Price' },
    { value: 'name', label: 'Name' },
    { value: 'status', label: 'Status' },
    { value: 'category', label: 'Category' },
  ];

  return (
    <div className="flex items-center gap-4">
      {/* Sort Options */}
      <div className="flex items-center gap-2">
        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="h-9 px-3 rounded-md border border-input bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              Sort by {option.label}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
          title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
        >
          {sortOrder === 'asc' ? '↑' : '↓'}
        </Button>
      </div>

    </div>
  );
};

