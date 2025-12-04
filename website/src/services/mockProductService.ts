import { InventoryItem } from '@/types/inventory';

// This would normally fetch from an API, but for now we'll use mock data
// In production, this would filter products that have 'website' in their platforms array
const mockProducts: InventoryItem[] = [
  {
    id: '1',
    title: 'iPhone 13 Pro 256GB - Graphite',
    description: 'Apple iPhone 13 Pro with A15 Bionic chip, 256GB storage, and triple-camera system. Features ProMotion display with 120Hz refresh rate and 5G connectivity. Excellent condition with screen protector applied since day one.',
    price: 699.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    status: 'active',
    platforms: ['facebook', 'ebay', 'website'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    facebookListingId: 'fb_123',
    ebayListingId: 'ebay_123',
  },
  {
    id: '2',
    title: 'MacBook Pro 14" M1 Pro - 512GB',
    description: 'Apple MacBook Pro 14-inch with M1 Pro chip, 16GB unified memory, and 512GB SSD. Features Liquid Retina XDR display with ProMotion technology. Excellent condition, barely used.',
    price: 1499.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
    status: 'active',
    platforms: ['facebook', 'website'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    facebookListingId: 'fb_456',
  },
  {
    id: '3',
    title: 'Fender Stratocaster Electric Guitar',
    description: 'Classic Fender Stratocaster in sunburst finish. Features three single-coil pickups, maple neck, and rosewood fretboard. Excellent condition, professionally set up.',
    price: 799.99,
    condition: 'like_new',
    category: 'Musical Instruments',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'],
    status: 'active',
    platforms: ['ebay', 'website'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ebayListingId: 'ebay_789',
  },
  {
    id: '4',
    title: 'Canon EOS R5 Camera Body',
    description: 'Canon EOS R5 full-frame mirrorless camera body. Features 45MP sensor, 8K video recording, and advanced autofocus system. Excellent condition, low shutter count.',
    price: 3299.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'],
    status: 'active',
    platforms: ['website'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const getProducts = async (): Promise<InventoryItem[]> => {
  // Simulate API call
  return new Promise((resolve) => {
    setTimeout(() => {
      // Only return products that are active and have 'website' in platforms
      const websiteProducts = mockProducts.filter(
        (product) => product.status === 'active' && product.platforms.includes('website')
      );
      resolve(websiteProducts);
    }, 100);
  });
};

export const getProduct = async (id: string): Promise<InventoryItem | null> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const product = mockProducts.find((p) => p.id === id);
      resolve(product && product.platforms.includes('website') ? product : null);
    }, 100);
  });
};

