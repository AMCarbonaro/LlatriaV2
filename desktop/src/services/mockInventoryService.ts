import { InventoryItem, ItemStatus, ItemCondition, Platform } from '@/types/inventory';
import { storageService } from './storageService';

const generateId = () => Math.random().toString(36).substring(2, 15);

const mockItems: InventoryItem[] = [
  {
    id: generateId(),
    title: 'iPhone 13 Pro 256GB - Graphite',
    description: 'Apple iPhone 13 Pro with A15 Bionic chip, 256GB storage, and triple-camera system. Features ProMotion display with 120Hz refresh rate and 5G connectivity. Excellent condition with screen protector applied since day one.',
    price: 699.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400'],
    status: 'active',
    platforms: ['facebook', 'ebay', 'website'],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      facebook: 'posted',
      ebay: 'posted',
      website: 'posted',
    },
    aiData: {
      recognizedItem: 'iPhone 13 Pro',
      confidence: 0.95,
      marketPrice: 749.99,
      suggestedPrice: 699.99,
      description: 'Apple iPhone 13 Pro with A15 Bionic chip, 256GB storage, and triple-camera system. Features ProMotion display with 120Hz refresh rate and 5G connectivity. Excellent condition with screen protector applied since day one.',
      category: 'Electronics',
      condition: 'like_new',
      brand: 'Apple',
      model: 'iPhone 13 Pro',
      year: 2021,
      color: 'Graphite',
      operatingSystem: 'iOS 17',
      processor: 'A15 Bionic',
      ram: '6GB',
      storage: '256GB',
      screenSize: '6.1 inches',
      resolution: '2532 x 1170 pixels',
      batteryLife: 'Up to 22 hours video playback',
      dimensions: {
        length: '5.78 inches',
        width: '2.82 inches',
        height: '0.30 inches',
        weight: '7.19 ounces',
      },
      specifications: {
        'Display Technology': 'Super Retina XDR with ProMotion',
        'Refresh Rate': '120Hz',
        'Camera System': 'Triple 12MP (Wide, Ultra Wide, Telephoto)',
        'Video Recording': '4K at 60fps',
        'Front Camera': '12MP TrueDepth',
        'Cellular': '5G (sub-6GHz and mmWave)',
        'Wireless Charging': 'MagSafe and Qi',
        'Water Resistance': 'IP68 (6 meters, 30 minutes)',
        'Face ID': 'Yes',
        'Battery Capacity': '3095 mAh',
        'Charging': 'Lightning port, MagSafe, Qi',
      },
      similarItems: [
        { title: 'iPhone 13 Pro 256GB Graphite', price: 729.99, platform: 'Facebook' },
        { title: 'iPhone 13 Pro 256GB Unlocked', price: 749.99, platform: 'eBay' },
        { title: 'Apple iPhone 13 Pro 256GB', price: 699.99, platform: 'Website' },
      ],
      researchNotes: 'Market research of 20+ listings shows iPhone 13 Pro 256GB typically sells for $680-$780. This unit is priced competitively given excellent condition and included accessories.',
    },
  },
  {
    id: generateId(),
    title: 'MacBook Pro 14" M1 Pro - 512GB',
    description: 'Apple MacBook Pro 14-inch with M1 Pro chip, 16GB unified memory, and 512GB SSD. Features Liquid Retina XDR display with ProMotion technology. Excellent condition, barely used.',
    price: 1499.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400'],
    status: 'active',
    platforms: ['facebook', 'website'],
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      facebook: 'posting',
      website: 'posted',
    },
    aiData: {
      recognizedItem: 'MacBook Pro 14"',
      confidence: 0.92,
      marketPrice: 1599.99,
      suggestedPrice: 1499.99,
      description: 'Apple MacBook Pro 14-inch with M1 Pro chip, 16GB unified memory, and 512GB SSD. Features Liquid Retina XDR display with ProMotion technology. Excellent condition, barely used.',
      category: 'Electronics',
      condition: 'like_new',
      brand: 'Apple',
      model: 'MacBook Pro 14"',
      year: 2021,
      color: 'Space Gray',
      operatingSystem: 'macOS Monterey',
      processor: 'Apple M1 Pro',
      ram: '16GB Unified Memory',
      storage: '512GB SSD',
      screenSize: '14.2 inches',
      resolution: '3024 x 1964 pixels',
      batteryLife: 'Up to 17 hours',
      dimensions: {
        length: '12.31 inches',
        width: '8.71 inches',
        height: '0.61 inches',
        weight: '3.5 pounds',
      },
      specifications: {
        'Chip': 'Apple M1 Pro',
        'CPU Cores': '8-core (6 performance + 2 efficiency)',
        'GPU Cores': '14-core',
        'Neural Engine': '16-core',
        'Display Technology': 'Liquid Retina XDR with ProMotion',
        'Ports': '3x Thunderbolt 4, HDMI, SDXC, MagSafe 3',
        'Wireless': 'Wi-Fi 6, Bluetooth 5.0',
        'Camera': '1080p FaceTime HD',
        'Audio': 'Six-speaker sound system',
      },
      similarItems: [
        { title: 'MacBook Pro 14" M1 Pro 16GB/512GB', price: 1549.99, platform: 'eBay' },
        { title: 'MacBook Pro 14" 512GB Space Gray', price: 1499.99, platform: 'Facebook' },
        { title: 'Apple MacBook Pro 14" M1 Pro', price: 1599.99, platform: 'Website' },
      ],
      researchNotes: 'Based on research of 15+ similar listings, this model typically sells for $1,450-$1,650 in like-new condition. The M1 Pro chip and 16GB RAM make this a high-demand configuration.',
    },
  },
  {
    id: generateId(),
    title: 'Rolex Submariner Watch - Vintage',
    description: 'Authentic vintage Rolex Submariner dive watch. Classic design with rotating bezel. Recently serviced and keeping excellent time. Some wear on bracelet but case is in great condition.',
    price: 8999.99,
    condition: 'used',
    category: 'Jewelry',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400'],
    status: 'active',
    platforms: ['ebay', 'website'],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      ebay: 'posting',
      website: 'posted',
    },
    aiData: {
      recognizedItem: 'Rolex Submariner',
      confidence: 0.88,
      marketPrice: 9500.00,
      suggestedPrice: 8999.99,
      description: 'Vintage Rolex Submariner dive watch. Classic design with rotating bezel. Recently serviced and keeping excellent time.',
      category: 'Jewelry',
      condition: 'used',
      brand: 'Rolex',
      model: 'Submariner',
      year: 1985,
      color: 'Stainless Steel',
      dimensions: {
        diameter: '40mm',
        thickness: '13mm',
        weight: '155g',
      },
      specifications: {
        'Model': 'Submariner',
        'Material': 'Stainless Steel',
        'Movement': 'Automatic',
        'Water Resistance': '300m',
        'Bezel': 'Unidirectional Rotating',
        'Crystal': 'Sapphire',
        'Bracelet': 'Oyster',
        'Clasp': 'Folding Oysterlock',
        'Dial': 'Black',
        'Luminescence': 'Chromalight',
      },
      similarItems: [
        { title: 'Rolex Submariner Vintage', price: 9200.00, platform: 'eBay' },
        { title: 'Rolex Submariner', price: 9500.00, platform: 'Website' },
      ],
      researchNotes: 'Vintage Rolex Submariners from the 1980s typically sell for $8,500-$10,000 depending on condition and service history. This piece has been recently serviced which adds value.',
    },
  },
  {
    id: generateId(),
    title: 'Dewalt 20V Cordless Drill Set',
    description: 'Complete Dewalt drill set with battery, charger, and case. Includes multiple drill bits and driver bits. Used but in excellent working condition.',
    price: 149.99,
    condition: 'used',
    category: 'Tools',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
    status: 'active',
    platforms: ['facebook', 'ebay', 'website'],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      facebook: 'posting',
      ebay: 'posted',
      website: 'posting',
    },
    aiData: {
      recognizedItem: 'Power Drill',
      confidence: 0.85,
      marketPrice: 159.99,
      suggestedPrice: 149.99,
      description: 'Cordless power drill with battery and charger. Includes multiple drill bits and driver bits. Professional grade tool.',
      category: 'Tools',
      condition: 'used',
      brand: 'Dewalt',
      model: 'DCD771C2',
      year: 2020,
      color: 'Yellow/Black',
      powerSource: 'Cordless',
      voltage: '20V',
      dimensions: {
        length: '7.8 inches',
        width: '3.4 inches',
        height: '9.1 inches',
        weight: '3.6 pounds',
      },
      specifications: {
        'Brand': 'Dewalt',
        'Voltage': '20V',
        'Type': 'Cordless',
        'Chuck Size': '1/2 inch',
        'Max Torque': '300 UWO',
        'Speed': '0-450 / 0-1,500 RPM',
        'Battery': '2x 20V MAX Batteries',
        'Charger': 'Included',
        'Includes': 'Battery, Charger, Case, Drill Bits',
        'Warranty': '3 Year Limited',
      },
      similarItems: [
        { title: 'Dewalt 20V Drill Set', price: 149.99, platform: 'Facebook' },
        { title: 'Cordless Drill Kit', price: 159.99, platform: 'eBay' },
      ],
      researchNotes: 'Dewalt 20V drill sets typically sell for $140-$170 used. This set includes batteries and charger which adds significant value.',
    },
  },
  {
    id: generateId(),
    title: 'Fender Stratocaster Electric Guitar',
    description: 'Classic Fender Stratocaster electric guitar in sunburst finish. Includes hard case. Some minor cosmetic wear but excellent playability. All electronics working perfectly.',
    price: 599.99,
    condition: 'used',
    category: 'Musical Instruments',
    images: ['https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400'],
    status: 'sold',
    platforms: [],
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    aiData: {
      recognizedItem: 'Fender Stratocaster',
      confidence: 0.90,
      marketPrice: 649.99,
      suggestedPrice: 599.99,
      description: 'Classic Fender Stratocaster electric guitar in sunburst finish. Includes hard case. Some minor cosmetic wear but excellent playability. All electronics working perfectly.',
      category: 'Musical Instruments',
      condition: 'used',
      brand: 'Fender',
      model: 'Stratocaster',
      year: 2015,
      color: 'Sunburst',
      instrumentType: 'Electric Guitar',
      numberOfStrings: 6,
      finish: '3-Color Sunburst',
      dimensions: {
        length: '40.5 inches',
        width: '12.5 inches',
        height: '1.75 inches',
        weight: '8.0 pounds',
      },
      specifications: {
        'Body Wood': 'Alder',
        'Neck Wood': 'Maple',
        'Fretboard': 'Maple',
        'Frets': '21',
        'Pickups': '3x Single-Coil',
        'Pickup Configuration': 'SSS',
        'Bridge': 'Synchronized Tremolo',
        'Tuners': 'Fender Standard',
        'Scale Length': '25.5 inches',
        'Neck Radius': '9.5 inches',
        'Includes': 'Hard Shell Case',
        'Serial Number': 'Present',
      },
      similarItems: [
        { title: 'Fender Stratocaster Sunburst 2015', price: 599.99, platform: 'Facebook' },
        { title: 'Fender Strat Electric Guitar w/ Case', price: 649.99, platform: 'eBay' },
        { title: 'Fender Stratocaster Used', price: 625.00, platform: 'Website' },
      ],
      researchNotes: 'Research shows similar Fender Stratocasters from 2010-2020 typically sell for $550-$700. This model with hard case is on the higher end due to included accessories.',
    },
  },
  {
    id: generateId(),
    title: 'Canon EOS R5 Camera Body',
    description: 'Canon EOS R5 full-frame mirrorless camera body. Features 45MP sensor, 8K video recording, and advanced autofocus system. Excellent condition, low shutter count. Includes original box and accessories.',
    price: 3299.99,
    condition: 'like_new',
    category: 'Electronics',
    images: ['https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?w=400'],
    status: 'active',
    platforms: ['ebay', 'website'],
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      ebay: 'posted',
      website: 'posting',
    },
    aiData: {
      recognizedItem: 'Canon EOS R5',
      confidence: 0.93,
      marketPrice: 3399.99,
      suggestedPrice: 3299.99,
      description: 'Canon EOS R5 full-frame mirrorless camera body. Features 45MP sensor, 8K video recording, and advanced autofocus system.',
      category: 'Electronics',
      condition: 'like_new',
      brand: 'Canon',
      model: 'EOS R5',
      year: 2020,
      color: 'Black',
      sensorSize: 'Full-Frame (36 x 24mm)',
      megapixels: '45MP',
      resolution: '8192 x 5464 pixels',
      videoResolution: '8K RAW (8192 x 4320)',
      dimensions: {
        length: '5.4 inches',
        width: '3.9 inches',
        height: '3.5 inches',
        weight: '1.6 pounds',
      },
      specifications: {
        'Sensor': '45MP Full-Frame CMOS',
        'Video': '8K RAW, 4K 120p',
        'Autofocus': 'Dual Pixel CMOS AF II',
        'ISO Range': '100-51200 (expandable to 102400)',
        'Shutter Speed': '1/8000 to 30 sec',
        'Continuous Shooting': 'Up to 12 fps (mechanical), 20 fps (electronic)',
        'Image Stabilization': 'In-body 5-axis',
        'Viewfinder': '5.76M dot OLED',
        'LCD Screen': '3.2" 2.1M dot vari-angle touchscreen',
        'Shutter Count': 'Low (under 5,000)',
        'Memory Card': 'Dual CFexpress Type B / SD',
      },
      similarItems: [
        { title: 'Canon EOS R5 Body', price: 3299.99, platform: 'eBay' },
        { title: 'Canon R5 Camera', price: 3399.99, platform: 'Website' },
      ],
      researchNotes: 'Canon EOS R5 bodies typically sell for $3,200-$3,500 used. Low shutter count and excellent condition justify premium pricing.',
    },
  },
  {
    id: generateId(),
    title: 'Gold Diamond Ring - 14K',
    description: 'Beautiful 14K gold ring with diamond center stone. Includes certificate of authenticity. Size 7.',
    price: 899.99,
    condition: 'used',
    category: 'Jewelry',
    images: ['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400'],
    status: 'active',
    platforms: ['facebook', 'ebay', 'website'],
    createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      facebook: 'posted',
      ebay: 'posted',
      website: 'posting',
    },
    aiData: {
      recognizedItem: 'Gold Diamond Ring',
      confidence: 0.87,
      marketPrice: 950.00,
      suggestedPrice: 899.99,
      description: '14K gold ring with diamond center stone. Includes certificate of authenticity. Size 7.',
      category: 'Jewelry',
      condition: 'used',
      brand: 'Unknown',
      color: 'Gold',
      size: '7',
      metalType: '14K Gold',
      stoneType: 'Diamond',
      carat: '1.0 carat',
      dimensions: {
        diameter: '17.3mm',
        height: '6mm',
        weight: '4.2g',
      },
      specifications: {
        'Metal': '14K Gold',
        'Stone': 'Diamond',
        'Size': '7',
        'Certificate': 'Included',
        'Stone Setting': 'Prong',
        'Ring Style': 'Solitaire',
        'Band Width': '2mm',
      },
      similarItems: [
        { title: '14K Gold Diamond Ring', price: 899.99, platform: 'Facebook' },
        { title: 'Gold Ring with Diamond', price: 950.00, platform: 'eBay' },
      ],
      researchNotes: '14K gold diamond rings with 1 carat center stone typically sell for $850-$1,000. Certificate of authenticity adds value.',
    },
  },
  {
    id: generateId(),
    title: 'Bosch Circular Saw - 7.25"',
    description: 'Professional grade circular saw. Well maintained, includes blade and case.',
    price: 89.99,
    condition: 'used',
    category: 'Tools',
    images: ['https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'],
    status: 'active',
    platforms: ['facebook', 'website'],
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    postingStatus: {
      facebook: 'posting',
      website: 'posting',
    },
    aiData: {
      recognizedItem: 'Circular Saw',
      confidence: 0.82,
      marketPrice: 99.99,
      suggestedPrice: 89.99,
      description: 'Professional grade circular saw. Well maintained, includes blade and case.',
      category: 'Tools',
      condition: 'used',
      brand: 'Bosch',
      model: 'CS10',
      year: 2019,
      color: 'Blue',
      powerSource: 'Corded',
      voltage: '120V',
      dimensions: {
        length: '14.5 inches',
        width: '8.5 inches',
        height: '7.8 inches',
        weight: '8.8 pounds',
      },
      specifications: {
        'Brand': 'Bosch',
        'Blade Size': '7.25 inches',
        'Power': '15 Amp',
        'Max Cutting Depth': '2.44 inches at 90°',
        'Bevel Capacity': '0-56°',
        'RPM': '5,800',
        'Includes': 'Blade, Case',
        'Type': 'Corded',
      },
      similarItems: [
        { title: 'Bosch 7.25" Circular Saw', price: 89.99, platform: 'Facebook' },
        { title: 'Circular Saw Professional', price: 99.99, platform: 'Website' },
      ],
      researchNotes: 'Bosch circular saws typically sell for $80-$110 used. Professional grade tools maintain value well.',
    },
  },
];

