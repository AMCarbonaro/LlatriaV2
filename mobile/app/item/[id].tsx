import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useInventoryStore } from '@/store/inventoryStore';
import { useThemeStore } from '@/store/themeStore';
import { InventoryItem, Platform } from '@/types/inventory';
import * as ImagePicker from 'expo-image-picker';

export default function ItemDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { items, updateItem, deleteItem, markAsSold } = useInventoryStore();
  const { isDark } = useThemeStore();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [images, setImages] = useState<string[]>([]);
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
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      const foundItem = items.find(i => i.id === id);
      if (foundItem) {
        setItem(foundItem);
        setImages(foundItem.images || []);
        setFormData({
          title: foundItem.title,
          description: foundItem.description,
          price: foundItem.price,
          condition: foundItem.condition,
          category: foundItem.category,
          facebook: {
            title: foundItem.title,
            description: foundItem.description,
            price: foundItem.price,
            location: '',
          },
          ebay: {
            title: foundItem.title,
            description: foundItem.description,
            price: foundItem.price,
            shippingCost: 0,
            shippingMethod: 'standard',
            returnPolicy: '30',
            itemSpecifics: foundItem.aiData?.specifications || {},
          },
          website: {
            title: foundItem.title,
            description: foundItem.description,
            price: foundItem.price,
            seoTitle: foundItem.title,
            seoDescription: foundItem.description.substring(0, 160),
          },
        });
      }
    }
  }, [id, items]);

  const handleSave = async () => {
    if (!item) return;
    setIsSaving(true);
    try {
      await updateItem(item.id, {
        title: formData.title,
        description: formData.description,
        price: formData.price,
        condition: formData.condition as any,
        category: formData.category,
        images: images,
      });
      Alert.alert('Success', 'Changes saved successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePlatform = (platform: Platform) => {
    if (!item || item.status === 'sold') {
      Alert.alert('Error', 'Cannot modify platforms for sold items');
      return;
    }
    
    // Removing platform - clear posting status
    const newPlatforms = item.platforms.filter(p => p !== platform);
    const newPostingStatus = { ...item.postingStatus };
    delete newPostingStatus[platform];
    
    const updatedItem = { ...item, platforms: newPlatforms, postingStatus: newPostingStatus };
    setItem(updatedItem);
    updateItem(item.id, { 
      platforms: newPlatforms,
      postingStatus: newPostingStatus
    });
  };

  const handlePostToPlatform = async (platform: Platform) => {
    if (!item || item.status === 'sold') return;
    
    // Start posting process
    const newPostingStatus = {
      ...item.postingStatus,
      [platform]: 'posting' as const
    };
    
    const updatedItem = { ...item, postingStatus: newPostingStatus };
    setItem(updatedItem);
    await updateItem(item.id, { 
      postingStatus: newPostingStatus
    });
    
    // Simulate posting process (2-3 seconds)
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 1000));
    
    // Update to posted status
    const finalPostingStatus = {
      ...item.postingStatus,
      [platform]: 'posted' as const
    };
    const finalItem = { ...updatedItem, postingStatus: finalPostingStatus };
    setItem(finalItem);
    await updateItem(item.id, { 
      postingStatus: finalPostingStatus
    });
  };

  const handleDelete = () => {
    if (!item) return;
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteItem(item.id);
            router.back();
          },
        },
      ]
    );
  };

  const handleMarkSold = () => {
    if (!item) return;
    Alert.alert(
      'Mark as Sold',
      'Are you sure you want to mark this item as sold?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Sold',
          onPress: async () => {
            await markAsSold(item.id);
            setItem({ ...item, status: 'sold', platforms: [] });
          },
        },
      ]
    );
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets
        .slice(0, 10 - images.length)
        .map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  if (!item) {
    const errorStyles = {
      container: {
        ...styles.container,
        backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
      },
      errorText: {
        ...styles.errorText,
        color: isDark ? '#ffffff' : '#000000',
      },
    };
    return (
      <View style={errorStyles.container}>
        <Text style={errorStyles.errorText}>Item not found</Text>
      </View>
    );
  }

  const isSold = item.status === 'sold';
  // Use item.platforms directly to ensure we always have the latest state
  const hasFacebook = item?.platforms?.includes('facebook') ?? false;
  const hasEbay = item?.platforms?.includes('ebay') ?? false;
  const hasWebsite = item?.platforms?.includes('website') ?? false;

  const getPostingStatus = (platform: Platform): 'idle' | 'posting' | 'posted' | 'error' => {
    if (!item?.postingStatus) return 'idle';
    return item.postingStatus[platform] || 'idle';
  };

  const PostingIndicator: React.FC<{ status: 'idle' | 'posting' | 'posted' | 'error' }> = ({ status }) => {
    if (status === 'idle' || status === 'error') return null;
    
    return (
      <View
        style={{
          width: 8,
          height: 8,
          borderRadius: 4,
          marginLeft: 8,
          backgroundColor: status === 'posted' ? '#22c55e' : '#eab308',
        }}
      />
    );
  };

  const dynamicStyles = {
    container: {
      ...styles.container,
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
    },
    header: {
      ...styles.header,
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
      borderBottomColor: isDark ? '#1a1a1a' : '#e5e5e5',
    },
    headerTitle: {
      ...styles.headerTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    section: {
      ...styles.section,
      backgroundColor: isDark ? '#0a0a0a' : '#ffffff',
    },
    sectionTitle: {
      ...styles.sectionTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    label: {
      ...styles.label,
      color: isDark ? '#ffffff' : '#000000',
    },
    input: {
      ...styles.input,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
      color: isDark ? '#ffffff' : '#000000',
    },
    aiCard: {
      ...styles.aiCard,
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
    },
    aiLabel: {
      ...styles.aiLabel,
      color: isDark ? '#999999' : '#666666',
    },
    aiValue: {
      ...styles.aiValue,
      color: isDark ? '#ffffff' : '#000000',
    },
    platformSection: {
      ...styles.platformSection,
      backgroundColor: isDark ? '#1a1a1a' : '#f9f9f9',
      borderColor: isDark ? '#2a2a2a' : '#e5e5e5',
    },
    outlineButtonText: {
      ...styles.outlineButtonText,
      color: isDark ? '#ffffff' : '#000000',
    },
  };

  return (
    <ScrollView style={dynamicStyles.container}>
      {/* Header */}
      <View style={dynamicStyles.header}>
        <View style={styles.headerContent}>
          {isSold && (
            <View style={styles.soldBadge}>
              <Text style={styles.soldText}>SOLD</Text>
            </View>
          )}
        </View>
        <View style={styles.headerActions}>
          {!isSold && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.saveButton]}
                onPress={handleSave}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.buttonText}>Save</Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.outlineButton]}
                onPress={handleMarkSold}
              >
                <Text style={dynamicStyles.outlineButtonText}>Mark Sold</Text>
              </TouchableOpacity>
            </>
          )}
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Photos Section */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoContainer}>
          {images.map((image, index) => (
            <View key={index} style={styles.photoWrapper}>
              <Image source={{ uri: image }} style={styles.photo} />
              <TouchableOpacity
                style={styles.removePhotoButton}
                onPress={() => removeImage(index)}
              >
                <Text style={styles.removePhotoText}>×</Text>
              </TouchableOpacity>
              {index === 0 && (
                <View style={styles.primaryBadge}>
                  <Text style={styles.primaryText}>Primary</Text>
                </View>
              )}
            </View>
          ))}
          {images.length < 10 && (
            <TouchableOpacity style={styles.addPhotoButton} onPress={pickImage}>
              <Text style={styles.addPhotoText}>+ Add Photo</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>

      {/* AI Generated Data Section */}
      {item.aiData && (
        <View style={dynamicStyles.section}>
          <View style={styles.sectionHeader}>
            <Text style={dynamicStyles.sectionTitle}>✨ AI Generated Data</Text>
          </View>
          <View style={dynamicStyles.aiCard}>
            <View style={styles.aiRow}>
              <Text style={dynamicStyles.aiLabel}>Recognized Item:</Text>
              <Text style={dynamicStyles.aiValue}>{item.aiData.recognizedItem}</Text>
            </View>
            <View style={styles.aiRow}>
              <Text style={dynamicStyles.aiLabel}>Confidence:</Text>
              <Text style={dynamicStyles.aiValue}>
                {Math.round(item.aiData.confidence * 100)}%
              </Text>
            </View>
            <View style={styles.aiRow}>
              <Text style={dynamicStyles.aiLabel}>Market Price:</Text>
              <Text style={dynamicStyles.aiValue}>${item.aiData.marketPrice.toFixed(2)}</Text>
            </View>
            <View style={styles.aiRow}>
              <Text style={dynamicStyles.aiLabel}>Suggested Price:</Text>
              <Text style={[dynamicStyles.aiValue, styles.suggestedPrice]}>
                ${item.aiData.suggestedPrice.toFixed(2)}
              </Text>
            </View>
            {item.aiData.researchNotes && (
              <View style={styles.aiNotes}>
                <Text style={[styles.aiNotesText, { color: isDark ? '#999999' : '#666666' }]}>{item.aiData.researchNotes}</Text>
              </View>
            )}
          </View>
        </View>
      )}

      {/* Base Listing Information */}
      <View style={dynamicStyles.section}>
        <Text style={dynamicStyles.sectionTitle}>AI Generated Listing Information</Text>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Title</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.title}
            onChangeText={(text) => setFormData({ ...formData, title: text })}
            placeholder="Item title"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Price</Text>
            <TextInput
              style={dynamicStyles.input}
              value={formData.price.toString()}
              onChangeText={(text) => setFormData({ ...formData, price: parseFloat(text) || 0 })}
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Condition</Text>
            <View style={[styles.select, { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5', borderColor: isDark ? '#2a2a2a' : '#e5e5e5' }]}>
              <Text style={[styles.selectText, { color: isDark ? '#ffffff' : '#000000' }]}>{formData.condition.replace('_', ' ')}</Text>
            </View>
          </View>
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[dynamicStyles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData({ ...formData, description: text })}
            multiline
            numberOfLines={6}
            placeholder="Item description"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Category</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.category}
            onChangeText={(text) => setFormData({ ...formData, category: text })}
            placeholder="Category"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
      </View>

      {/* Facebook Marketplace Section */}
      <View style={dynamicStyles.section}>
        <View style={styles.platformHeader}>
          <View style={styles.platformHeaderLeft}>
            <Text style={styles.platformEmoji}>📘</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.sectionTitle}>Facebook Marketplace</Text>
              <PostingIndicator status={getPostingStatus('facebook')} />
            </View>
          </View>
          {hasFacebook && (
            <TouchableOpacity
              style={[
                styles.platformButton,
                getPostingStatus('facebook') === 'posted' ? styles.removeButton : styles.postButton,
              ]}
              onPress={() => {
                if (getPostingStatus('facebook') === 'posted') {
                  handleRemovePlatform('facebook');
                } else {
                  handlePostToPlatform('facebook');
                }
              }}
              disabled={isSold || getPostingStatus('facebook') === 'posting'}
              activeOpacity={0.7}
            >
              {getPostingStatus('facebook') === 'posting' ? (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Posting...
                </Text>
              ) : getPostingStatus('facebook') === 'posted' ? (
                <Text style={[styles.platformButtonText, { color: '#ef4444' }]}>
                  Remove
                </Text>
              ) : (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Title</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.facebook.title}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                facebook: { ...formData.facebook, title: text },
              })
            }
            placeholder="Facebook listing title"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[dynamicStyles.input, styles.textArea]}
            value={formData.facebook.description}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                facebook: { ...formData.facebook, description: text },
              })
            }
            multiline
            numberOfLines={4}
            placeholder="Facebook listing description"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Price</Text>
            <TextInput
              style={dynamicStyles.input}
              value={formData.facebook.price.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  facebook: { ...formData.facebook, price: parseFloat(text) || 0 },
                })
              }
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Location</Text>
            <TextInput
              style={dynamicStyles.input}
              value={formData.facebook.location}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  facebook: { ...formData.facebook, location: text },
                })
              }
              placeholder="City, State or ZIP"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
        </View>
      </View>

      {/* eBay Section */}
      <View style={dynamicStyles.section}>
        <View style={styles.platformHeader}>
          <View style={styles.platformHeaderLeft}>
            <Text style={styles.platformEmoji}>🛒</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.sectionTitle}>eBay Listing</Text>
              <PostingIndicator status={getPostingStatus('ebay')} />
            </View>
          </View>
          {hasEbay && (
            <TouchableOpacity
              style={[
                styles.platformButton,
                getPostingStatus('ebay') === 'posted' ? styles.removeButton : styles.postButton,
              ]}
              onPress={() => {
                if (getPostingStatus('ebay') === 'posted') {
                  handleRemovePlatform('ebay');
                } else {
                  handlePostToPlatform('ebay');
                }
              }}
              disabled={isSold || getPostingStatus('ebay') === 'posting'}
              activeOpacity={0.7}
            >
              {getPostingStatus('ebay') === 'posting' ? (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Posting...
                </Text>
              ) : getPostingStatus('ebay') === 'posted' ? (
                <Text style={[styles.platformButtonText, { color: '#ef4444' }]}>
                  Remove
                </Text>
              ) : (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Title</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.ebay.title}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                ebay: { ...formData.ebay, title: text },
              })
            }
            placeholder="eBay listing title"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[dynamicStyles.input, styles.textArea]}
            value={formData.ebay.description}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                ebay: { ...formData.ebay, description: text },
              })
            }
            multiline
            numberOfLines={6}
            placeholder="eBay listing description"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formRow}>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Price</Text>
            <TextInput
              style={dynamicStyles.input}
              value={formData.ebay.price.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  ebay: { ...formData.ebay, price: parseFloat(text) || 0 },
                })
              }
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
          <View style={[styles.formGroup, styles.formGroupHalf]}>
            <Text style={dynamicStyles.label}>Shipping Cost</Text>
            <TextInput
              style={dynamicStyles.input}
              value={formData.ebay.shippingCost.toString()}
              onChangeText={(text) =>
                setFormData({
                  ...formData,
                  ebay: { ...formData.ebay, shippingCost: parseFloat(text) || 0 },
                })
              }
              keyboardType="numeric"
              placeholder="0.00"
              placeholderTextColor={isDark ? '#666666' : '#999999'}
            />
          </View>
        </View>
        {item.aiData?.specifications && Object.keys(item.aiData.specifications).length > 0 && (
          <View style={styles.formGroup}>
            <Text style={dynamicStyles.label}>Item Specifics</Text>
            {Object.entries(item.aiData.specifications).map(([key, value]) => (
              <View key={key} style={styles.formGroup}>
                <Text style={[styles.sublabel, { color: isDark ? '#999999' : '#666666' }]}>{key}</Text>
                <TextInput
                  style={dynamicStyles.input}
                  value={formData.ebay.itemSpecifics[key] || value}
                  onChangeText={(text) =>
                    setFormData({
                      ...formData,
                      ebay: {
                        ...formData.ebay,
                        itemSpecifics: {
                          ...formData.ebay.itemSpecifics,
                          [key]: text,
                        },
                      },
                    })
                  }
                  placeholder={value}
                  placeholderTextColor={isDark ? '#666666' : '#999999'}
                />
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Website Section */}
      <View style={dynamicStyles.section}>
        <View style={styles.platformHeader}>
          <View style={styles.platformHeaderLeft}>
            <Text style={styles.platformEmoji}>🌐</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={dynamicStyles.sectionTitle}>Your Website</Text>
              <PostingIndicator status={getPostingStatus('website')} />
            </View>
          </View>
          {hasWebsite && (
            <TouchableOpacity
              style={[
                styles.platformButton,
                getPostingStatus('website') === 'posted' ? styles.removeButton : styles.postButton,
              ]}
              onPress={() => {
                if (getPostingStatus('website') === 'posted') {
                  handleRemovePlatform('website');
                } else {
                  handlePostToPlatform('website');
                }
              }}
              disabled={isSold || getPostingStatus('website') === 'posting'}
              activeOpacity={0.7}
            >
              {getPostingStatus('website') === 'posting' ? (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Posting...
                </Text>
              ) : getPostingStatus('website') === 'posted' ? (
                <Text style={[styles.platformButtonText, { color: '#ef4444' }]}>
                  Remove
                </Text>
              ) : (
                <Text style={[styles.platformButtonText, { color: '#ffffff' }]}>
                  Post
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Title</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.website.title}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                website: { ...formData.website, title: text },
              })
            }
            placeholder="Website listing title"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Description</Text>
          <TextInput
            style={[dynamicStyles.input, styles.textArea]}
            value={formData.website.description}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                website: { ...formData.website, description: text },
              })
            }
            multiline
            numberOfLines={4}
            placeholder="Website listing description"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            textAlignVertical="top"
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>Price</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.website.price.toString()}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                website: { ...formData.website, price: parseFloat(text) || 0 },
              })
            }
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>SEO Title</Text>
          <TextInput
            style={dynamicStyles.input}
            value={formData.website.seoTitle}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                website: { ...formData.website, seoTitle: text },
              })
            }
            placeholder="Optimized title for search engines"
            placeholderTextColor={isDark ? '#666666' : '#999999'}
          />
        </View>
        <View style={styles.formGroup}>
          <Text style={dynamicStyles.label}>
            SEO Description ({formData.website.seoDescription.length}/160)
          </Text>
          <TextInput
            style={[dynamicStyles.input, styles.textArea]}
            value={formData.website.seoDescription}
            onChangeText={(text) =>
              setFormData({
                ...formData,
                website: { ...formData.website, seoDescription: text },
              })
            }
            multiline
            numberOfLines={3}
            placeholder="Meta description (150-160 characters)"
            textAlignVertical="top"
            maxLength={160}
          />
        </View>
      </View>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
    backgroundColor: '#ffffff',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  soldBadge: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  soldText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
  },
  saveButton: {
    backgroundColor: '#000000',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
  },
  deleteButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 14,
  },
  outlineButtonText: {
    color: '#000000',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButtonText: {
    color: '#ef4444',
    fontWeight: '600',
    fontSize: 14,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 12,
  },
  photoContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  photoWrapper: {
    marginRight: 12,
    position: 'relative',
  },
  photo: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  removePhotoButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  primaryBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: '#000000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  primaryText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  addPhotoButton: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#d1d1d1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f9f9f9',
  },
  addPhotoText: {
    color: '#666666',
    fontSize: 12,
  },
  aiCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  aiLabel: {
    fontSize: 14,
    color: '#666666',
  },
  aiValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  suggestedPrice: {
    color: '#000000',
  },
  aiNotes: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  aiNotesText: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 18,
  },
  formGroup: {
    marginBottom: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  formGroupHalf: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 6,
  },
  sublabel: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#000000',
    backgroundColor: '#ffffff',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  select: {
    borderWidth: 1,
    borderColor: '#d1d1d1',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#ffffff',
  },
  selectText: {
    fontSize: 14,
    color: '#000000',
  },
  platformHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  platformHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  platformButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  postButton: {
    backgroundColor: '#000000',
  },
  removeButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  platformButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginTop: 40,
  },
  bottomSpacer: {
    height: 40,
  },
  platformSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginBottom: 12,
  },
});
