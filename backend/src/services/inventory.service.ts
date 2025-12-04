import { prisma } from '../lib/prisma';
import { ItemCondition, ItemStatus, InventoryItem, AIData, InventoryImage } from '@prisma/client';

export interface CreateInventoryItemData {
  userId: string;
  title: string;
  description: string;
  price: number;
  condition: ItemCondition;
  category: string;
  images?: string[];
  aiData?: Partial<AIData>;
}

export interface UpdateInventoryItemData {
  title?: string;
  description?: string;
  price?: number;
  condition?: ItemCondition;
  category?: string;
  status?: ItemStatus;
  images?: string[];
  aiData?: Partial<AIData>;
}

export interface InventoryItemWithRelations extends InventoryItem {
  images: InventoryImage[];
  aiData: AIData | null;
  postings: Array<{
    id: string;
    platform: string;
    status: string;
    externalId: string | null;
    externalUrl: string | null;
  }>;
}

export class InventoryService {
  /**
   * Get all items for a user
   */
  async getItems(
    userId: string,
    options?: {
      status?: ItemStatus;
      category?: string;
      search?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<InventoryItemWithRelations[]> {
    const where: any = { userId };

    if (options?.status) {
      where.status = options.status;
    }

    if (options?.category) {
      where.category = options.category;
    }

    if (options?.search) {
      where.OR = [
        { title: { contains: options.search, mode: 'insensitive' } },
        { description: { contains: options.search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.inventoryItem.findMany({
      where,
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        aiData: true,
        postings: {
          select: {
            id: true,
            platform: true,
            status: true,
            externalId: true,
            externalUrl: true,
          },
        },
      },
      orderBy: { updatedAt: 'desc' },
      take: options?.limit,
      skip: options?.offset,
    });

    return items as InventoryItemWithRelations[];
  }

  /**
   * Get single item by ID
   */
  async getItemById(itemId: string, userId: string): Promise<InventoryItemWithRelations | null> {
    const item = await prisma.inventoryItem.findFirst({
      where: {
        id: itemId,
        userId, // Ensure user owns the item
      },
      include: {
        images: {
          orderBy: { order: 'asc' },
        },
        aiData: true,
        postings: {
          select: {
            id: true,
            platform: true,
            status: true,
            externalId: true,
            externalUrl: true,
          },
        },
      },
    });

    return item as InventoryItemWithRelations | null;
  }

  /**
   * Create new inventory item
   */
  async createItem(data: CreateInventoryItemData): Promise<InventoryItemWithRelations> {
    const { images, aiData, ...itemData } = data;

    // Create item with images and AI data in a transaction
    const item = await prisma.$transaction(async (tx) => {
      // Create the item
      const newItem = await tx.inventoryItem.create({
        data: {
          ...itemData,
          price: itemData.price,
        },
      });

      // Create images if provided
      if (images && images.length > 0) {
        await tx.inventoryImage.createMany({
          data: images.map((url, index) => ({
            itemId: newItem.id,
            url,
            order: index,
          })),
        });
      }

      // Create AI data if provided
      if (aiData) {
        await tx.aIData.create({
          data: {
            itemId: newItem.id,
            recognizedItem: aiData.recognizedItem || '',
            confidence: aiData.confidence || 0,
            marketPrice: aiData.marketPrice || 0,
            suggestedPrice: aiData.suggestedPrice || 0,
            description: aiData.description || '',
            category: aiData.category || '',
            condition: aiData.condition || 'used',
            brand: aiData.brand,
            model: aiData.model,
            year: aiData.year,
            color: aiData.color,
            size: aiData.size,
            dimensions: aiData.dimensions as any,
            specifications: aiData.specifications as any,
            similarItems: aiData.similarItems as any,
            researchNotes: aiData.researchNotes,
          },
        });
      }

      return newItem;
    });

    // Fetch the complete item with relations
    return this.getItemById(item.id, data.userId) as Promise<InventoryItemWithRelations>;
  }

  /**
   * Update inventory item
   */
  async updateItem(
    itemId: string,
    userId: string,
    data: UpdateInventoryItemData
  ): Promise<InventoryItemWithRelations> {
    // Verify ownership
    const existingItem = await prisma.inventoryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!existingItem) {
      throw new Error('Item not found or access denied');
    }

    const { images, aiData, ...updateData } = data;

    // Update in transaction
    await prisma.$transaction(async (tx) => {
      // Update item
      const updatePayload: any = {};
      if (updateData.title) updatePayload.title = updateData.title;
      if (updateData.description) updatePayload.description = updateData.description;
      if (updateData.price !== undefined) updatePayload.price = updateData.price;
      if (updateData.condition) updatePayload.condition = updateData.condition;
      if (updateData.category) updatePayload.category = updateData.category;
      if (updateData.status) {
        updatePayload.status = updateData.status;
        if (updateData.status === 'sold') {
          updatePayload.soldAt = new Date();
        }
      }

      if (Object.keys(updatePayload).length > 0) {
        await tx.inventoryItem.update({
          where: { id: itemId },
          data: updatePayload,
        });
      }

      // Update images if provided
      if (images) {
        // Delete existing images
        await tx.inventoryImage.deleteMany({
          where: { itemId },
        });

        // Create new images
        if (images.length > 0) {
          await tx.inventoryImage.createMany({
            data: images.map((url, index) => ({
              itemId,
              url,
              order: index,
            })),
          });
        }
      }

      // Update AI data if provided
      if (aiData) {
        await tx.aIData.upsert({
          where: { itemId },
          update: {
            ...(aiData.recognizedItem && { recognizedItem: aiData.recognizedItem }),
            ...(aiData.confidence !== undefined && { confidence: aiData.confidence }),
            ...(aiData.marketPrice !== undefined && { marketPrice: aiData.marketPrice }),
            ...(aiData.suggestedPrice !== undefined && { suggestedPrice: aiData.suggestedPrice }),
            ...(aiData.description && { description: aiData.description }),
            ...(aiData.category && { category: aiData.category }),
            ...(aiData.condition && { condition: aiData.condition }),
            ...(aiData.brand !== undefined && { brand: aiData.brand }),
            ...(aiData.model !== undefined && { model: aiData.model }),
            ...(aiData.year !== undefined && { year: aiData.year }),
            ...(aiData.color !== undefined && { color: aiData.color }),
            ...(aiData.size !== undefined && { size: aiData.size }),
            ...(aiData.dimensions && { dimensions: aiData.dimensions as any }),
            ...(aiData.specifications && { specifications: aiData.specifications as any }),
            ...(aiData.similarItems && { similarItems: aiData.similarItems as any }),
            ...(aiData.researchNotes !== undefined && { researchNotes: aiData.researchNotes }),
          },
          create: {
            itemId,
            recognizedItem: aiData.recognizedItem || '',
            confidence: aiData.confidence || 0,
            marketPrice: aiData.marketPrice || 0,
            suggestedPrice: aiData.suggestedPrice || 0,
            description: aiData.description || '',
            category: aiData.category || '',
            condition: aiData.condition || 'used',
            brand: aiData.brand,
            model: aiData.model,
            year: aiData.year,
            color: aiData.color,
            size: aiData.size,
            dimensions: aiData.dimensions as any,
            specifications: aiData.specifications as any,
            similarItems: aiData.similarItems as any,
            researchNotes: aiData.researchNotes,
          },
        });
      }
    });

    // Fetch updated item
    return this.getItemById(itemId, userId) as Promise<InventoryItemWithRelations>;
  }

  /**
   * Delete inventory item
   */
  async deleteItem(itemId: string, userId: string): Promise<void> {
    // Verify ownership
    const item = await prisma.inventoryItem.findFirst({
      where: { id: itemId, userId },
    });

    if (!item) {
      throw new Error('Item not found or access denied');
    }

    // Delete item (cascade will handle related records)
    await prisma.inventoryItem.delete({
      where: { id: itemId },
    });
  }

  /**
   * Mark item as sold
   */
  async markAsSold(itemId: string, userId: string): Promise<InventoryItemWithRelations> {
    return this.updateItem(itemId, userId, {
      status: 'sold',
    });
  }

  /**
   * Bulk delete items
   */
  async bulkDelete(itemIds: string[], userId: string): Promise<void> {
    await prisma.inventoryItem.deleteMany({
      where: {
        id: { in: itemIds },
        userId, // Ensure user owns all items
      },
    });
  }

  /**
   * Bulk mark as sold
   */
  async bulkMarkAsSold(itemIds: string[], userId: string): Promise<void> {
    await prisma.inventoryItem.updateMany({
      where: {
        id: { in: itemIds },
        userId,
      },
      data: {
        status: 'sold',
        soldAt: new Date(),
      },
    });
  }
}

export const inventoryService = new InventoryService();