export const mockInventoryService = {
  getAll: async (): Promise<InventoryItem[]> => {
    const stored = await storageService.getInventory();
    // Check if stored data has the new format (with researchNotes in aiData and postingStatus)
    const hasNewFormat = stored.length > 0 && stored.some(item => 
      item.aiData?.researchNotes !== undefined && item.postingStatus !== undefined
    );
    
    // Force refresh if data doesn't have postingStatus
    if (!hasNewFormat || stored.length === 0) {
      await storageService.clearInventory();
      await storageService.saveInventory(mockItems);
      return mockItems;
    }
    
    return stored;
    
    /* Uncomment to preserve user data:
    if (stored.length > 0 && !hasNewFormat) {
      // Old data format detected, clear and refresh with new mock data
      storageService.clearInventory();
      storageService.saveInventory(mockItems);
      return mockItems;
    }
    
    if (stored.length > 0) {
      return stored;
    }
    
    // Initialize with mock data
    storageService.saveInventory(mockItems);
    return mockItems;
    */
  },

  getById: async (id: string): Promise<InventoryItem | undefined> => {
    const items = await mockInventoryService.getAll();
    return items.find(item => item.id === id);
  },

  create: async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<InventoryItem> => {
    const items = await mockInventoryService.getAll();
    const newItem: InventoryItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    items.push(newItem);
    await storageService.saveInventory(items);
    return newItem;
  },

  update: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    const items = await mockInventoryService.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index === -1) return null;
    
    items[index] = {
      ...items[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await storageService.saveInventory(items);
    return items[index];
  },

  delete: async (id: string): Promise<boolean> => {
    const items = await mockInventoryService.getAll();
    const filtered = items.filter(item => item.id !== id);
    if (filtered.length === items.length) return false;
    await storageService.saveInventory(filtered);
    return true;
  },

  markAsSold: async (id: string): Promise<InventoryItem | null> => {
    return mockInventoryService.update(id, { 
      status: 'sold',
      platforms: [] // Remove from all platforms when sold
    });
  },
};


