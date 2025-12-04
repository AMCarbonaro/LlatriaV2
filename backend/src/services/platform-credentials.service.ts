// Platform credentials management service
import { prisma } from '../lib/prisma';
import { Platform } from '@prisma/client';

interface PlatformCredentials {
  userId: string;
  platform: Platform;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

class PlatformCredentialsService {
  /**
   * Save platform credentials
   */
  async saveCredentials(
    userId: string,
    platform: Platform,
    credentials: {
      accessToken: string;
      refreshToken?: string;
      expiresAt?: Date;
      metadata?: Record<string, any>;
    }
  ): Promise<void> {
    await prisma.platformCredential.upsert({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      update: {
        accessToken: credentials.accessToken, // TODO: Encrypt in production
        refreshToken: credentials.refreshToken, // TODO: Encrypt in production
        expiresAt: credentials.expiresAt,
        metadata: credentials.metadata as any,
        isActive: true,
      },
      create: {
        userId,
        platform,
        accessToken: credentials.accessToken, // TODO: Encrypt in production
        refreshToken: credentials.refreshToken, // TODO: Encrypt in production
        expiresAt: credentials.expiresAt,
        metadata: credentials.metadata as any,
        isActive: true,
      },
    });
  }

  /**
   * Get platform credentials
   */
  async getCredentials(
    userId: string,
    platform: Platform
  ): Promise<PlatformCredentials | null> {
    const creds = await prisma.platformCredential.findUnique({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
    });

    if (!creds || !creds.isActive) {
      return null;
    }

    // Check if token is expired
    if (creds.expiresAt && creds.expiresAt < new Date()) {
      // Token expired, but return it anyway (caller should refresh)
      return {
        userId: creds.userId,
        platform: creds.platform,
        accessToken: creds.accessToken,
        refreshToken: creds.refreshToken || undefined,
        expiresAt: creds.expiresAt || undefined,
        metadata: creds.metadata as any,
        createdAt: creds.createdAt,
        updatedAt: creds.updatedAt,
      };
    }

    return {
      userId: creds.userId,
      platform: creds.platform,
      accessToken: creds.accessToken,
      refreshToken: creds.refreshToken || undefined,
      expiresAt: creds.expiresAt || undefined,
      metadata: creds.metadata as any,
      createdAt: creds.createdAt,
      updatedAt: creds.updatedAt,
    };
  }

  /**
   * Delete platform credentials
   */
  async deleteCredentials(
    userId: string,
    platform: Platform
  ): Promise<void> {
    await prisma.platformCredential.updateMany({
      where: {
        userId,
        platform,
      },
      data: {
        isActive: false,
      },
    });
  }

  /**
   * Check if platform is connected
   */
  async isConnected(userId: string, platform: Platform): Promise<boolean> {
    const creds = await this.getCredentials(userId, platform);
    if (!creds) return false;

    // Check if token is still valid
    if (creds.expiresAt && creds.expiresAt < new Date()) {
      return false; // Expired
    }

    return true;
  }
}

export const platformCredentialsService = new PlatformCredentialsService();

