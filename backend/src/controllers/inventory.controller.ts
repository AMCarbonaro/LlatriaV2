import { Response } from 'express';
import { inventoryService } from '../services/inventory.service';
import { AuthenticatedRequest } from '../middleware/auth.middleware';
import { handleError, AppError, ErrorCode } from '../utils/error-handler';

/**
 * Get all inventory items
 * GET /api/inventory
 */
export async function getItems(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { status, category, search, limit, offset } = req.query;

    const items = await inventoryService.getItems(req.userId, {
      status: status as any,
      category: category as string,
      search: search as string,
      limit: limit ? parseInt(limit as string) : undefined,
      offset: offset ? parseInt(offset as string) : undefined,
    });

    res.json({
      success: true,
      items,
      count: items.length,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Get single inventory item
 * GET /api/inventory/:id
 */
export async function getItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const item = await inventoryService.getItemById(id, req.userId);

    if (!item) {
      throw new AppError(ErrorCode.ITEM_NOT_FOUND, 'Item not found', 404);
    }

    res.json({
      success: true,
      item,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Create new inventory item
 * POST /api/inventory
 */
export async function createItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { title, description, price, condition, category, images, aiData } = req.body;

    // Validation
    if (!title || !description || price === undefined || !condition || !category) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Missing required fields: title, description, price, condition, category',
        400
      );
    }

    const item = await inventoryService.createItem({
      userId: req.userId,
      title,
      description,
      price: parseFloat(price),
      condition,
      category,
      images,
      aiData,
    });

    res.status(201).json({
      success: true,
      item,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Update inventory item
 * PUT /api/inventory/:id
 */
export async function updateItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const { title, description, price, condition, category, status, images, aiData } = req.body;

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (condition !== undefined) updateData.condition = condition;
    if (category !== undefined) updateData.category = category;
    if (status !== undefined) updateData.status = status;
    if (images !== undefined) updateData.images = images;
    if (aiData !== undefined) updateData.aiData = aiData;

    const item = await inventoryService.updateItem(id, req.userId, updateData);

    res.json({
      success: true,
      item,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Delete inventory item
 * DELETE /api/inventory/:id
 */
export async function deleteItem(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    await inventoryService.deleteItem(id, req.userId);

    res.json({
      success: true,
      message: 'Item deleted successfully',
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Mark item as sold
 * PATCH /api/inventory/:id/sold
 */
export async function markAsSold(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { id } = req.params;
    const item = await inventoryService.markAsSold(id, req.userId);

    res.json({
      success: true,
      item,
    });
  } catch (error: any) {
    handleError(error, res);
  }
}

/**
 * Bulk operations
 * POST /api/inventory/bulk
 */
export async function bulkOperation(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.userId) {
      throw new AppError(ErrorCode.UNAUTHORIZED, 'Not authenticated', 401);
    }

    const { operation, itemIds } = req.body;

    if (!operation || !itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'Operation and itemIds array are required',
        400
      );
    }

    switch (operation) {
      case 'delete':
        await inventoryService.bulkDelete(itemIds, req.userId);
        res.json({
          success: true,
          message: `${itemIds.length} item(s) deleted successfully`,
        });
        break;

      case 'mark-sold':
        await inventoryService.bulkMarkAsSold(itemIds, req.userId);
        res.json({
          success: true,
          message: `${itemIds.length} item(s) marked as sold`,
        });
        break;

      default:
        throw new AppError(ErrorCode.VALIDATION_ERROR, 'Invalid operation', 400);
    }
  } catch (error: any) {
    handleError(error, res);
  }
}



