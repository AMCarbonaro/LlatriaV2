import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { googleLensService } from '../services/google-lens.service';
import { googleShoppingService } from '../services/google-shopping.service';
import { handleError, AppError, ErrorCode } from '../utils/error-handler';

/**
 * Recognize item from image
 * POST /api/ai/recognize
 */
export async function recognizeItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { image } = req.body;

    if (!image) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Image is required', 400);
    }

    // Image should be base64 encoded
    const aiData = await googleLensService.recognizeItem(image);

    res.json({
      success: true,
      data: aiData,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get price suggestions for an item
 * GET /api/ai/suggestions/:itemId
 */
export async function getPriceSuggestions(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { itemName, brand } = req.query;

    if (!itemName || typeof itemName !== 'string') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'itemName is required', 400);
    }

    const analysis = await googleShoppingService.getMarketAnalysis(
      itemName,
      brand as string | undefined
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Search for similar products
 * GET /api/ai/search
 */
export async function searchProducts(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { query, maxResults, minPrice, maxPrice, condition } = req.query;

    if (!query || typeof query !== 'string') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'query is required', 400);
    }

    const results = await googleShoppingService.searchProducts(query, {
      maxResults: maxResults ? parseInt(maxResults as string) : undefined,
      minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
      condition: condition as string | undefined,
    });

    res.json({
      success: true,
      results,
      count: results.length,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get price comparison
 * GET /api/ai/price-comparison
 */
export async function getPriceComparison(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { productName, brand } = req.query;

    if (!productName || typeof productName !== 'string') {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'productName is required', 400);
    }

    const comparison = await googleShoppingService.getPriceComparison(
      productName,
      brand as string | undefined
    );

    res.json({
      success: true,
      data: comparison,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}






