import React, { useState, useEffect } from 'react';
import { Input } from '../common/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { validateTitle, validateDescription, validatePrice, validateCategory } from '@/utils/validation';
import { clsx } from 'clsx';

interface ListingFormProps {
  title: string;
  description: string;
  price: number;
  condition: string;
  category: string;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onConditionChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  showCharacterCount?: boolean;
}

const conditions = [
  { value: 'new', label: 'New' },
  { value: 'like_new', label: 'Like New' },
  { value: 'used', label: 'Used' },
  { value: 'fair', label: 'Fair' },
  { value: 'poor', label: 'Poor' },
];

const categories = [
  'Electronics',
  'Jewelry',
  'Tools',
  'Musical Instruments',
  'Furniture',
  'Clothing',
  'Sports Equipment',
  'Other',
];

export const ListingForm: React.FC<ListingFormProps> = ({
  title,
  description,
  price,
  condition,
  category,
  onTitleChange,
  onDescriptionChange,
  onPriceChange,
  onConditionChange,
  onCategoryChange,
  showCharacterCount = false,
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const newErrors: Record<string, string> = {};
    
    if (touched.title) {
      const titleResult = validateTitle(title);
      if (!titleResult.isValid) {
        newErrors.title = titleResult.error || '';
      }
    }
    
    if (touched.description) {
      const descResult = validateDescription(description);
      if (!descResult.isValid) {
        newErrors.description = descResult.error || '';
      }
    }
    
    if (touched.price) {
      const priceResult = validatePrice(price);
      if (!priceResult.isValid) {
        newErrors.price = priceResult.error || '';
      }
    }
    
    if (touched.category) {
      const categoryResult = validateCategory(category);
      if (!categoryResult.isValid) {
        newErrors.category = categoryResult.error || '';
      }
    }
    
    setErrors(newErrors);
  }, [title, description, price, category, touched]);

  const handleTitleBlur = () => {
    setTouched((prev) => ({ ...prev, title: true }));
  };

  const handleDescriptionBlur = () => {
    setTouched((prev) => ({ ...prev, description: true }));
  };

  const handlePriceBlur = () => {
    setTouched((prev) => ({ ...prev, price: true }));
  };

  const handleCategoryChange = (value: string) => {
    setTouched((prev) => ({ ...prev, category: true }));
    onCategoryChange(value);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Listing Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            label={
              <>
                Title
                {showCharacterCount && title.length > 0 && (
                  <span className="text-xs text-muted-foreground ml-2">
                    ({title.length}/200)
                  </span>
                )}
              </>
            }
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            onBlur={handleTitleBlur}
            placeholder="Enter item title"
            error={errors.title}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5 text-foreground">
            Description
            {touched.description && description.length > 0 && (
              <span className="text-xs text-muted-foreground ml-2">
                ({description.length}/5000)
              </span>
            )}
          </label>
          <textarea
            value={description}
            onChange={(e) => onDescriptionChange(e.target.value)}
            onBlur={handleDescriptionBlur}
            placeholder="Enter item description"
            rows={6}
            className={clsx(
              'flex w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
              errors.description ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <Input
            label="Price"
            type="number"
            value={price}
            onChange={(e) => onPriceChange(parseFloat(e.target.value) || 0)}
            onBlur={handlePriceBlur}
            placeholder="0.00"
            min="0"
            step="0.01"
            error={errors.price}
          />

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Condition
            </label>
            <select
              value={condition}
              onChange={(e) => onConditionChange(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              {conditions.map((cond) => (
                <option key={cond.value} value={cond.value}>
                  {cond.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className={clsx(
                'flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
                errors.category ? 'border-red-500 focus-visible:ring-red-500' : 'border-input'
              )}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-500">{errors.category}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


