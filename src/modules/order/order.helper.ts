import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import {
  createStockHistory,
  updateStoreStockQuantity,
} from "../stock/stock.repository.js";
import { createDiscountHistory } from "./order.repository.js";

export type ItemWithPrice = {
  productId: string;
  quantity: number;
  discountId?: string;
  name: string;
  totalPrice: number;
  stockId: string;
  stockBefore: number;
};

export function calcVoucherDiscount(
  discountType: string,
  value: number,
  amount: number,
  maxDiscount?: number | null,
): number {
  const raw =
    discountType === "percentage" ? Math.floor((amount * value) / 100) : value;
  return maxDiscount ? Math.min(raw, maxDiscount) : raw;
}

export async function recordSaleHistory(
  items: ItemWithPrice[],
  storeId: string,
  transactionId: string,
  tx: TPrisma,
) {
  for (const item of items) {
    const stockAfter = item.stockBefore - item.quantity;

    await updateStoreStockQuantity(item.stockId, stockAfter, tx);
    await createStockHistory(
      {
        name: item.name,
        quantity: item.quantity,
        stockBefore: item.stockBefore,
        stockAfter,
        product: { connect: { id: item.productId } },
        store: { connect: { id: storeId } },
        transaction: { connect: { id: transactionId } },
        type: "sale",
        notes: "Pembelian oleh user",
      },
      tx,
    );

    if (item.discountId) {
      await createDiscountHistory(
        { transactionId, discountId: item.discountId },
        tx,
      );
    }
  }
}