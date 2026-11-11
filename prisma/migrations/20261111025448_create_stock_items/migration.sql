-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('RECEIPT', 'ADJUSTMENT', 'RESERVATION', 'RELEASE', 'COMMIT');

-- CreateTable
CREATE TABLE "stock_items" (
    "id" UUID NOT NULL,
    "sku" VARCHAR(20) NOT NULL,
    "on_hand" INTEGER NOT NULL,
    "reserved" INTEGER NOT NULL,
    "minimum_level" INTEGER NOT NULL,

    CONSTRAINT "stock_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" BIGSERIAL NOT NULL,
    "stock_item_id" UUID NOT NULL,
    "type" "StockMovementType" NOT NULL,
    "on_hand_change" INTEGER NOT NULL,
    "reserved_change" INTEGER NOT NULL,
    "reason" TEXT,
    "occurred_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stock_items_sku_key" ON "stock_items"("sku");

-- CreateIndex
CREATE INDEX "stock_movements_stock_item_id_occurred_at_idx" ON "stock_movements"("stock_item_id", "occurred_at");

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_item_id_fkey" FOREIGN KEY ("stock_item_id") REFERENCES "stock_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
