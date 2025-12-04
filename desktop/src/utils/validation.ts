export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateEmail = (email: string): ValidationResult => {
  if (!email) {
    return { isValid: false, error: 'Email is required' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
};

export const validatePassword = (password: string): ValidationResult => {
  if (!password) {
    return { isValid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters' };
  }
  return { isValid: true };
};

export const validateTitle = (title: string): ValidationResult => {
  if (!title || title.trim().length === 0) {
    return { isValid: false, error: 'Title is required' };
  }
  if (title.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters' };
  }
  if (title.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' };
  }
  return { isValid: true };
};

export const validateDescription = (description: string): ValidationResult => {
  if (!description || description.trim().length === 0) {
    return { isValid: false, error: 'Description is required' };
  }
  if (description.length < 10) {
    return { isValid: false, error: 'Description must be at least 10 characters' };
  }
  if (description.length > 5000) {
    return { isValid: false, error: 'Description must be less than 5000 characters' };
  }
  return { isValid: true };
};

export const validatePrice = (price: number): ValidationResult => {
  if (price === undefined || price === null) {
    return { isValid: false, error: 'Price is required' };
  }
  if (isNaN(price)) {
    return { isValid: false, error: 'Price must be a valid number' };
  }
  if (price < 0) {
    return { isValid: false, error: 'Price cannot be negative' };
  }
  if (price > 1000000) {
    return { isValid: false, error: 'Price cannot exceed $1,000,000' };
  }
  // Check decimal places
  const decimalPlaces = (price.toString().split('.')[1] || '').length;
  if (decimalPlaces > 2) {
    return { isValid: false, error: 'Price can have at most 2 decimal places' };
  }
  return { isValid: true };
};

export const validateCategory = (category: string): ValidationResult => {
  if (!category || category.trim().length === 0) {
    return { isValid: false, error: 'Category is required' };
  }
  return { isValid: true };
};

export const validateSubdomain = (subdomain: string): ValidationResult => {
  if (!subdomain || subdomain.length === 0) {
    return { isValid: false, error: 'Subdomain is required' };
  }
  if (subdomain.length < 3) {
    return { isValid: false, error: 'Subdomain must be at least 3 characters' };
  }
  if (subdomain.length > 63) {
    return { isValid: false, error: 'Subdomain must be less than 63 characters' };
  }
  const subdomainRegex = /^[a-z0-9-]+$/;
  if (!subdomainRegex.test(subdomain)) {
    return { isValid: false, error: 'Subdomain can only contain lowercase letters, numbers, and hyphens' };
  }
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { isValid: false, error: 'Subdomain cannot start or end with a hyphen' };
  }
  return { isValid: true };
};

export const validateImageFile = (file: File): ValidationResult => {
  if (!file) {
    return { isValid: false, error: 'File is required' };
  }
  
  // Check file type
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type)) {
    return { isValid: false, error: 'File must be an image (JPG, PNG, GIF, or WebP)' };
  }
  
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { isValid: false, error: 'Image size must be less than 10MB' };
  }
  
  return { isValid: true };
};

export const validateImageDimensions = (
  file: File,
  maxWidth: number = 5000,
  maxHeight: number = 5000
): Promise<ValidationResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (img.width > maxWidth || img.height > maxHeight) {
        resolve({
          isValid: false,
          error: `Image dimensions must be less than ${maxWidth}x${maxHeight} pixels`,
        });
      } else {
        resolve({ isValid: true });
      }
    };
    
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve({ isValid: false, error: 'Invalid image file' });
    };
    
    img.src = url;
  });
};

export const validateListingForm = (data: {
  title: string;
  description: string;
  price: number;
  category: string;
}): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};
  
  const titleResult = validateTitle(data.title);
  if (!titleResult.isValid) {
    errors.title = titleResult.error || '';
  }
  
  const descriptionResult = validateDescription(data.description);
  if (!descriptionResult.isValid) {
    errors.description = descriptionResult.error || '';
  }
  
  const priceResult = validatePrice(data.price);
  if (!priceResult.isValid) {
    errors.price = priceResult.error || '';
  }
  
  const categoryResult = validateCategory(data.category);
  if (!categoryResult.isValid) {
    errors.category = categoryResult.error || '';
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};



