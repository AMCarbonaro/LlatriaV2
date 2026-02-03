import React, { useState } from 'react';
import { Calendar, DollarSign, X } from 'lucide-react';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { useInventoryStore } from '@/store/inventoryStore';
import { clsx } from 'clsx';

const categories = ['Electronics', 'Jewelry', 'Tools', 'Musical Instruments', 'Furniture', 'Clothing', 'Sports Equipment', 'Other'];

export const AdvancedFilters: React.FC = () => {
  const {
    selectedCategories,
    dateRange,
    priceRange,
    toggleCategory,
    setDateRange,
    setPriceRange,
  } = useInventoryStore();
  

  const [showFilters, setShowFilters] = useState(false);
  const [localDateStart, setLocalDateStart] = useState(
    dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''
  );
  const [localDateEnd, setLocalDateEnd] = useState(
    dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''
  );
  const [localPriceMin, setLocalPriceMin] = useState(
    priceRange.min?.toString() || ''
  );
  const [localPriceMax, setLocalPriceMax] = useState(
    priceRange.max?.toString() || ''
  );

  const applyDateRange = () => {
    setDateRange({
      start: localDateStart ? new Date(localDateStart) : null,
      end: localDateEnd ? new Date(localDateEnd) : null,
    });
  };

  const clearDateRange = () => {
    setLocalDateStart('');
    setLocalDateEnd('');
    setDateRange({ start: null, end: null });
  };

  const applyPriceRange = () => {
    setPriceRange({
      min: localPriceMin ? parseFloat(localPriceMin) : null,
      max: localPriceMax ? parseFloat(localPriceMax) : null,
    });
  };

  const clearPriceRange = () => {
    setLocalPriceMin('');
    setLocalPriceMax('');
    setPriceRange({ min: null, max: null });
  };

  const hasActiveFilters = 
    selectedCategories.length > 0 ||
    dateRange.start ||
    dateRange.end ||
    priceRange.min !== null ||
    priceRange.max !== null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
        >
          {showFilters ? 'Hide' : 'Show'} Advanced Filters
          {hasActiveFilters && (
            <span className="ml-2 px-1.5 py-0.5 bg-primary text-primary-foreground rounded-full text-xs">
              {selectedCategories.length + (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0) + (priceRange.min !== null ? 1 : 0) + (priceRange.max !== null ? 1 : 0)}
            </span>
          )}
        </Button>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              selectedCategories.forEach(cat => toggleCategory(cat));
              clearDateRange();
              clearPriceRange();
            }}
          >
            Clear All
          </Button>
        )}
      </div>

      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Advanced Filters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Multiple Category Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Categories</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => {
                  const isSelected = selectedCategories.includes(category);
                  return (
                    <Button
                      key={category}
                      variant={isSelected ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="date"
                    label="Start Date"
                    value={localDateStart}
                    onChange={(e) => setLocalDateStart(e.target.value)}
                    onBlur={applyDateRange}
                  />
                </div>
                <div>
                  <Input
                    type="date"
                    label="End Date"
                    value={localDateEnd}
                    onChange={(e) => setLocalDateEnd(e.target.value)}
                    onBlur={applyDateRange}
                  />
                </div>
              </div>
              {(dateRange.start || dateRange.end) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearDateRange}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Date Range
                </Button>
              )}
            </div>

            {/* Price Range */}
            <div>
              <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Price Range
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    type="number"
                    label="Min Price"
                    value={localPriceMin}
                    onChange={(e) => setLocalPriceMin(e.target.value)}
                    onBlur={applyPriceRange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Input
                    type="number"
                    label="Max Price"
                    value={localPriceMax}
                    onChange={(e) => setLocalPriceMax(e.target.value)}
                    onBlur={applyPriceRange}
                    placeholder="1000000.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </div>
              {(priceRange.min !== null || priceRange.max !== null) && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearPriceRange}
                  className="mt-2"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear Price Range
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

