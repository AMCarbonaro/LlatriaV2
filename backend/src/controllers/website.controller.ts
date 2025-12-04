import { Response, Request } from 'express';
import { inventoryService } from '../services/inventory.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { handleError, AppError, ErrorCode } from '../utils/error-handler';
import { prisma } from '../lib/prisma';

/**
 * Get public website products for a specific user/store (no auth required)
 * GET /api/website/:storeId/products
 * or
 * GET /api/website/products?storeId=xxx
 */
export async function getWebsiteProducts(req: Request, res: Response) {
  try {
    const { category, search, limit, offset, storeId } = req.query;
    // Get store identifier from: subdomain > path param > query param
    const storeIdentifier = (req as any).storeIdentifier || req.params.storeId || storeId;

    if (!storeIdentifier) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Store identifier is required', 400);
    }

    // Find user by store identifier (could be subdomain, store name, or user ID)
    // For now, we'll use email or a store identifier
    // TODO: Add storeIdentifier field to User model or use subdomain
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: storeIdentifier as string },
          { email: storeIdentifier as string },
          // TODO: Add storeIdentifier field: { storeIdentifier: storeIdentifier as string }
        ],
      },
    });

    if (!user) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Store not found', 404);
    }

    // Get items for this specific user that are active and posted to website
    const items = await prisma.inventoryItem.findMany({
      where: {
        userId: user.id,
        status: 'active',
        postings: {
          some: {
            platform: 'website',
            status: 'posted',
          },
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        aiData: true,
        postings: {
          where: {
            platform: 'website',
            status: 'posted',
          },
          select: {
            externalId: true,
            externalUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: limit ? parseInt(limit as string) : 50,
      skip: offset ? parseInt(offset as string) : 0,
    });

    // Filter by category if provided
    let filteredItems = items;
    if (category) {
      filteredItems = items.filter(item => 
        item.category.toLowerCase() === (category as string).toLowerCase()
      );
    }

    // Filter by search if provided
    if (search) {
      const searchLower = (search as string).toLowerCase();
      filteredItems = filteredItems.filter(item =>
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower)
      );
    }

    // Get all postings for all items in one query
    const itemIds = filteredItems.map(item => item.id);
    const allPostings = await prisma.platformPosting.findMany({
      where: { 
        itemId: { in: itemIds },
        status: 'posted' 
      },
      select: { 
        itemId: true,
        platform: true 
      },
    });
    
    // Group postings by itemId
    const postingsByItem = allPostings.reduce((acc, posting) => {
      if (!acc[posting.itemId]) {
        acc[posting.itemId] = [];
      }
      acc[posting.itemId].push(posting.platform.toLowerCase());
      return acc;
    }, {} as Record<string, string[]>);
    
    // Transform to website format
    const products = filteredItems.map(item => {
      const platforms = postingsByItem[item.id] || ['website'];
      
      return {
        id: item.id,
        title: item.title,
        description: item.description,
        price: parseFloat(item.price.toString()),
        condition: item.condition,
        category: item.category,
        images: item.images.map(img => img.url),
        status: item.status,
        platforms: platforms as any[],
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
        websiteListingId: item.postings[0]?.externalId || undefined,
        aiData: item.aiData ? {
          recognizedItem: item.aiData.recognizedItem || '',
          confidence: item.aiData.confidence || 0,
          marketPrice: parseFloat(item.aiData.marketPrice?.toString() || '0'),
          suggestedPrice: parseFloat(item.aiData.suggestedPrice?.toString() || '0'),
          description: item.aiData.description || '',
          category: item.aiData.category || '',
          condition: item.aiData.condition || 'used',
          brand: item.aiData.brand || undefined,
          model: item.aiData.model || undefined,
          specifications: item.aiData.specifications || {},
          similarItems: [],
        } : undefined,
      };
    });

    res.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get single website product (no auth required)
 * GET /api/website/:storeId/products/:id
 * or
 * GET /api/website/products/:id?storeId=xxx
 */
export async function getWebsiteProduct(req: Request, res: Response) {
  try {
    const { id, storeId: storeIdParam } = req.params;
    const { storeId: storeIdQuery } = req.query;
    // Get store identifier from: subdomain > path param > query param
    const storeIdentifier = (req as any).storeIdentifier || storeIdParam || storeIdQuery;

    if (!storeIdentifier) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Store identifier is required', 400);
    }

    // Find user by store identifier
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: storeIdentifier as string },
          { email: storeIdentifier as string },
        ],
      },
    });

    if (!user) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Store not found', 404);
    }

    const item = await prisma.inventoryItem.findFirst({
      where: {
        id,
        userId: user.id, // Ensure item belongs to this user's store
        status: 'active',
        postings: {
          some: {
            platform: 'website',
            status: 'posted',
          },
        },
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        aiData: true,
        postings: {
          where: {
            platform: 'website',
            status: 'posted',
          },
          select: {
            externalId: true,
            externalUrl: true,
          },
        },
      },
    });

    if (!item) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Product not found', 404);
    }

    // Get all platforms from postings
    const allPostings = await prisma.platformPosting.findMany({
      where: { itemId: item.id, status: 'posted' },
      select: { platform: true },
    });
    const platforms = allPostings.map(p => p.platform.toLowerCase()) as any[];
    
    // Transform to website format
    const product = {
      id: item.id,
      title: item.title,
      description: item.description,
      price: parseFloat(item.price.toString()),
      condition: item.condition,
      category: item.category,
      images: item.images.map(img => img.url),
      status: item.status,
      platforms: platforms.length > 0 ? platforms : ['website'],
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      websiteListingId: item.postings[0]?.externalId || undefined,
      aiData: item.aiData ? {
        recognizedItem: item.aiData.recognizedItem || '',
        confidence: item.aiData.confidence || 0,
        marketPrice: parseFloat(item.aiData.marketPrice?.toString() || '0'),
        suggestedPrice: parseFloat(item.aiData.suggestedPrice?.toString() || '0'),
        description: item.aiData.description || '',
        category: item.aiData.category || '',
        condition: item.aiData.condition || 'used',
        brand: item.aiData.brand || undefined,
        model: item.aiData.model || undefined,
        specifications: item.aiData.specifications || {},
        similarItems: [],
      } : undefined,
    };

    res.json({
      success: true,
      product,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Post item to website
 * POST /api/inventory/:id/post/website
 */
export async function postToWebsite(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const userId = req.userId;
    const { seoTitle, seoDescription } = req.body;

    // Get item from database
    const item = await inventoryService.getItemById(id, userId);
    if (!item) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Item not found', 404);
    }

    // Create or update website posting (using upsert with unique constraint)
    const websitePosting = await prisma.platformPosting.upsert({
      where: {
        itemId_platform: {
          itemId: id,
          platform: 'website',
        },
      },
      update: {
        status: 'posted',
        externalId: `website-${id}`,
        externalUrl: `${process.env.WEBSITE_URL || 'http://localhost:5174'}/${userId}/store`,
        postedAt: new Date(),
      },
      create: {
        itemId: id,
        platform: 'website',
        status: 'posted',
        externalId: `website-${id}`,
        externalUrl: `${process.env.WEBSITE_URL || 'http://localhost:5174'}/${userId}/store`,
        postedAt: new Date(),
      },
    });

    // Platforms are determined by PlatformPosting records, so no need to update item

    // Store SEO data if provided (could be stored in a separate table or as metadata)
    // For now, we'll just return success

    res.json({
      success: true,
      listingId: websitePosting.externalId,
      url: websitePosting.externalUrl,
      message: 'Successfully posted to website!',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Remove item from website
 * DELETE /api/inventory/:id/post/website
 */
export async function removeFromWebsite(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const userId = req.userId;

    // Get item from database
    const item = await inventoryService.getItemById(id, userId);
    if (!item) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Item not found', 404);
    }

    // Remove website posting
    await prisma.platformPosting.deleteMany({
      where: {
        itemId: id,
        platform: 'website',
      },
    });

    // Platforms are determined by PlatformPosting records, so deletion is sufficient

    res.json({
      success: true,
      message: 'Successfully removed from website',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

