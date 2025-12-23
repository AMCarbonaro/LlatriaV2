import { InventoryItem } from '@/types/inventory';

interface ImportResult {
  success: boolean;
  items: InventoryItem[];
  errors: string[];
}

export const importFromCSV = async (file: File): Promise<ImportResult> => {
  const errors: string[] = [];
  const items: InventoryItem[] = [];

  try {
    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) {
      return {
        success: false,
        items: [],
        errors: ['CSV file must have at least a header row and one data row'],
      };
    }

    const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.replace(/^"|"$/g, ''));
      
      try {
        const item: Partial<InventoryItem> = {
          title: values[headers.indexOf('Title')] || '',
          description: (values[headers.indexOf('Description')] || '').replace(/;/g, ','),
          price: parseFloat(values[headers.indexOf('Price')] || '0'),
          condition: (values[headers.indexOf('Condition')] || 'used') as any,
          category: values[headers.indexOf('Category')] || '',
          status: (values[headers.indexOf('Status')] || 'active') as any,
          platforms: (values[headers.indexOf('Platforms')] || '').split(';').filter(Boolean) as any[],
          images: [],
        };

        // Validate required fields
        if (!item.title || !item.description || !item.price) {
          errors.push(`Row ${i + 1}: Missing required fields`);
          continue;
        }

        items.push(item as InventoryItem);
      } catch (error) {
        errors.push(`Row ${i + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    }

    return {
      success: errors.length === 0,
      items,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse CSV file'],
    };
  }
};

export const importFromJSON = async (file: File): Promise<ImportResult> => {
  const errors: string[] = [];
  const items: InventoryItem[] = [];

  try {
    const text = await file.text();
    const data = JSON.parse(text);

    if (!Array.isArray(data)) {
      return {
        success: false,
        items: [],
        errors: ['JSON file must contain an array of items'],
      };
    }

    data.forEach((item, index) => {
      try {
        // Validate required fields
        if (!item.title || !item.description || item.price === undefined) {
          errors.push(`Item ${index + 1}: Missing required fields`);
          return;
        }

        const importedItem: Partial<InventoryItem> = {
          title: item.title,
          description: item.description,
          price: parseFloat(item.price),
          condition: item.condition || 'used',
          category: item.category || '',
          status: item.status || 'active',
          platforms: item.platforms || [],
          images: item.images || [],
        };

        items.push(importedItem as InventoryItem);
      } catch (error) {
        errors.push(`Item ${index + 1}: ${error instanceof Error ? error.message : 'Invalid data'}`);
      }
    });

    return {
      success: errors.length === 0,
      items,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      items: [],
      errors: [error instanceof Error ? error.message : 'Failed to parse JSON file'],
    };
  }
};






