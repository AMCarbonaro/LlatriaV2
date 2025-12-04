import React, { useState, useEffect, useRef } from 'react';
import { Trash2, CheckCircle2, Sparkles, Save, X, Image as ImageIcon, Upload, Send, XCircle, Loader2 } from 'lucide-react';
import { InventoryItem as InventoryItemType, Platform } from '@/types/inventory';
import { Card, CardContent, CardHeader, CardTitle } from '../common/Card';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { AIDataDisplay } from '../listing/AIDataDisplay';
import { DynamicFields } from './DynamicFields';
import { useInventoryStore } from '@/store/inventoryStore';
import { useToastStore } from '@/store/toastStore';
import { platformService } from '@/services/platformService';
import { clsx } from 'clsx';

interface InventoryItemDetailsProps {
  item: InventoryItemType | null;
  onDelete: (id: string) => void;
  onMarkSold: (id: string) => void;
}

export const InventoryItemDetails: React.FC<InventoryItemDetailsProps> = ({
  item,
  onDelete,
  onMarkSold,
}) => {
  const { updateItem } = useInventoryStore();
  const addToast = useToastStore((state) => state.addToast);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: 0,
    condition: 'used',
    category: '',
    facebook: {
      title: '',
      description: '',
      price: 0,
      location: '',
    },
    ebay: {
      title: '',
      description: '',
      price: 0,
      shippingCost: 0,
      shippingMethod: 'standard',
      returnPolicy: '30',
      itemSpecifics: {} as Record<string, string>,
    },
    website: {
      title: '',
      description: '',
      price: 0,
      seoTitle: '',
      seoDescription: '',
    },
  });

  useEffect(() => {
    if (item) {
      setImages(item.images || []);
      setFormData({
        title: item.title,
        description: item.description,
        price: item.price,
        condition: item.condition,
        category: item.category,
        facebook: {
          title: item.title,
          description: item.description,
          price: item.price,
          location: '',
        },
        ebay: {
          title: item.title,
          description: item.description,
          price: item.price,
          shippingCost: 0,
          shippingMethod: 'standard',
          returnPolicy: '30',
          itemSpecifics: item.aiData?.specifications || {},
        },
        website: {
          title: item.title,
          description: item.description,
          price: item.price,
          seoTitle: item.title,
          seoDescription: item.description.substring(0, 160),
        },
      });
    }
  }, [item]);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const remainingSlots = 10 - images.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          setImages([...images, result]);
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleSave = async () => {
    if (!item) return;
    
    setIsSaving(true);
    setSaveSuccess(false);
    
    // Simulate API call to save changes
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await updateItem(item.id, {
      title: formData.title,
      description: formData.description,
      price: formData.price,
      condition: formData.condition as any,
      category: formData.category,
      images: images,
    });
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  const handleRemovePlatform = async (platform: Platform) => {
    if (!item) return;
    
    try {
      // Call platform-specific removal APIs
      if (platform === 'ebay' && item.ebayListingId) {
        const result = await platformService.removeFromEBay(item.id, item.ebayListingId);
        if (!result.success) {
          addToast({ 
            type: 'error', 
            message: `Failed to remove from eBay: ${result.error || 'Unknown error'}` 
          });
          return;
        }
      } else if (platform === 'website') {
        const result = await platformService.removeFromWebsite(item.id);
        if (!result.success) {
          addToast({ 
            type: 'error', 
            message: `Failed to remove from website: ${result.error || 'Unknown error'}` 
          });
          return;
        }
      }
      
      // Removing platform - clear posting status
      const newPlatforms = item.platforms.filter(p => p !== platform);
      const newPostingStatus = { ...item.postingStatus };
      delete newPostingStatus[platform];
      
      const updateData: any = { 
        platforms: newPlatforms,
        postingStatus: newPostingStatus
      };
      
      // Clear platform-specific listing IDs
      if (platform === 'ebay') {
        updateData.ebayListingId = undefined;
      } else if (platform === 'facebook') {
        updateData.facebookListingId = undefined;
      } else if (platform === 'website') {
        updateData.websiteListingId = undefined;
      }
      
      await updateItem(item.id, updateData);
      
      addToast({ type: 'success', message: `Removed from ${platform}` });
    } catch (error: any) {
      addToast({ 
        type: 'error', 
        message: `Failed to remove from ${platform}: ${error.message || 'Unknown error'}` 
      });
    }
  };

  const handlePostToPlatform = async (platform: Platform) => {
    console.log('🚀 handlePostToPlatform called', { platform, itemId: item?.id });
    
    if (!item) {
      console.error('❌ No item available');
      addToast({ type: 'error', message: 'No item selected' });
      return;
    }
    
    // Start posting process
    const newPostingStatus = {
      ...item.postingStatus,
      [platform]: 'posting' as const
    };
    
    // Add platform to platforms array if not already there
    const newPlatforms = item.platforms.includes(platform) 
      ? item.platforms 
      : [...item.platforms, platform];
    
    console.log('📝 Updating item status to posting...', { platform, newPlatforms });
    
    try {
      await updateItem(item.id, { 
        postingStatus: newPostingStatus,
        platforms: newPlatforms
      });
      console.log('✅ Item status updated to posting');
    } catch (error) {
      console.error('❌ Failed to update item status:', error);
      addToast({ type: 'error', message: 'Failed to update item status' });
      return;
    }
    
    try {
      console.log(`📤 Starting ${platform} posting process...`);
      let result;
      
      if (platform === 'ebay') {
        // Prepare eBay listing data
        const ebayListingData = {
          title: formData.ebay.title || item.title,
          description: formData.ebay.description || item.description,
          price: formData.ebay.price || item.price,
          condition: item.condition,
          category: item.category,
          images: images,
          shippingCost: formData.ebay.shippingCost,
          shippingMethod: formData.ebay.shippingMethod,
          returnPolicy: formData.ebay.returnPolicy,
          itemSpecifics: formData.ebay.itemSpecifics,
        };
        
        try {
          console.log('📤 Posting to eBay...', { itemId: item.id, listingData: ebayListingData });
          result = await platformService.postToEBay(item.id, ebayListingData);
          console.log('📥 eBay response:', result);
          
          if (result.success && result.listingId) {
            // Update to posted status with listing ID
            const finalPostingStatus = {
              ...item.postingStatus,
              ebay: 'posted' as const
            };
            const finalPlatforms = item.platforms.includes('ebay') 
              ? item.platforms 
              : [...item.platforms, 'ebay'];
            await updateItem(item.id, { 
              postingStatus: finalPostingStatus,
              ebayListingId: result.listingId,
              platforms: finalPlatforms,
            });
            
            addToast({ 
              type: 'success', 
              message: `Successfully posted to eBay! ${result.url ? `View listing: ${result.url}` : ''}` 
            });
          } else {
            throw new Error(result.error || 'Failed to post to eBay');
          }
        } catch (error: any) {
          // Re-throw PlatformError to be handled below
          throw error;
        }
      } else if (platform === 'facebook') {
        // Prepare Facebook listing data
        const facebookListingData = {
          title: formData.facebook.title || item.title,
          description: formData.facebook.description || item.description,
          price: formData.facebook.price || item.price,
          condition: item.condition,
          category: item.category,
          images: images,
          location: formData.facebook.location,
        };
        
        try {
          console.log('📤 Posting to Facebook...', { itemId: item.id, listingData: facebookListingData, imageCount: images.length });
          result = await platformService.postToFacebook(item.id, facebookListingData, images);
          console.log('📥 Facebook response:', result);
          
          if (result.success) {
            // Update to posted status
            const finalPostingStatus = {
              ...item.postingStatus,
              facebook: 'posted' as const
            };
            const finalPlatforms = item.platforms.includes('facebook') 
              ? item.platforms 
              : [...item.platforms, 'facebook'];
            await updateItem(item.id, { 
              postingStatus: finalPostingStatus,
              facebookListingId: result.listingId,
              platforms: finalPlatforms,
            });
            
            const message = result.requiresManualSubmit
              ? 'Form filled! Please review and click "Publish" in the Facebook window.'
              : `Successfully posted to Facebook Marketplace! ${result.url ? `View listing: ${result.url}` : ''}`;
            
            addToast({ 
              type: 'success', 
              message
            });
          } else {
            throw new Error(result.error || 'Failed to post to Facebook');
          }
        } catch (error: any) {
          // Re-throw PlatformError to be handled below
          throw error;
        }
      } else if (platform === 'website') {
        // Prepare website listing data
        const websiteListingData = {
          seoTitle: formData.website.seoTitle || item.title,
          seoDescription: formData.website.seoDescription || item.description.substring(0, 160),
        };
        
        try {
          console.log('📤 Posting to website...', { itemId: item.id, listingData: websiteListingData });
          result = await platformService.postToWebsite(item.id, websiteListingData);
          console.log('📥 Website response:', result);
          
          if (result.success) {
            // Update to posted status
            const finalPostingStatus = {
              ...item.postingStatus,
              website: 'posted' as const
            };
            const finalPlatforms = item.platforms.includes('website') 
              ? item.platforms 
              : [...item.platforms, 'website'];
            await updateItem(item.id, { 
              postingStatus: finalPostingStatus,
              platforms: finalPlatforms,
              websiteListingId: result.listingId,
            });
            
            addToast({ 
              type: 'success', 
              message: `Successfully posted to website! ${result.url ? `View listing: ${result.url}` : ''}` 
            });
          } else {
            throw new Error(result.error || 'Failed to post to website');
          }
        } catch (error: any) {
          // Re-throw to be handled below
          throw error;
        }
      }
    } catch (error: any) {
      console.error(`❌ Error posting to ${platform}:`, error);
      
      // Update to error status
      const errorPostingStatus = {
        ...item.postingStatus,
        [platform]: 'error' as const
      };
      
      try {
        await updateItem(item.id, { 
          postingStatus: errorPostingStatus
        });
      } catch (updateError) {
        console.error('❌ Failed to update error status:', updateError);
      }
      
      // Handle specific error types
      let errorMessage = error.message || 'Unknown error';
      
      if (error.code === 'EBAY_NOT_CONNECTED') {
        errorMessage = 'eBay account not connected. Please connect your eBay account in settings.';
      } else if (error.code === 'FACEBOOK_NOT_LOGGED_IN') {
        errorMessage = 'Please log in to Facebook first. The login window should open automatically.';
      } else if (error.code === 'EBAY_RATE_LIMIT' || error.code === 'FACEBOOK_RATE_LIMIT') {
        errorMessage = `Rate limit exceeded for ${platform}. Please wait a few minutes and try again.`;
      } else if (error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
      }
      
      addToast({ 
        type: 'error', 
        message: `Failed to post to ${platform}: ${errorMessage}`,
        duration: error.retryable ? 10000 : 5000, // Show retryable errors longer
      });
    }
  };

  const getPostingStatus = (platform: Platform): 'idle' | 'posting' | 'posted' | 'error' => {
    if (!item?.postingStatus) return 'idle';
    return item.postingStatus[platform] || 'idle';
  };

  const PostingIndicator: React.FC<{ status: 'idle' | 'posting' | 'posted' | 'error' }> = ({ status }) => {
    if (status === 'idle' || status === 'error') return null;
    
    return (
      <span
        className={`inline-block w-2 h-2 rounded-full ml-2 ${
          status === 'posted' ? 'bg-green-500' : 'bg-yellow-500'
        }`}
        title={status === 'posted' ? 'Posted' : status === 'posting' ? 'Posting...' : 'Idle'}
      />
    );
  };

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center p-8">
        <p className="text-lg text-muted-foreground mb-2">No item selected</p>
        <p className="text-sm text-muted-foreground">
          Click on an item from the list to view and edit details
        </p>
      </div>
    );
  }

  const isSold = item.status === 'sold';
  // Always show platform sections - platforms array just tracks which ones are active
  const hasFacebook = item.platforms.includes('facebook');
  const hasEbay = item.platforms.includes('ebay');
  const hasWebsite = item.platforms.includes('website');
  
  // Show buttons for all platforms - they can be added even if not in platforms array yet
  const showFacebookButton = true;
  const showEbayButton = true;
  const showWebsiteButton = true;

  return (
    <div className="h-full overflow-y-auto space-y-6 pb-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between gap-4 pb-4 border-b border-border sticky top-0 bg-background z-10">
        <div className="flex-1">
          <h2 className="text-2xl font-bold mb-2">Edit Listing</h2>
          {isSold && (
            <span className="px-2 py-1 rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 text-xs font-medium">
              SOLD
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isSold && (
            <>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : saveSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
              {saveSuccess && (
                <span className="text-sm text-green-600 dark:text-green-400">
                  Changes saved successfully
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onMarkSold(item.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark Sold
              </Button>
            </>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Photos Section */}
      <Card>
        <CardHeader>
          <CardTitle>Photos</CardTitle>
        </CardHeader>
        <CardContent>
          {images.length > 0 ? (
            <div className="grid grid-cols-4 gap-4 mb-4">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden border border-border bg-muted">
                    <img
                      src={image}
                      alt={`${item.title} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                      Primary
                    </div>
                  )}
                </div>
              ))}
              {images.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors bg-muted/50"
                >
                  <div className="text-center">
                    <ImageIcon className="h-8 w-8 text-muted-foreground mx-auto mb-1" />
                    <span className="text-xs text-muted-foreground">Add Photo</span>
                  </div>
                </button>
              )}
            </div>
          ) : (
            <div
              className={clsx(
                'border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer',
                'border-border hover:border-primary/50'
              )}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="rounded-full bg-muted p-4">
                  <Upload className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">
                    Click to upload photos or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, GIF (max 10 images)
                  </p>
                </div>
              </div>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </CardContent>
      </Card>

      {/* AI Analysis Section */}
      {item.aiData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Generated Data</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <AIDataDisplay aiData={item.aiData} isProcessing={false} />
            <p className="text-xs text-muted-foreground mt-4">
              Use the AI data below as a starting point. Edit each platform's listing individually.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Base Listing Info */}
      <Card>
        <CardHeader>
          <CardTitle>AI Generated Listing Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-foreground">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={6}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Condition
              </label>
              <select
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="new">New</option>
                <option value="like_new">Like New</option>
                <option value="used">Used</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
            <Input
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            />
          </div>

          {/* Dynamic Fields based on AI Data */}
          {item.aiData && (
            <DynamicFields
              aiData={item.aiData}
              formData={formData}
              onFieldChange={(field, value) => setFormData({ ...formData, [field]: value })}
              category={formData.category || item.category}
            />
          )}
        </CardContent>
      </Card>

      {/* Facebook Marketplace Section */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">📘</span>
              <CardTitle className="text-foreground flex items-center">
                Facebook Marketplace
                <PostingIndicator status={getPostingStatus('facebook')} />
              </CardTitle>
            </div>
            {showFacebookButton && (
              <Button
                variant={getPostingStatus('facebook') === 'posted' ? 'outline' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🔵 Facebook button clicked', { 
                    isSold, 
                    status: getPostingStatus('facebook'),
                    itemId: item?.id 
                  });
                  if (getPostingStatus('facebook') === 'posted') {
                    handleRemovePlatform('facebook');
                  } else {
                    handlePostToPlatform('facebook');
                  }
                }}
                disabled={isSold || getPostingStatus('facebook') === 'posting'}
              >
                {getPostingStatus('facebook') === 'posting' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : getPostingStatus('facebook') === 'posted' ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              value={formData.facebook.title}
              onChange={(e) => setFormData({
                ...formData,
                facebook: { ...formData.facebook, title: e.target.value }
              })}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Description
              </label>
              <textarea
                value={formData.facebook.description}
                onChange={(e) => setFormData({
                  ...formData,
                  facebook: { ...formData.facebook, description: e.target.value }
                })}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={formData.facebook.price}
                onChange={(e) => setFormData({
                  ...formData,
                  facebook: { ...formData.facebook, price: parseFloat(e.target.value) || 0 }
                })}
                step="0.01"
              />
              <Input
                label="Location (City, State or ZIP)"
                value={formData.facebook.location}
                onChange={(e) => setFormData({
                  ...formData,
                  facebook: { ...formData.facebook, location: e.target.value }
                })}
                placeholder="e.g., New York, NY or 10001"
              />
            </div>
          </CardContent>
        </Card>

      {/* eBay Section */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🛒</span>
              <CardTitle className="text-foreground flex items-center">
                eBay Listing
                <PostingIndicator status={getPostingStatus('ebay')} />
              </CardTitle>
            </div>
            {showEbayButton && (
              <Button
                variant={getPostingStatus('ebay') === 'posted' ? 'outline' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🟢 eBay button clicked', { 
                    isSold, 
                    status: getPostingStatus('ebay'),
                    itemId: item?.id 
                  });
                  if (getPostingStatus('ebay') === 'posted') {
                    handleRemovePlatform('ebay');
                  } else {
                    handlePostToPlatform('ebay');
                  }
                }}
                disabled={isSold || getPostingStatus('ebay') === 'posting'}
              >
                {getPostingStatus('ebay') === 'posting' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : getPostingStatus('ebay') === 'posted' ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              value={formData.ebay.title}
              onChange={(e) => setFormData({
                ...formData,
                ebay: { ...formData.ebay, title: e.target.value }
              })}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Description
              </label>
              <textarea
                value={formData.ebay.description}
                onChange={(e) => setFormData({
                  ...formData,
                  ebay: { ...formData.ebay, description: e.target.value }
                })}
                rows={6}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Price"
                type="number"
                value={formData.ebay.price}
                onChange={(e) => setFormData({
                  ...formData,
                  ebay: { ...formData.ebay, price: parseFloat(e.target.value) || 0 }
                })}
                step="0.01"
              />
              <Input
                label="Shipping Cost"
                type="number"
                value={formData.ebay.shippingCost}
                onChange={(e) => setFormData({
                  ...formData,
                  ebay: { ...formData.ebay, shippingCost: parseFloat(e.target.value) || 0 }
                })}
                step="0.01"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Shipping Method
                </label>
                <select
                  value={formData.ebay.shippingMethod}
                  onChange={(e) => setFormData({
                    ...formData,
                    ebay: { ...formData.ebay, shippingMethod: e.target.value }
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="standard">Standard Shipping</option>
                  <option value="expedited">Expedited Shipping</option>
                  <option value="overnight">Overnight Shipping</option>
                  <option value="economy">Economy Shipping</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-foreground">
                  Return Policy (Days)
                </label>
                <select
                  value={formData.ebay.returnPolicy}
                  onChange={(e) => setFormData({
                    ...formData,
                    ebay: { ...formData.ebay, returnPolicy: e.target.value }
                  })}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="0">No Returns</option>
                  <option value="14">14 Days</option>
                  <option value="30">30 Days</option>
                  <option value="60">60 Days</option>
                </select>
              </div>
            </div>
            {item.aiData?.specifications && Object.keys(item.aiData.specifications).length > 0 && (
              <div>
                <label className="block text-sm font-medium mb-2 text-foreground">
                  Item Specifics
                </label>
                <div className="space-y-2">
                  {Object.entries(item.aiData.specifications).map(([key, value]) => (
                    <div key={key} className="grid grid-cols-2 gap-2">
                      <Input
                        label={key}
                        value={formData.ebay.itemSpecifics[key] || value}
                        onChange={(e) => setFormData({
                          ...formData,
                          ebay: {
                            ...formData.ebay,
                            itemSpecifics: {
                              ...formData.ebay.itemSpecifics,
                              [key]: e.target.value
                            }
                          }
                        })}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

      {/* Website Section */}
      <Card>
        <CardHeader className="bg-blue-50 dark:bg-blue-950">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🌐</span>
              <CardTitle className="text-foreground flex items-center">
                Your Website
                <PostingIndicator status={getPostingStatus('website')} />
              </CardTitle>
            </div>
            {showWebsiteButton && (
              <Button
                variant={getPostingStatus('website') === 'posted' ? 'outline' : 'primary'}
                size="sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('🟡 Website button clicked', { 
                    isSold, 
                    status: getPostingStatus('website'),
                    itemId: item?.id 
                  });
                  if (getPostingStatus('website') === 'posted') {
                    handleRemovePlatform('website');
                  } else {
                    handlePostToPlatform('website');
                  }
                }}
                disabled={isSold || getPostingStatus('website') === 'posting'}
              >
                {getPostingStatus('website') === 'posting' ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : getPostingStatus('website') === 'posted' ? (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Remove
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Title"
              value={formData.website.title}
              onChange={(e) => setFormData({
                ...formData,
                website: { ...formData.website, title: e.target.value }
              })}
            />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                Description
              </label>
              <textarea
                value={formData.website.description}
                onChange={(e) => setFormData({
                  ...formData,
                  website: { ...formData.website, description: e.target.value }
                })}
                rows={4}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Input
              label="Price"
              type="number"
              value={formData.website.price}
              onChange={(e) => setFormData({
                ...formData,
                website: { ...formData.website, price: parseFloat(e.target.value) || 0 }
              })}
              step="0.01"
            />
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                SEO Title (for search engines)
              </label>
              <Input
                value={formData.website.seoTitle}
                onChange={(e) => setFormData({
                  ...formData,
                  website: { ...formData.website, seoTitle: e.target.value }
                })}
                placeholder="Optimized title for search engines"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-foreground">
                SEO Description (for search engines)
              </label>
              <textarea
                value={formData.website.seoDescription}
                onChange={(e) => setFormData({
                  ...formData,
                  website: { ...formData.website, seoDescription: e.target.value }
                })}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                placeholder="Meta description (150-160 characters recommended)"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {formData.website.seoDescription.length}/160 characters
              </p>
            </div>
          </CardContent>
        </Card>
    </div>
  );
};
