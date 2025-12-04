import { AIData, ItemCondition } from '../types/inventory';

// Simulate AI processing delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mockRecognitions: Record<string, AIData> = {
  'phone': {
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
  'laptop': {
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
  'guitar': {
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
};

export const mockAIService = {
  recognizeItem: async (imageUri: string): Promise<AIData> => {
    // Simulate processing delay (2-4 seconds)
    await delay(2000 + Math.random() * 2000);
    
    // Simple mock: try to detect item type from image or use random
    // In real implementation, this would use AI vision API
    let itemType = 'phone'; // default
    
    // Add some randomness to make it feel more realistic
    const types = ['phone', 'laptop', 'guitar'];
    itemType = types[Math.floor(Math.random() * types.length)];
    
    const baseData = mockRecognitions[itemType];
    const variation = 0.05; // 5% price variation
    
    return {
      ...baseData,
      marketPrice: baseData.marketPrice * (1 + (Math.random() - 0.5) * variation),
      suggestedPrice: baseData.suggestedPrice * (1 + (Math.random() - 0.5) * variation),
      confidence: baseData.confidence + (Math.random() - 0.5) * 0.1,
    };
  },
};

