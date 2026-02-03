import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { useListingStore } from '@/store/listingStore';
import { useInventoryStore } from '@/store/inventoryStore';
import { useDraftStore } from '@/store/draftStore';
import { useAuthStore } from '@/store/authStore';
import { findDuplicates } from '@/utils/duplicateDetection';
import { PhotoUpload } from '@/components/common/PhotoUpload';
import { AIDataDisplay } from '@/components/listing/AIDataDisplay';
import { ListingForm } from '@/components/listing/ListingForm';
import { PlatformSelector } from '@/components/listing/PlatformSelector';
import { ListingPreview } from '@/components/listing/ListingPreview';
import { Button } from '@/components/common/Button';
import { Card, CardContent } from '@/components/common/Card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Modal } from '@/components/common/Modal';
import { useToastStore } from '@/store/toastStore';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { aiService } from '@/services/aiService';
import { ListingFormData } from '@/types/listing';

interface CreateListingPageProps {
  onBack: () => void;
  onComplete: () => void;
}

export const CreateListingPage: React.FC<CreateListingPageProps> = ({
  onBack,
  onComplete,
}) => {
  const {
    uploadedImages,
    aiData,
    isProcessingAI,
    currentStep,
    setUploadedImages,
    setAIData,
    setIsProcessingAI,
    updateListingField,
    setCurrentStep,
    reset,
  } = useListingStore();

  const { addItem, items } = useInventoryStore();
  const addToast = useToastStore((state) => state.addToast);
  const { setDraft, clearDraft, hasUnsavedChanges, loadDraft, setUnsavedChanges } = useDraftStore();
  const { isAuthenticated } = useAuthStore();
  const [duplicateMatches, setDuplicateMatches] = useState<ReturnType<typeof findDuplicates>>([]);
  const [showDuplicateWarning, setShowDuplicateWarning] = useState(false);

  // Load draft on mount
  useEffect(() => {
    const savedDraft = loadDraft();
    if (savedDraft) {
      setListing(savedDraft);
      if (savedDraft.images.length > 0) {
        setUploadedImages(savedDraft.images);
      }
    }
  }, [loadDraft, setUploadedImages]);

  const [listing, setListing] = useState<ListingFormData>({
    title: '',
    description: '',
    price: 0,
    condition: 'used',
    category: '',
    images: [],
    platforms: [],
  });

  // Auto-save draft when listing changes (debounced)
  useEffect(() => {
    const hasContent = listing.title || listing.description || listing.price > 0 || listing.category || listing.images.length > 0;
    if (hasContent) {
      const timer = setTimeout(() => {
        setDraft(listing);
        setUnsavedChanges(true);
      }, 1000); // Debounce by 1 second
      return () => clearTimeout(timer);
    }
  }, [listing, setDraft, setUnsavedChanges]);

  useEffect(() => {
    setListing((prev) => ({ ...prev, images: uploadedImages }));
  }, [uploadedImages]);

  useEffect(() => {
    if (aiData) {
      setListing((prev) => ({
        ...prev,
        title: aiData.recognizedItem,
        description: aiData.description,
        price: aiData.suggestedPrice,
        condition: aiData.condition,
        category: aiData.category,
      }));
    }
  }, [aiData]);

  const handleImageUpload = async (images: string[]) => {
    console.log('handleImageUpload called', { 
      imageCount: images.length, 
      hasAiData: !!aiData, 
      isProcessingAI,
      isAuthenticated,
      images: images.map(img => img.substring(0, 50) + '...')
    });
    
    // Always update uploaded images
    setUploadedImages(images);
    console.log('Updated uploadedImages state, new count:', images.length);
  };

  const processImageWithAI = async () => {
    if (uploadedImages.length === 0) {
      addToast({ type: 'warning', message: 'Please upload an image first' });
      return;
    }

    // Check authentication
    if (!isAuthenticated) {
      addToast({ 
        type: 'error', 
        message: 'Please log in to use AI features' 
      });
      return;
    }

    setIsProcessingAI(true);
    addToast({ type: 'info', message: 'Processing image with AI...' });
    
    try {
      // Images are already base64 data URLs from PhotoUpload
      const base64Image = uploadedImages[0]; // Use first image for recognition
      
      if (!base64Image || !base64Image.startsWith('data:image')) {
        throw new Error('Invalid image format');
      }
      
      // Convert data URL to File object for AI service
      const base64Data = base64Image.includes(',') 
        ? base64Image.split(',')[1] 
        : base64Image.replace(/^data:image\/\w+;base64,/, '');
      
      // Create a File object from base64
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      const file = new File([blob], 'image.jpg', { type: 'image/jpeg' });
      
      console.log('Processing image with AI...', { fileSize: file.size, fileName: file.name });
      const data = await aiService.recognizeItem(file);
      setAIData(data);
      addToast({ type: 'success', message: 'AI analysis complete!' });
    } catch (error: any) {
      console.error('AI processing error:', error);
      const errorMessage = error.message || 'Failed to process image';
      if (errorMessage.includes('API') || errorMessage.includes('configured')) {
        addToast({ 
          type: 'error', 
          message: 'Google APIs not configured. Please set up API keys in backend/.env' 
        });
      } else if (errorMessage.includes('authenticated') || errorMessage.includes('401')) {
        addToast({ 
          type: 'error', 
          message: 'Please log in to use AI features' 
        });
      } else {
        addToast({ 
          type: 'error', 
          message: `Failed to process image: ${errorMessage}` 
        });
      }
    } finally {
      setIsProcessingAI(false);
    }
  };

  const handleNext = () => {
    if (currentStep === 1) {
      if (uploadedImages.length === 0) {
        addToast({ type: 'warning', message: 'Please upload at least one image' });
        return;
      }
      if (isProcessingAI) {
        addToast({ type: 'info', message: 'Please wait for AI processing to complete' });
        return;
      }
      if (!aiData) {
        addToast({ type: 'warning', message: 'AI processing is required. Please wait or try uploading again.' });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      // Validate form
      if (!listing.title || !listing.description || listing.price <= 0 || !listing.category) {
        addToast({ type: 'error', message: 'Please fill in all required fields' });
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (listing.platforms.length === 0) {
        addToast({ type: 'warning', message: 'Please select at least one platform' });
        return;
      }
      setCurrentStep(4);
    }
  };

  // Keyboard shortcuts for CreateListingPage
  useKeyboardShortcuts([
    {
      key: 's',
      metaKey: true,
      handler: (e) => {
        e.preventDefault();
        if (currentStep === 4) {
          handleComplete();
        } else if (currentStep > 1) {
          handleNext();
        }
      },
    },
    {
      key: 'Escape',
      handler: () => {
        handleBack();
      },
    },
  ]);

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    } else {
      reset();
      clearDraft();
      onBack();
    }
  };

  const handleComplete = async () => {
    // Check for duplicates
    const duplicates = findDuplicates(listing, items);
    if (duplicates.length > 0) {
      setDuplicateMatches(duplicates);
      setShowDuplicateWarning(true);
      return;
    }

    // Create inventory item with posting status set to 'idle' for all selected platforms
    const postingStatus: Record<string, 'idle'> = {};
    listing.platforms.forEach(platform => {
      postingStatus[platform] = 'idle';
    });

    await addItem({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition as any,
      category: listing.category,
      images: listing.images,
      status: 'active',
      platforms: listing.platforms,
      postingStatus: Object.keys(postingStatus).length > 0 ? postingStatus : undefined,
      aiData: aiData || undefined,
    });
    addToast({ type: 'success', message: 'Listing created successfully!' });
    reset();
    clearDraft();
    onComplete();
  };

  const handleConfirmCreate = async () => {
    // Create inventory item despite duplicates with posting status set to 'idle'
    const postingStatus: Record<string, 'idle'> = {};
    listing.platforms.forEach(platform => {
      postingStatus[platform] = 'idle';
    });

    addItem({
      title: listing.title,
      description: listing.description,
      price: listing.price,
      condition: listing.condition as any,
      category: listing.category,
      images: listing.images,
      status: 'active',
      platforms: listing.platforms,
      postingStatus: Object.keys(postingStatus).length > 0 ? postingStatus : undefined,
      aiData: aiData || undefined,
    });
    addToast({ type: 'success', message: 'Listing created successfully!' });
    reset();
    clearDraft();
    setShowDuplicateWarning(false);
    setDuplicateMatches([]);
    onComplete();
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex items-center gap-4 mb-6 pt-2">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Listing</h1>
          <p className="text-muted-foreground mt-1">Step {currentStep} of 4</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Step 1: Upload Photo */}
          {currentStep === 1 && (
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>
                <PhotoUpload
                  images={uploadedImages}
                  onImagesChange={handleImageUpload}
                />
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">
                    Debug: Images uploaded: {uploadedImages.length} | 
                    Has AI Data: {aiData ? 'Yes' : 'No'} | 
                    Processing: {isProcessingAI ? 'Yes' : 'No'} |
                    Authenticated: {isAuthenticated ? 'Yes' : 'No'}
                  </p>
                  {uploadedImages.length > 0 && !aiData && !isProcessingAI && (
                    <Button 
                      onClick={processImageWithAI}
                      disabled={!isAuthenticated}
                      className="w-full"
                    >
                      {isAuthenticated ? 'Analyze Image with AI' : 'Please log in to use AI'}
                    </Button>
                  )}
                  {uploadedImages.length === 0 && (
                    <p className="text-sm text-muted-foreground">Upload an image above to enable AI analysis</p>
                  )}
                </div>
                {isProcessingAI && !aiData && (
                  <div className="mt-6 flex flex-col items-center justify-center p-8 border border-border rounded-lg">
                    <LoadingSpinner size="lg" />
                    <p className="mt-4 text-sm text-muted-foreground">Processing image with AI...</p>
                  </div>
                )}
                {aiData && (
                  <div className="mt-6">
                    <AIDataDisplay aiData={aiData} isProcessing={isProcessingAI} />
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: Review & Edit AI Data */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <AIDataDisplay aiData={aiData} isProcessing={false} />
              <ListingForm
                title={listing.title}
                description={listing.description}
                price={listing.price}
                condition={listing.condition}
                category={listing.category}
                onTitleChange={(value) => {
                  setListing((prev) => ({ ...prev, title: value }));
                  updateListingField('title', value);
                }}
                onDescriptionChange={(value) => {
                  setListing((prev) => ({ ...prev, description: value }));
                  updateListingField('description', value);
                }}
                showCharacterCount={true}
                onPriceChange={(value) => {
                  setListing((prev) => ({ ...prev, price: value }));
                  updateListingField('price', value);
                }}
                onConditionChange={(value) => {
                  setListing((prev) => ({ ...prev, condition: value }));
                  updateListingField('condition', value);
                }}
                onCategoryChange={(value) => {
                  setListing((prev) => ({ ...prev, category: value }));
                  updateListingField('category', value);
                }}
              />
            </div>
          )}

          {/* Step 3: Select Platforms */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <PlatformSelector
                selectedPlatforms={listing.platforms}
                onPlatformsChange={(platforms) => {
                  setListing((prev) => ({ ...prev, platforms }));
                  updateListingField('platforms', platforms);
                }}
              />
              <ListingPreview listing={listing} />
            </div>
          )}

          {/* Step 4: Preview & Post */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 mb-4">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">Ready to post!</span>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    Review your listing below. Click "Post to Platforms" to create the listing.
                  </p>
                  <ListingPreview listing={listing} />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border p-4 flex items-center justify-between">
        <Button variant="outline" onClick={handleBack}>
          {currentStep === 1 ? 'Cancel' : 'Back'}
        </Button>
        {currentStep < 4 ? (
          <Button onClick={handleNext} disabled={isProcessingAI}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button onClick={handleComplete}>
            <Check className="h-4 w-4 mr-2" />
            Create Listing
          </Button>
        )}
      </div>

      {/* Duplicate Warning Modal */}
      <Modal
        isOpen={showDuplicateWarning}
        onClose={() => setShowDuplicateWarning(false)}
        title="Possible Duplicate Items Found"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            We found {duplicateMatches.length} similar item{duplicateMatches.length > 1 ? 's' : ''} in your inventory. 
            Review them below before creating this listing.
          </p>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {duplicateMatches.slice(0, 5).map((match) => (
              <Card key={match.item.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {match.item.images[0] && (
                      <img
                        src={match.item.images[0]}
                        alt={match.item.title}
                        className="w-16 h-16 rounded-lg object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold">{match.item.title}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        ${match.item.price.toFixed(2)} • {match.item.category}
                      </p>
                      <div className="mt-2 space-y-1">
                        {match.reasons.map((reason, idx) => (
                          <span
                            key={idx}
                            className="inline-block mr-2 px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded text-xs"
                          >
                            {reason}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round(match.similarity * 100)}% match
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowDuplicateWarning(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate}>
              Create Anyway
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

