-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('new', 'like_new', 'used', 'fair', 'poor');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('active', 'sold', 'draft');

-- CreateEnum
CREATE TYPE "Platform" AS ENUM ('facebook', 'ebay', 'website');

-- CreateEnum
CREATE TYPE "PostingStatus" AS ENUM ('idle', 'posting', 'posted', 'error');

-- CreateEnum
CREATE TYPE "SyncEventType" AS ENUM ('create', 'update', 'delete');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "category" TEXT NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3),

    CONSTRAINT "inventory_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_images" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_data" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "recognized_item" TEXT NOT NULL,
    "confidence" DECIMAL(3,2) NOT NULL,
    "market_price" DECIMAL(10,2) NOT NULL,
    "suggested_price" DECIMAL(10,2) NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "brand" TEXT,
    "model" TEXT,
    "year" INTEGER,
    "color" TEXT,
    "size" TEXT,
    "dimensions" JSONB,
    "specifications" JSONB,
    "similar_items" JSONB,
    "research_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_postings" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "status" "PostingStatus" NOT NULL DEFAULT 'idle',
    "external_id" TEXT,
    "external_url" TEXT,
    "error_message" TEXT,
    "posted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_postings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_credentials" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "platform" "Platform" NOT NULL,
    "access_token" TEXT NOT NULL,
    "refresh_token" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_credentials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "device_id" TEXT NOT NULL,
    "event_type" "SyncEventType" NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "synced" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "sync_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "inventory_items_user_id_idx" ON "inventory_items"("user_id");

-- CreateIndex
CREATE INDEX "inventory_items_status_idx" ON "inventory_items"("status");

-- CreateIndex
CREATE INDEX "inventory_items_category_idx" ON "inventory_items"("category");

-- CreateIndex
CREATE INDEX "inventory_images_item_id_idx" ON "inventory_images"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "ai_data_item_id_key" ON "ai_data"("item_id");

-- CreateIndex
CREATE INDEX "platform_postings_item_id_idx" ON "platform_postings"("item_id");

-- CreateIndex
CREATE INDEX "platform_postings_platform_idx" ON "platform_postings"("platform");

-- CreateIndex
CREATE INDEX "platform_postings_status_idx" ON "platform_postings"("status");

-- CreateIndex
CREATE UNIQUE INDEX "platform_postings_item_id_platform_key" ON "platform_postings"("item_id", "platform");

-- CreateIndex
CREATE INDEX "platform_credentials_user_id_idx" ON "platform_credentials"("user_id");

-- CreateIndex
CREATE INDEX "platform_credentials_platform_idx" ON "platform_credentials"("platform");

-- CreateIndex
CREATE UNIQUE INDEX "platform_credentials_user_id_platform_key" ON "platform_credentials"("user_id", "platform");

-- CreateIndex
CREATE INDEX "sync_events_user_id_idx" ON "sync_events"("user_id");

-- CreateIndex
CREATE INDEX "sync_events_device_id_idx" ON "sync_events"("device_id");

-- CreateIndex
CREATE INDEX "sync_events_synced_idx" ON "sync_events"("synced");

-- CreateIndex
CREATE INDEX "sync_events_timestamp_idx" ON "sync_events"("timestamp");

-- AddForeignKey
ALTER TABLE "inventory_items" ADD CONSTRAINT "inventory_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_images" ADD CONSTRAINT "inventory_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_data" ADD CONSTRAINT "ai_data_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_postings" ADD CONSTRAINT "platform_postings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "inventory_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "platform_credentials" ADD CONSTRAINT "platform_credentials_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sync_events" ADD CONSTRAINT "sync_events_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
