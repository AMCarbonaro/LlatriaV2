import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useInventoryStore } from '@/store/inventoryStore';
import { useThemeStore } from '@/store/themeStore';
import { apiService } from '@/services/apiService';
import { mockAIService } from '@/services/mockAIService';
import { Platform } from '@/types/inventory';

const useRealApi = true; // Set to false for offline development

export default function CameraScreen() {
  const router = useRouter();
  const { isDark } = useThemeStore();
  const [permission, requestPermission] = useCameraPermissions();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showNamePrompt, setShowNamePrompt] = useState(false);
  const [productName, setProductName] = useState('');
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null);
  const cameraRef = useRef<CameraView>(null);
  const { addItem, updateItem } = useInventoryStore();
  const isProcessingRef = useRef(false);

  if (!permission) {
    return <View style={styles.container} />;
  }

  const dynamicStyles = {
    message: {
      ...styles.message,
      color: isDark ? '#ffffff' : '#000000',
    },
    modalContent: {
      ...styles.modalContent,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
    modalTitle: {
      ...styles.modalTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    nameInput: {
      ...styles.nameInput,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
      borderColor: isDark ? '#3a3a3a' : '#e5e5e5',
      color: isDark ? '#ffffff' : '#000000',
    },
  };

  if (!permission.granted) {
    return (
      <View style={[styles.container, { backgroundColor: isDark ? '#0a0a0a' : '#000000' }]}>
        <Text style={dynamicStyles.message}>We need your permission to use the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;

    try {
      setIsProcessing(true);
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });

      if (!photo?.uri) {
        Alert.alert('Error', 'Failed to take photo');
        setIsProcessing(false);
        return;
      }

      // Convert photo to base64 data URL for storage
      const imageData = `data:image/jpeg;base64,${photo.base64}`;
      
      // Store the photo and show name prompt
      setPendingPhoto(imageData);
      setShowNamePrompt(true);
      setIsProcessing(false);
    } catch (error) {
      console.error('Camera error:', error);
      Alert.alert('Error', 'Failed to take photo');
      setIsProcessing(false);
    }
  };

  const handleNameSubmit = async () => {
    if (!productName.trim()) {
      Alert.alert('Error', 'Please enter a product name');
      return;
    }

    if (!pendingPhoto) {
      Alert.alert('Error', 'No photo available');
      return;
    }

    // Prevent duplicate processing
    if (isProcessingRef.current) {
      return;
    }

    const name = productName.trim();
    const imageData = pendingPhoto;
    
    setShowNamePrompt(false);
    setProductName('');
    setIsProcessing(true);
    isProcessingRef.current = true;

    // Create draft item immediately with the user-provided name
    // Set postingStatus to 'idle' for all platforms (user must click Post to actually post)
    const postingStatus = {
      facebook: 'idle' as const,
      ebay: 'idle' as const,
      website: 'idle' as const,
    };
    
    const draftItem = {
      title: name,
      description: 'Generating listing with AI...',
      price: 0,
      condition: 'used' as const,
      category: 'Loading...',
      images: [imageData],
      status: 'unposted' as const,
      platforms: ['facebook', 'ebay', 'website'] as Platform[],
      postingStatus: postingStatus,
    };

    const createdItem = await addItem(draftItem);

    // Process with AI
    try {
      let aiData;
      try {
        // Try real API first
        aiData = useRealApi
          ? await apiService.generateListing(imageData, name)
          : await mockAIService.recognizeItem(imageData);
      } catch (apiError) {
        console.log('API failed, using mock:', apiError);
        aiData = await mockAIService.recognizeItem(imageData);
      }

      // Update the item we just created (preserve postingStatus)
      await updateItem(createdItem.id, {
        title: name, // Use the user-provided name instead of AI recognized item
        description: aiData.description,
        price: aiData.suggestedPrice,
        condition: aiData.condition,
        category: aiData.category,
        status: 'unposted', // Ready to post but not yet posted
        aiData: aiData,
        postingStatus: postingStatus, // Preserve the idle posting status for all platforms
      });

      Alert.alert(
        'Success',
        'Item created and AI analysis complete!',
        [
          {
            text: 'OK',
            onPress: () => router.push('/(tabs)'),
          },
        ]
      );
    } catch (error) {
      console.error('AI processing error:', error);
      Alert.alert('Error', 'Failed to process image with AI');
    } finally {
      setIsProcessing(false);
      setPendingPhoto(null);
      isProcessingRef.current = false;
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing="back"
      >
        <View style={styles.overlay}>
          <View style={styles.captureButtonContainer}>
            <TouchableOpacity
              style={[styles.captureButton, isProcessing && styles.captureButtonDisabled]}
              onPress={handleTakePhoto}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <View style={styles.captureButtonInner} />
              )}
            </TouchableOpacity>
          </View>
          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>
                Generating listing with AI...
              </Text>
              <Text style={styles.processingSubtext}>
                Please wait one moment
              </Text>
            </View>
          )}
        </View>
      </CameraView>

      {/* Product Name Prompt Modal */}
      <Modal
        visible={showNamePrompt}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setShowNamePrompt(false);
          setPendingPhoto(null);
          setProductName('');
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={dynamicStyles.modalContent}>
            <Text style={dynamicStyles.modalTitle}>Enter Product Name</Text>
            <TextInput
              style={dynamicStyles.nameInput}
              placeholder="e.g., iPhone 13 Pro, MacBook Pro, etc."
              value={productName}
              onChangeText={setProductName}
              autoFocus
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowNamePrompt(false);
                  setPendingPhoto(null);
                  setProductName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.submitButton]}
                onPress={handleNameSubmit}
              >
                <Text style={styles.submitButtonText}>Continue</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 40,
  },
  captureButtonContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#000000',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: '#000000',
  },
  processingContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  processingText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  processingSubtext: {
    color: '#ffffff',
    fontSize: 14,
    opacity: 0.8,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: '#ffffff',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 16,
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000000',
    backgroundColor: '#ffffff',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'flex-end',
  },
  modalButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d1d1',
  },
  cancelButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    backgroundColor: '#000000',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

