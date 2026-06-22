import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TAddToCartPayload, TUpdateCartPayload } from "./cart.types.js";

export const findCartByUserId = async (
  userId: string,
  db: TPrisma = prisma,
  storeId?: string,
) => {
  return db.cart.findUnique({
    where: { userId },
    include: {
      items: {
        where: { deletedAt: null },
        include: {
          product: {
            include: {
              images: { where: { deletedAt: null } },
              stocks: { where: { deletedAt: null } },
              discounts: {
                where: {
                  deletedAt: null,
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                  ...(storeId ? { storeId } : {}),
                },
              },
            },
          },
        },
      },
    },
  });
};

export const findCartItemById = async (
  cartItemId: string,
  db: TPrisma = prisma,
) => {
  return db.cartItem.findFirst({
    where: { id: cartItemId, deletedAt: null },
    include: { product: true },
  });
};

export const findCartItemByProductId = async (
  cartId: string,
  productId: string,
  db: TPrisma = prisma,
) => {
  return db.cartItem.findFirst({
    where: { cartId, productId, deletedAt: null },
  });
};

// Cek keberadaan item termasuk yang soft-deleted.
// Dipakai oleh upsertCartItem untuk memutuskan restore atau create baru.
export const findCartItemByProductIdIncludeDeleted = async (
  cartId: string,
  productId: string,
  db: TPrisma = prisma,
) => {
  return db.cartItem.findFirst({
    where: { cartId, productId },
  });
};

export const findProductStockByStore = async (
  productId: string,
  storeId: string,
  db: TPrisma = prisma,
) => {
  return db.productStock.findFirst({
    where: { productId, storeId, deletedAt: null },
  });
};

export const createCart = async (userId: string, db: TPrisma = prisma) => {
  return db.cart.create({
    data: { userId },
  });
};

// Menggantikan Prisma upsert karena upsert tidak restore deletedAt.
// Alurnya:
// 1. Cek apakah ada row untuk cartId + productId (termasuk soft-deleted)
// 2. Kalau ada (deleted atau tidak) -> restore deletedAt ke null dan increment quantity
// 3. Kalau tidak ada sama sekali -> create baru
export const upsertCartItem = async (
  cartId: string,
  payload: TAddToCartPayload,
  db: TPrisma = prisma,
) => {
  const existing = await findCartItemByProductIdIncludeDeleted(
    cartId,
    payload.productId,
    db,
  );

  if (existing) {
    return db.cartItem.update({
      where: { id: existing.id },
      data: {
        quantity: existing.deletedAt ? payload.quantity : existing.quantity + payload.quantity,
        deletedAt: null,
      },
    });
  }

  return db.cartItem.create({
    data: {
      cartId,
      productId: payload.productId,
      quantity: payload.quantity,
    },
  });
};

export const updateCartItemQuantity = async (
  cartItemId: string,
  payload: TUpdateCartPayload,
  db: TPrisma = prisma,
) => {
  return db.cartItem.update({
    where: { id: cartItemId },
    data: { quantity: payload.quantity },
  });
};

export const softDeleteCartItem = async (
  cartItemId: string,
  db: TPrisma = prisma,
) => {
  return db.cartItem.update({
    where: { id: cartItemId },
    data: { deletedAt: new Date() },
  });
};
// Hard delete semua cart items milik user setelah order berhasil dibuat.
// Pakai deleteMany langsung tanpa soft delete karena items sudah pindah ke order.
export const hardDeleteCartItemsByUserId = async (
  userId: string,
  db: TPrisma = prisma,
) => {
  const cart = await db.cart.findUnique({ where: { userId } });
  if (!cart) return;
  return db.cartItem.deleteMany({
    where: { cartId: cart.id },
  });
};

// Cari stok tertinggi yang tersedia untuk sebuah produk di semua toko.
// Dipakai saat update quantity cart untuk validasi batas maksimal.
export const findMaxProductStockForProduct = async (
  productId: string,
  db: TPrisma = prisma,
) => {
  return db.productStock.findFirst({
    where: { productId, deletedAt: null },
    orderBy: { stock: "desc" },
  });
};