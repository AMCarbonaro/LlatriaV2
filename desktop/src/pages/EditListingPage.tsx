import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save } from 'lucide-react';
import { useInventoryStore } from '@/store/inventoryStore';
import { ListingForm } from '@/components/listing/ListingForm';
import { PlatformSelector } from '@/components/listing/PlatformSelector';
import { ListingPreview } from '@/components/listing/ListingPreview';
import { Button } from '@/components/common/Button';
import { useToastStore } from '@/store/toastStore';
import { InventoryItem as InventoryItemType } from '@/types/inventory';

interface EditListingPageProps {
  item: InventoryItemType;
  onBack: () => void;
  onSave: () => void;
}

export const EditListingPage: React.FC<EditListingPageProps> = ({
  item,
  onBack,
  onSave,
}) => {
  const { updateItem } = useInventoryStore();
  const addToast = useToastStore((state) => state.addToast);

  const [listing, setListing] = useState({
    title: item.title,
    description: item.description,
    price: item.price,
    condition: item.condition,
    category: item.category,
    images: item.images,
    platforms: item.platforms,
  });

  const handleSave = async () => {
    if (!listing.title || !listing.description || listing.price <= 0 || !listing.category) {
      addToast({ type: 'error', message: 'Please fill in all required fields' });
      return;
    }
    await updateItem(item.id, {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition as any,
      category: listing.category,
      images: listing.images,
      platforms: listing.platforms,
    });
    addToast({ type: 'success', message: 'Listing updated successfully!' });
    onSave();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Listing</h1>
          <p className="text-muted-foreground mt-1">Update item details</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <ListingForm
            title={listing.title}
            description={listing.description}
            price={listing.price}
            condition={listing.condition}
            category={listing.category}
            onTitleChange={(value) => setListing((prev) => ({ ...prev, title: value }))}
            onDescriptionChange={(value) => setListing((prev) => ({ ...prev, description: value }))}
            onPriceChange={(value) => setListing((prev) => ({ ...prev, price: value }))}
            onConditionChange={(value) => setListing((prev) => ({ ...prev, condition: value }))}
            onCategoryChange={(value) => setListing((prev) => ({ ...prev, category: value }))}
          />

          <PlatformSelector
            selectedPlatforms={listing.platforms}
            onPlatformsChange={(platforms) => setListing((prev) => ({ ...prev, platforms }))}
          />

          <ListingPreview listing={listing} />
        </div>
      </div>

      <div className="border-t border-border p-4 flex items-center justify-end gap-4">
        <Button variant="outline" onClick={onBack}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};


