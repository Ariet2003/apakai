/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN "isAvailable" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "Product" ADD COLUMN "slug" TEXT;

-- Update existing products with slugs based on their IDs
UPDATE "Product" SET "slug" = CONCAT('product-', id);

-- Make slug required
ALTER TABLE "Product" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
