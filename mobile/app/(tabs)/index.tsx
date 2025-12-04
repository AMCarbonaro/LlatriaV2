import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  RefreshControl,
  TextInput,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Search, Filter, ArrowUpDown, X } from 'lucide-react-native';
import { useInventoryStore } from '@/store/inventoryStore';
import { useThemeStore } from '@/store/themeStore';
import { useToastStore } from '@/store/toastStore';
import { InventoryItem, Platform, ItemStatus } from '@/types/inventory';

export default function InventoryScreen() {
  const router = useRouter();
  const { 
    filteredItems, 
    loadInventory, 
    isLoading,
    searchQuery,
    statusFilter,
    selectedPlatforms,
    categoryFilter,
    selectedCategories,
    sortBy,
    sortOrder,
    setSearchQuery,
    setStatusFilter,
    togglePlatform,
    setCategoryFilter,
    toggleCategory,
    setSortBy,
    setSortOrder,
  } = useInventoryStore();
  const { isDark } = useThemeStore();
  const addToast = useToastStore((state) => state.addToast);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadInventory();
    setRefreshing(false);
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
    headerSubtitle: {
      ...styles.headerSubtitle,
      color: isDark ? '#999999' : '#666666',
    },
    itemCard: {
      ...styles.itemCard,
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
    },
    itemTitle: {
      ...styles.itemTitle,
      color: isDark ? '#ffffff' : '#000000',
    },
    itemPrice: {
      ...styles.itemPrice,
      color: isDark ? '#ffffff' : '#000000',
    },
    itemCategory: {
      ...styles.itemCategory,
      color: isDark ? '#999999' : '#666666',
    },
    itemImage: {
      ...styles.itemImage,
      backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
    },
    emptyText: {
      ...styles.emptyText,
      color: isDark ? '#999999' : '#666666',
    },
    emptySubtext: {
      ...styles.emptySubtext,
      color: isDark ? '#666666' : '#999999',
    },
  };

  const renderItem = ({ item }: { item: InventoryItem }) => (
    <TouchableOpacity
      style={dynamicStyles.itemCard}
      onPress={() => router.push(`/item/${item.id}`)}
    >
      <Image
        source={{ uri: item.images[0] || 'https://via.placeholder.com/100' }}
        style={dynamicStyles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={dynamicStyles.itemTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={dynamicStyles.itemPrice}>${item.price.toFixed(2)}</Text>
        <Text style={dynamicStyles.itemCategory}>{item.category}</Text>
        <View style={styles.bottomRow}>
          {(() => {
            // Only show icons for platforms that have been posted
            const postedPlatforms = item.platforms.filter(platform => 
              item.postingStatus?.[platform] === 'posted'
            );
            
            return postedPlatforms.length > 0 ? (
              <View style={styles.platformIconsContainer}>
                {postedPlatforms.map((platform) => (
                  <Text key={platform} style={styles.platformIcon}>
                    {platform === 'facebook' ? '📘' : platform === 'ebay' ? '🛒' : '🌐'}
                  </Text>
                ))}
              </View>
            ) : (
              <View />
            );
          })()}
          <View style={styles.badgeContainer}>
            {item.status === 'sold' && (
              <View style={[
                styles.postingBadgeIndicator,
                { 
                  backgroundColor: isDark ? '#7f1d1d' : '#fee2e2',
                }
              ]}>
                <Text style={[
                  styles.postingBadgeIndicatorText,
                  { color: isDark ? '#fca5a5' : '#991b1b' }
                ]}>SOLD</Text>
              </View>
            )}
            {item.status !== 'sold' && (() => {
              // Determine overall posting status
              const hasPosting = item.platforms.some(platform => 
                item.postingStatus?.[platform] === 'posting'
              );
              const allPosted = item.platforms.length > 0 && item.platforms.every(platform => 
                item.postingStatus?.[platform] === 'posted'
              );
              
              if (hasPosting) {
                return (
                  <View style={[
                    styles.postingBadgeIndicator,
                    { 
                      backgroundColor: isDark ? '#78350f' : '#fef3c7',
                    }
                  ]}>
                    <Text style={[
                      styles.postingBadgeIndicatorText,
                      { color: isDark ? '#fcd34d' : '#92400e' }
                    ]}>POSTING</Text>
                  </View>
                );
              }
              if (allPosted) {
                return (
                  <View style={[
                    styles.postingBadgeIndicator,
                    { 
                      backgroundColor: isDark ? '#14532d' : '#dcfce7',
                    }
                  ]}>
                    <Text style={[
                      styles.postingBadgeIndicatorText,
                      { color: isDark ? '#86efac' : '#166534' }
                    ]}>POSTED</Text>
                  </View>
                );
              }
              return null;
            })()}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const categories = ['All', 'Electronics', 'Jewelry', 'Tools', 'Musical Instruments'];
  
  const sortOptions = [
    { value: 'date' as const, label: 'Date' },
    { value: 'price' as const, label: 'Price' },
    { value: 'name' as const, label: 'Name' },
    { value: 'status' as const, label: 'Status' },
    { value: 'category' as const, label: 'Category' },
  ];

  const hasActiveFilters = 
    searchQuery.length > 0 ||
    statusFilter !== 'all' ||
    selectedPlatforms.length > 0 ||
    categoryFilter !== 'all' ||
    selectedCategories.length > 0;

  const clearAllFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('all');
    // Clear platform and category selections
    selectedPlatforms.forEach(p => togglePlatform(p));
    selectedCategories.forEach(c => toggleCategory(c));
    addToast({ type: 'info', message: 'Filters cleared' });
  };

  return (
    <View style={dynamicStyles.container}>
      <View style={dynamicStyles.header}>
        <Text style={dynamicStyles.headerTitle}>Inventory</Text>
        <Text style={dynamicStyles.headerSubtitle}>
          {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'}
        </Text>
        
        {/* Search Bar */}
        <View style={[
          styles.searchContainer,
          { backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5' }
        ]}>
          <Search size={20} color={isDark ? '#999999' : '#666666'} style={styles.searchIcon} />
          <TextInput
            style={[
              styles.searchInput,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}
            placeholder="Search inventory..."
            placeholderTextColor={isDark ? '#666666' : '#999999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <X size={20} color={isDark ? '#999999' : '#666666'} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter and Sort Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: hasActiveFilters 
                  ? (isDark ? '#3b82f6' : '#2563eb')
                  : (isDark ? '#1a1a1a' : '#f5f5f5'),
                borderColor: isDark ? '#3a3a3a' : '#e5e5e5',
              }
            ]}
            onPress={() => setShowFilterModal(true)}
          >
            <Filter size={18} color={hasActiveFilters ? '#ffffff' : (isDark ? '#ffffff' : '#000000')} />
            <Text style={[
              styles.actionButtonText,
              {
                color: hasActiveFilters ? '#ffffff' : (isDark ? '#ffffff' : '#000000'),
              }
            ]}>
              Filters {hasActiveFilters && `(${selectedPlatforms.length + (statusFilter !== 'all' ? 1 : 0) + (categoryFilter !== 'all' || selectedCategories.length > 0 ? 1 : 0)})`}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.actionButton,
              {
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                borderColor: isDark ? '#3a3a3a' : '#e5e5e5',
              }
            ]}
            onPress={() => setShowSortModal(true)}
          >
            <ArrowUpDown size={18} color={isDark ? '#ffffff' : '#000000'} />
            <Text style={[
              styles.actionButtonText,
              { color: isDark ? '#ffffff' : '#000000' }
            ]}>
              Sort
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={isDark ? '#ffffff' : '#000000'}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={dynamicStyles.emptyText}>No items found</Text>
            <Text style={dynamicStyles.emptySubtext}>
              {hasActiveFilters 
                ? 'Try adjusting your filters'
                : 'Tap the camera tab to add your first item'}
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}
                onPress={clearAllFilters}
              >
                <Text style={styles.clearButtonText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        }
      />

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowFilterModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? '#3a3a3a' : '#e5e5e5' }
            ]}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Filters
              </Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <X size={24} color={isDark ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Status Filter */}
              <View style={styles.filterSection}>
                <Text style={[
                  styles.filterLabel,
                  { color: isDark ? '#999999' : '#666666' }
                ]}>
                  Status
                </Text>
                <View style={styles.filterButtons}>
                  {(['all', 'active', 'sold'] as const).map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterButton,
                        statusFilter === status && {
                          backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                        },
                        { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                      ]}
                      onPress={() => setStatusFilter(status)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        {
                          color: statusFilter === status
                            ? '#ffffff'
                            : (isDark ? '#ffffff' : '#000000'),
                        }
                      ]}>
                        {status === 'all' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Platform Filter */}
              <View style={styles.filterSection}>
                <Text style={[
                  styles.filterLabel,
                  { color: isDark ? '#999999' : '#666666' }
                ]}>
                  Platform (Posted)
                </Text>
                <View style={styles.filterButtons}>
                  {(['facebook', 'ebay', 'website'] as Platform[]).map((platform) => {
                    const isSelected = selectedPlatforms.includes(platform);
                    return (
                      <TouchableOpacity
                        key={platform}
                        style={[
                          styles.filterButton,
                          isSelected && {
                            backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                          },
                          { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                        ]}
                        onPress={() => togglePlatform(platform)}
                      >
                        <Text style={[
                          styles.filterButtonText,
                          {
                            color: isSelected
                              ? '#ffffff'
                              : (isDark ? '#ffffff' : '#000000'),
                          }
                        ]}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={[
                  styles.filterLabel,
                  { color: isDark ? '#999999' : '#666666' }
                ]}>
                  Category
                </Text>
                {categories.map((cat) => {
                  const catValue = cat === 'All' ? 'all' : cat;
                  const isSelected = categoryFilter === catValue || selectedCategories.includes(cat);
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryOption,
                        { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                      ]}
                      onPress={() => {
                        if (cat === 'All') {
                          setCategoryFilter('all');
                          selectedCategories.forEach(c => toggleCategory(c));
                        } else {
                          toggleCategory(cat);
                        }
                      }}
                    >
                      <View style={[
                        styles.checkbox,
                        isSelected && { backgroundColor: isDark ? '#3b82f6' : '#2563eb' },
                        { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                      ]}>
                        {isSelected && (
                          <Text style={styles.checkmark}>✓</Text>
                        )}
                      </View>
                      <Text style={[
                        styles.categoryText,
                        { color: isDark ? '#ffffff' : '#000000' }
                      ]}>
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>

            <View style={[
              styles.modalFooter,
              { borderTopColor: isDark ? '#3a3a3a' : '#e5e5e5' }
            ]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5' }]}
                onPress={clearAllFilters}
              >
                <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Clear All</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}
                onPress={() => setShowFilterModal(false)}
              >
                <Text style={{ color: '#ffffff' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowSortModal(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setShowSortModal(false)}
        >
          <Pressable
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1a1a1a' : '#ffffff' }
            ]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[
              styles.modalHeader,
              { borderBottomColor: isDark ? '#3a3a3a' : '#e5e5e5' }
            ]}>
              <Text style={[
                styles.modalTitle,
                { color: isDark ? '#ffffff' : '#000000' }
              ]}>
                Sort By
              </Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <X size={24} color={isDark ? '#ffffff' : '#000000'} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {sortOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.sortOption,
                    { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                  ]}
                  onPress={() => setSortBy(option.value)}
                >
                  <Text style={[
                    styles.sortOptionText,
                    { color: isDark ? '#ffffff' : '#000000' }
                  ]}>
                    {option.label}
                  </Text>
                  {sortBy === option.value && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}

              <View style={styles.sortOrderSection}>
                <Text style={[
                  styles.filterLabel,
                  { color: isDark ? '#999999' : '#666666' }
                ]}>
                  Order
                </Text>
                <View style={styles.filterButtons}>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      sortOrder === 'asc' && {
                        backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                      },
                      { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                    ]}
                    onPress={() => setSortOrder('asc')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      {
                        color: sortOrder === 'asc'
                          ? '#ffffff'
                          : (isDark ? '#ffffff' : '#000000'),
                      }
                    ]}>
                      Ascending ↑
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      sortOrder === 'desc' && {
                        backgroundColor: isDark ? '#3b82f6' : '#2563eb',
                      },
                      { borderColor: isDark ? '#3a3a3a' : '#e5e5e5' }
                    ]}
                    onPress={() => setSortOrder('desc')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      {
                        color: sortOrder === 'desc'
                          ? '#ffffff'
                          : (isDark ? '#ffffff' : '#000000'),
                      }
                    ]}>
                      Descending ↓
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            <View style={[
              styles.modalFooter,
              { borderTopColor: isDark ? '#3a3a3a' : '#e5e5e5' }
            ]}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: isDark ? '#3b82f6' : '#2563eb' }]}
                onPress={() => setShowSortModal(false)}
              >
                <Text style={{ color: '#ffffff' }}>Done</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginTop: 4,
  },
  list: {
    padding: 16,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#666666',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  platformIconsContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  platformIcon: {
    fontSize: 16,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postingBadgeIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  postingBadgeIndicatorText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999999',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  searchIcon: {
    marginRight: 4,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  clearButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
    maxHeight: 500,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e5e5',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterSection: {
    marginBottom: 24,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 12,
    textTransform: 'uppercase',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  categoryText: {
    fontSize: 16,
  },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  sortOptionText: {
    fontSize: 16,
    fontWeight: '500',
  },
  sortOrderSection: {
    marginTop: 24,
  },
});

