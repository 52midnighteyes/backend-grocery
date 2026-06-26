import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { DiscountType } from "../../../generated/prisma/enums.js";
import { AppError } from "../../class/appError.js";
import { createStockHistory } from "../stock/stock.repository.js";
import {
  createDiscountHistory,
  decrementProductStockByStockId,
} from "./order.repository.js";

export type ItemWithPrice = {
  productId: string;
  quantity: number;
  discountId?: string;
  name: string;
  totalPrice: number;
  stockId?: string;
  stockBefore: number;
  requiresFulfillment: boolean;
  storeStockAtOrder: number;
  shortageQuantity: number;
  discountSnapshot?: DiscountSnapshot;
  discountQuota: number | null;
};

export type DiscountSnapshot = {
  discountId: string;
  discountName: string;
  discountType: DiscountType;
  discountValue: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  discountAmount: number;
  quotaUsage: number;
};

type DiscountCalculationInput = {
  type: DiscountType;
  value: number | null;
  buyQuantity: number | null;
  getQuantity: number | null;
  price: number;
  quantity: number;
};

export function calcProductDiscount({
  type,
  value,
  buyQuantity,
  getQuantity,
  price,
  quantity,
}: DiscountCalculationInput) {
  const itemSubtotal = price * quantity;

  if (type === "percentage") {
    const discountAmount = Math.floor((itemSubtotal * (value ?? 0)) / 100);
    return {
      itemTotal: Math.max(itemSubtotal - discountAmount, 0),
      discountAmount,
      quotaUsage: discountAmount > 0 ? 1 : 0,
    };
  }

  if (type === "nominal") {
    const discountAmount = Math.min((value ?? 0) * quantity, itemSubtotal);
    return {
      itemTotal: Math.max(itemSubtotal - discountAmount, 0),
      discountAmount,
      quotaUsage: discountAmount > 0 ? 1 : 0,
    };
  }

  const buyQty = buyQuantity ?? 1;
  const getQty = getQuantity ?? 1;
  const groupSize = buyQty + getQty;
  const sets = Math.floor(quantity / groupSize);
  const paidQty = sets * buyQty + Math.min(quantity % groupSize, buyQty);
  const freeQty = quantity - paidQty;
  const discountAmount = freeQty * price;

  return {
    itemTotal: price * paidQty,
    discountAmount,
    quotaUsage: freeQty,
  };
}

export function calcVoucherDiscount(
  discountType: string,
  value: number,
  amount: number,
  maxDiscount?: number | null,
): number {
  const raw =
    discountType === "percentage" ? Math.floor((amount * value) / 100) : value;
  const capped = maxDiscount !== null && maxDiscount !== undefined
    ? Math.min(raw, maxDiscount)
    : raw;
  return Math.min(capped, amount);
}

export async function recordSaleHistory(
  items: ItemWithPrice[],
  storeId: string,
  transactionId: string,
  transactionItems: { id: string }[],
  tx: TPrisma,
) {
  for (const [index, item] of items.entries()) {
    const transactionItemId = transactionItems[index]?.id;

    if (item.requiresFulfillment) {
      if (item.discountSnapshot && transactionItemId) {
        await createDiscountHistory({
          transactionId,
          transactionItemId,
          productId: item.productId,
          storeId,
          discountId: item.discountSnapshot.discountId,
          discountName: item.discountSnapshot.discountName,
          discountType: item.discountSnapshot.discountType,
          discountValue: item.discountSnapshot.discountValue,
          buyQuantity: item.discountSnapshot.buyQuantity,
          getQuantity: item.discountSnapshot.getQuantity,
          discountAmount: item.discountSnapshot.discountAmount,
        }, tx);
      }
      continue;
    }

    if (!item.stockId) continue;

    const stockAfter = item.stockBefore - item.quantity;
    const stockUpdate = await decrementProductStockByStockId(
      item.stockId,
      item.quantity,
      tx,
    );

    if (stockUpdate.count === 0) {
      throw new AppError(400, `Insufficient stock for product: ${item.name}`);
    }

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

    if (item.discountSnapshot && transactionItemId) {
      await createDiscountHistory({
        transactionId,
        transactionItemId,
        productId: item.productId,
        storeId,
        discountId: item.discountSnapshot.discountId,
        discountName: item.discountSnapshot.discountName,
        discountType: item.discountSnapshot.discountType,
        discountValue: item.discountSnapshot.discountValue,
        buyQuantity: item.discountSnapshot.buyQuantity,
        getQuantity: item.discountSnapshot.getQuantity,
        discountAmount: item.discountSnapshot.discountAmount,
      }, tx);
    }
  }
}
