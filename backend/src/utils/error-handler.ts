import { Response } from 'express';

export enum ErrorCode {
  // eBay Errors
  EBAY_NOT_CONNECTED = 'EBAY_NOT_CONNECTED',
  EBAY_AUTH_FAILED = 'EBAY_AUTH_FAILED',
  EBAY_TOKEN_EXPIRED = 'EBAY_TOKEN_EXPIRED',
  EBAY_LISTING_FAILED = 'EBAY_LISTING_FAILED',
  EBAY_RATE_LIMIT = 'EBAY_RATE_LIMIT',
  EBAY_VALIDATION_ERROR = 'EBAY_VALIDATION_ERROR',
  
  // Facebook Errors
  FACEBOOK_NOT_LOGGED_IN = 'FACEBOOK_NOT_LOGGED_IN',
  FACEBOOK_FORM_ERROR = 'FACEBOOK_FORM_ERROR',
  FACEBOOK_RATE_LIMIT = 'FACEBOOK_RATE_LIMIT',
  
  // General Errors
  ITEM_NOT_FOUND = 'ITEM_NOT_FOUND',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
}

export class AppError extends Error {
  constructor(
    public code: ErrorCode,
    public message: string,
    public statusCode: number = 500,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: any, res: Response) {
  console.error('Error:', error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
    });
  }

  // Handle eBay API errors
  if (error.response?.data?.errors) {
    const ebayErrors = error.response.data.errors;
    const errorMessages = ebayErrors.map((e: any) => e.message).join(', ');
    
    return res.status(error.response.status || 500).json({
      success: false,
      error: `eBay API Error: ${errorMessages}`,
      code: ErrorCode.EBAY_LISTING_FAILED,
      details: ebayErrors,
    });
  }

  // Handle network errors
  if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable. Please try again later.',
      code: ErrorCode.INTERNAL_ERROR,
    });
  }

  // Default error
  return res.status(500).json({
    success: false,
    error: error.message || 'Internal server error',
    code: ErrorCode.INTERNAL_ERROR,
  });
}

export function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000
): Promise<T> {
  return new Promise(async (resolve, reject) => {
    let lastError: any;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn();
        return resolve(result);
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on certain errors
        if (error.statusCode === 401 || error.statusCode === 403 || error.statusCode === 404) {
          return reject(error);
        }
        
        if (attempt < maxRetries) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    reject(lastError);
  });
}






