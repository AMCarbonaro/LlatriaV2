import { InventoryItem } from '@/types/inventory';

interface DuplicateMatch {
  item: InventoryItem;
  similarity: number;
  reasons: string[];
}

export const findDuplicates = (
  newItem: Partial<InventoryItem>,
  existingItems: InventoryItem[]
): DuplicateMatch[] => {
  const matches: DuplicateMatch[] = [];

  existingItems.forEach((item) => {
    const reasons: string[] = [];
    let similarity = 0;

    // Check title similarity
    if (newItem.title && item.title) {
      const titleSimilarity = calculateSimilarity(
        newItem.title.toLowerCase(),
        item.title.toLowerCase()
      );
      if (titleSimilarity > 0.7) {
        similarity += titleSimilarity * 0.4;
        reasons.push(`Similar title (${Math.round(titleSimilarity * 100)}% match)`);
      }
    }

    // Check exact title match
    if (newItem.title && item.title && newItem.title.toLowerCase() === item.title.toLowerCase()) {
      similarity += 0.3;
      reasons.push('Exact title match');
    }

    // Check price similarity (within 10%)
    if (newItem.price && item.price) {
      const priceDiff = Math.abs(newItem.price - item.price) / Math.max(newItem.price, item.price);
      if (priceDiff < 0.1) {
        similarity += 0.2;
        reasons.push('Similar price');
      }
    }

    // Check category match
    if (newItem.category && item.category && newItem.category === item.category) {
      similarity += 0.1;
      reasons.push('Same category');
    }

    if (similarity > 0.5) {
      matches.push({
        item,
        similarity,
        reasons,
      });
    }
  });

  // Sort by similarity (highest first)
  return matches.sort((a, b) => b.similarity - a.similarity);
};

const calculateSimilarity = (str1: string, str2: string): number => {
  // Simple Levenshtein distance-based similarity
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
};

export const findSimilarItems = (
  item: InventoryItem,
  allItems: InventoryItem[],
  threshold: number = 0.6
): InventoryItem[] => {
  const matches = findDuplicates(item, allItems.filter(i => i.id !== item.id));
  return matches
    .filter(m => m.similarity >= threshold)
    .map(m => m.item);
};



