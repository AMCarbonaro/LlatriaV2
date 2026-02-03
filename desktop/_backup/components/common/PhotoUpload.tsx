import React, { useRef, useState } from 'react';
import { Upload, X, Image as ImageIcon, GripVertical, Edit2, Star } from 'lucide-react';
import { clsx } from 'clsx';
import { Button } from './Button';
import { LoadingSpinner } from './LoadingSpinner';
import { ImageEditor } from './ImageEditor';
import { validateImageFile } from '@/utils/validation';
import { compressImage } from '@/utils/imageCompression';
import { useToastStore } from '@/store/toastStore';

interface PhotoUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  multiple?: boolean;
  primaryImageIndex?: number;
  onPrimaryImageChange?: (index: number) => void;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  images,
  onImagesChange,
  maxImages = 10,
  multiple = true,
  primaryImageIndex = 0,
  onPrimaryImageChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<Record<number, number>>({});
  const [editingImageIndex, setEditingImageIndex] = useState<number | null>(null);
  const addToast = useToastStore((state) => state.addToast);

  // Check if Electron API is available
  const isElectron = typeof window !== 'undefined' && (window as any).electron;

  const handleFileSelect = async (files: FileList | null) => {
    console.log('📂 handleFileSelect called', files ? files.length : 0, 'files');
    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }

    const fileArray = Array.from(files);
    console.log('📋 Processing', fileArray.length, 'files');
    await processFiles(fileArray);
  };

  const processFiles = async (fileArray: File[]) => {
    console.log('📁 processFiles called with', fileArray.length, 'files');
    const remainingSlots = maxImages - images.length;
    const filesToAdd = fileArray.slice(0, remainingSlots);
    
    setIsLoading(true);
    let loadedCount = 0;
    const newImages: string[] = [];

    const imageFiles = filesToAdd.filter(f => f.type.startsWith('image/'));
    const totalFiles = imageFiles.length;
    
    console.log('🖼️ Filtered to', totalFiles, 'image files');
    
    if (totalFiles === 0) {
      console.log('❌ No image files found');
      addToast({ type: 'error', message: 'Please select image files only' });
      setIsLoading(false);
      return;
    }

    // Process files sequentially to ensure proper callback
    for (let index = 0; index < imageFiles.length; index++) {
      const file = imageFiles[index];
      console.log(`Processing file ${index + 1}/${totalFiles}:`, file.name);
      
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        addToast({ type: 'error', message: validation.error || 'Invalid image file' });
        continue;
      }

      try {
        // Compress image
        setUploadProgress(prev => ({ ...prev, [index]: 50 }));
        const compressedBlob = await compressImage(file);
        setUploadProgress(prev => ({ ...prev, [index]: 80 }));
        
        // Convert to base64
        const base64Result = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            resolve(result);
          };
          reader.onerror = reject;
          reader.readAsDataURL(compressedBlob);
        });
        
        newImages.push(base64Result);
        loadedCount++;
        setUploadProgress(prev => ({ ...prev, [index]: 100 }));
        console.log(`✅ File ${index + 1} processed, total: ${loadedCount}/${totalFiles}`);
        
      } catch (error) {
        console.error(`❌ Error processing file ${index + 1}:`, error);
        addToast({ type: 'error', message: `Failed to process ${file.name}` });
      }
    }
    
    // Call onImagesChange once all files are processed
    if (newImages.length > 0) {
      console.log('📤 Calling onImagesChange with', newImages.length, 'new images');
      onImagesChange([...images, ...newImages]);
    }
    setIsLoading(false);
    setUploadProgress({});
    
    if (filesToAdd.filter(f => f.type.startsWith('image/')).length === 0) {
      setIsLoading(false);
    }
  };

  const handleBrowseClick = async () => {
    // Use Electron's native dialog if available
    if (isElectron && (window as any).electron.showOpenDialog) {
      try {
        setIsLoading(true);
        const result = await (window as any).electron.showOpenDialog({
          properties: multiple ? ['openFile', 'multiSelections'] : ['openFile'],
          filters: [
            { name: 'Images', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp'] },
            { name: 'All Files', extensions: ['*'] }
          ]
        });

        if (!result.canceled && result.filePaths.length > 0) {
          const remainingSlots = maxImages - images.length;
          const pathsToAdd = result.filePaths.slice(0, remainingSlots);
          
          // Read files using Electron's file system access
          const files: File[] = [];
          for (const filePath of pathsToAdd) {
            try {
              const fileData = await (window as any).electron.readFile(filePath);
              // Convert base64 to blob
              const byteCharacters = atob(fileData.data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: fileData.type });
              const file = new File([blob], fileData.name, { type: fileData.type });
              files.push(file);
            } catch (error) {
              console.error(`Error reading file ${filePath}:`, error);
              addToast({ type: 'error', message: `Failed to read file: ${filePath.split('/').pop()}` });
            }
          }
          
          if (files.length > 0) {
            await processFiles(files);
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error opening file dialog:', error);
        addToast({ type: 'error', message: 'Failed to open file dialog' });
        setIsLoading(false);
        // Fallback to HTML file input
        fileInputRef.current?.click();
      }
    } else {
      // Fallback to HTML file input
      fileInputRef.current?.click();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    // Adjust primary image index if needed
    if (onPrimaryImageChange) {
      if (index === primaryImageIndex && newImages.length > 0) {
        onPrimaryImageChange(0);
      } else if (index < primaryImageIndex) {
        onPrimaryImageChange(primaryImageIndex - 1);
      }
    }
  };

  const setPrimaryImage = (index: number) => {
    if (onPrimaryImageChange) {
      onPrimaryImageChange(index);
      addToast({ type: 'success', message: 'Primary image set' });
    }
  };

  const handleImageEdit = (editedImage: string) => {
    if (editingImageIndex !== null) {
      const newImages = [...images];
      newImages[editingImageIndex] = editedImage;
      onImagesChange(newImages);
      setEditingImageIndex(null);
      addToast({ type: 'success', message: 'Image edited successfully' });
    }
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images];
    const [removed] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, removed);
    onImagesChange(newImages);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleImageDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newImages = [...images];
    const draggedItem = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedItem);
    onImagesChange(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="w-full">
      <div
        className={clsx(
          'border-2 border-dashed rounded-lg p-8 transition-colors relative',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          images.length >= maxImages && 'opacity-50 pointer-events-none',
          isLoading && 'opacity-50 pointer-events-none'
        )}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10 rounded-lg">
            <div className="flex flex-col items-center gap-2">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-muted-foreground">Uploading images...</p>
            </div>
          </div>
        )}
        <div className="flex flex-col items-center justify-center space-y-4">
          {images.length === 0 ? (
            <>
              <div className="rounded-full bg-muted p-4">
                <Upload className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">
                  Drag and drop images here, or{' '}
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    className="text-primary hover:underline"
                  >
                    browse
                  </button>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JPG, PNG, GIF (max {maxImages} images)
                </p>
              </div>
            </>
          ) : (
            <div className="w-full">
              <div className="grid grid-cols-4 gap-4 mb-4">
                {images.map((image, index) => (
                  <div
                    key={index}
                    className="relative group"
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleImageDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                  >
                    <div className={clsx(
                      'aspect-square rounded-lg overflow-hidden border bg-muted relative',
                      draggedIndex === index ? 'border-primary opacity-50' : 'border-border',
                      'cursor-move'
                    )}>
                      <img
                        src={image}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {index === primaryImageIndex && (
                        <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded flex items-center gap-1">
                          <Star className="h-3 w-3 fill-current" />
                          Primary
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingImageIndex(index);
                          }}
                          className="flex-1 bg-black/70 text-white border-none hover:bg-black/90"
                        >
                          <Edit2 className="h-3 w-3 mr-1" />
                          Edit
                        </Button>
                        {onPrimaryImageChange && index !== primaryImageIndex && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setPrimaryImage(index);
                            }}
                            className="bg-black/70 text-white border-none hover:bg-black/90"
                            title="Set as primary"
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {uploadProgress[index] !== undefined && uploadProgress[index] < 100 && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <div className="text-white text-sm">{uploadProgress[index]}%</div>
                        </div>
                      )}
                    </div>
                    <div className="absolute top-2 left-2 bg-black/70 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-black/70 hover:bg-black text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {images.length < maxImages && (
                  <button
                    type="button"
                    onClick={handleBrowseClick}
                    className="aspect-square rounded-lg border-2 border-dashed border-border hover:border-primary/50 flex items-center justify-center transition-colors"
                  >
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </button>
                )}
              </div>
              <div className="text-center">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleBrowseClick}
                >
                  Add More Images
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Image Editor */}
      {editingImageIndex !== null && images[editingImageIndex] && (
        <ImageEditor
          image={images[editingImageIndex]}
          isOpen={editingImageIndex !== null}
          onClose={() => setEditingImageIndex(null)}
          onSave={handleImageEdit}
        />
      )}
    </div>
  );
};


