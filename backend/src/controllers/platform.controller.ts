import { Response } from 'express';
import { ebayService } from '../services/ebay.service';
import { platformCredentialsService } from '../services/platform-credentials.service';
import { inventoryService } from '../services/inventory.service';
import { prisma } from '../lib/prisma';
import { eBayListing } from '../types/inventory.types';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { handleError, AppError, ErrorCode } from '../utils/error-handler';

/**
 * Initiate eBay OAuth flow
 * GET /api/platforms/ebay/connect
 */
export async function connectEBay(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const state = `${req.userId}-${Date.now()}`; // Include user ID in state for security
    
    const authUrl = ebayService.getOAuthUrl(state);
    
    res.json({
      success: true,
      authUrl,
      state,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Handle eBay OAuth callback
 * GET /api/platforms/ebay/callback
 */
export async function ebayCallback(req: Request, res: Response) {
  try {
    const { code, state } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Missing authorization code',
      });
    }

    const token = await ebayService.exchangeCodeForToken(code);
    
    // Extract user ID from state
    const userId = state?.toString().split('-')[0];
    
    if (!userId) {
      throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid state parameter', 400);
    }
    
    // Store token in database
    const expiresAt = token.expires_in 
      ? new Date(Date.now() + token.expires_in * 1000)
      : undefined;
    
    await platformCredentialsService.saveCredentials(userId, 'ebay', {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt,
    });
    
    res.json({
      success: true,
      message: 'eBay account connected successfully',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get platform connection status
 * GET /api/platforms/:platform/status
 */
export async function getPlatformStatus(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { platform } = req.params;
    const userId = req.userId;
    
    if (platform !== 'ebay' && platform !== 'facebook') {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
      });
    }

    const isConnected = await platformCredentialsService.isConnected(userId, platform);
    
    res.json({
      success: true,
      connected: isConnected,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Disconnect platform
 * DELETE /api/platforms/:platform/disconnect
 */
export async function disconnectPlatform(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { platform } = req.params;
    const userId = req.userId;
    
    if (platform !== 'ebay' && platform !== 'facebook') {
      return res.status(400).json({
        success: false,
        error: 'Invalid platform',
      });
    }

    await platformCredentialsService.deleteCredentials(userId, platform);
    
    res.json({
      success: true,
      message: `${platform} disconnected successfully`,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Post item to eBay
 * POST /api/inventory/:id/post/ebay
 */
export async function postToEBay(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const userId = req.userId;
    const listingData: eBayListing = req.body;
    
    // Get item from database
    const item = await inventoryService.getItemById(id, userId);
    if (!item) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Item not found', 404);
    }
    
    // Get user's eBay access token from database
    const credentials = await platformCredentialsService.getCredentials(userId, 'ebay');
    if (!credentials) {
      throw new AppError(ErrorCode.EBAY_NOT_CONNECTED, 'eBay not connected. Please connect your eBay account first.', 401);
    }

    // Check if token is expired and refresh if needed
    let accessToken = credentials.accessToken;
    if (credentials.expiresAt && credentials.expiresAt < new Date() && credentials.refreshToken) {
      const newToken = await ebayService.refreshUserToken(credentials.refreshToken);
      accessToken = newToken.access_token;
      
      // Update stored credentials
      const newExpiresAt = newToken.expires_in 
        ? new Date(Date.now() + newToken.expires_in * 1000)
        : undefined;
      
      await platformCredentialsService.saveCredentials(userId, 'ebay', {
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token || credentials.refreshToken,
        expiresAt: newExpiresAt,
      });
    }
    
    // Convert database item to format expected by eBay service
    const itemForEBay = {
      id: item.id,
      userId: item.userId,
      title: listingData.title || item.title,
      description: listingData.description || item.description,
      price: parseFloat(item.price.toString()),
      condition: item.condition,
      category: listingData.category || item.category,
      images: listingData.images || item.images.map(img => img.url),
      status: item.status,
      platforms: ['ebay'] as const,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
      aiData: item.aiData,
    };
    
    // Create listing
    const result = await ebayService.createListing(accessToken, itemForEBay, listingData);
    
    // Publish the listing
    const published = await ebayService.publishListing(accessToken, result.offerId);
    
    // Update item in database with eBay listing ID and posting status
    const listingId = published.listingId || result.offerId;
    await prisma.platformPosting.upsert({
      where: {
        itemId_platform: {
          itemId: id,
          platform: 'ebay',
        },
      },
      update: {
        status: 'posted',
        externalId: listingId,
        externalUrl: `https://www.ebay.com/itm/${listingId}`,
        postedAt: new Date(),
      },
      create: {
        itemId: id,
        platform: 'ebay',
        status: 'posted',
        externalId: listingId,
        externalUrl: `https://www.ebay.com/itm/${listingId}`,
        postedAt: new Date(),
      },
    });
    
    res.json({
      success: true,
      listingId: published.listingId || result.offerId,
      offerId: result.offerId,
      url: `https://www.ebay.com/itm/${published.listingId || result.offerId}`,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Update eBay listing
 * PUT /api/inventory/:id/post/ebay
 */
export async function updateEBayListing(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId || 'default-user';
    const updates: Partial<eBayListing> = req.body;
    
    // TODO: Get item and eBay listing ID from database
    // const item = await inventoryService.getItem(userId, id);
    // if (!item || !item.ebayListingId) {
    //   return res.status(404).json({ success: false, error: 'eBay listing not found' });
    // }
    
    // Get access token
    const credentials = await platformCredentialsService.getCredentials(userId, 'ebay');
    if (!credentials) {
      return res.status(401).json({ success: false, error: 'eBay not connected' });
    }

    let accessToken = credentials.accessToken;
    if (credentials.expiresAt && credentials.expiresAt < new Date() && credentials.refreshToken) {
      const newToken = await ebayService.refreshUserToken(credentials.refreshToken);
      accessToken = newToken.access_token;
      await platformCredentialsService.saveCredentials(userId, 'ebay', {
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token || credentials.refreshToken,
        expiresAt: newToken.expires_in ? new Date(Date.now() + newToken.expires_in * 1000) : undefined,
      });
    }
    
    // TODO: Get offer ID from item
    const mockOfferId = 'mock-offer-id';
    
    await ebayService.updateListing(accessToken, mockOfferId, updates);
    
    res.json({
      success: true,
      message: 'eBay listing updated successfully',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Delete/End eBay listing
 * DELETE /api/inventory/:id/post/ebay
 */
export async function deleteEBayListing(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId || 'default-user';
    
    // TODO: Get item and offer ID from database
    // const item = await inventoryService.getItem(userId, id);
    // if (!item || !item.ebayListingId) {
    //   return res.status(404).json({ success: false, error: 'eBay listing not found' });
    // }
    
    // Get access token
    const credentials = await platformCredentialsService.getCredentials(userId, 'ebay');
    if (!credentials) {
      return res.status(401).json({ success: false, error: 'eBay not connected' });
    }

    let accessToken = credentials.accessToken;
    if (credentials.expiresAt && credentials.expiresAt < new Date() && credentials.refreshToken) {
      const newToken = await ebayService.refreshUserToken(credentials.refreshToken);
      accessToken = newToken.access_token;
      await platformCredentialsService.saveCredentials(userId, 'ebay', {
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token || credentials.refreshToken,
        expiresAt: newToken.expires_in ? new Date(Date.now() + newToken.expires_in * 1000) : undefined,
      });
    }
    
    // TODO: Get offer ID from item
    const mockOfferId = 'mock-offer-id';
    
    await ebayService.deleteListing(accessToken, mockOfferId);
    
    // TODO: Update item in database
    // await inventoryService.updateItem(userId, id, {
    //   ebayListingId: undefined,
    //   postingStatus: { ...item.postingStatus, ebay: 'idle' },
    // });
    
    res.json({
      success: true,
      message: 'eBay listing deleted successfully',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get eBay listing status
 * GET /api/inventory/:id/post/ebay/status
 */
export async function getEBayListingStatus(req: AuthenticatedRequest, res: Response) {
  try {
    const { id } = req.params;
    const userId = req.userId || 'default-user';
    
    // TODO: Get item and offer ID from database
    // const item = await inventoryService.getItem(userId, id);
    // if (!item || !item.ebayListingId) {
    //   return res.status(404).json({ success: false, error: 'eBay listing not found' });
    // }
    
    // Get access token
    const credentials = await platformCredentialsService.getCredentials(userId, 'ebay');
    if (!credentials) {
      return res.status(401).json({ success: false, error: 'eBay not connected' });
    }

    let accessToken = credentials.accessToken;
    if (credentials.expiresAt && credentials.expiresAt < new Date() && credentials.refreshToken) {
      const newToken = await ebayService.refreshUserToken(credentials.refreshToken);
      accessToken = newToken.access_token;
      await platformCredentialsService.saveCredentials(userId, 'ebay', {
        accessToken: newToken.access_token,
        refreshToken: newToken.refresh_token || credentials.refreshToken,
        expiresAt: newToken.expires_in ? new Date(Date.now() + newToken.expires_in * 1000) : undefined,
      });
    }
    
    // TODO: Get offer ID from item
    const mockOfferId = 'mock-offer-id';
    
    const status = await ebayService.getListingStatus(accessToken, mockOfferId);
    
    res.json({
      success: true,
      status,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}
