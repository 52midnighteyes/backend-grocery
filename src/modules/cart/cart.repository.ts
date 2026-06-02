import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";
import type { TAddToCartPayload, TUpdateCartPayload } from "./cart.types.js";

export const findCartByUserId = async (
  userId: string,
  db: TPrisma = prisma,
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

export const upsertCartItem = async (
  cartId: string,
  payload: TAddToCartPayload,
  db: TPrisma = prisma,
) => {
  return db.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId,
        productId: payload.productId,
      },
    },
    update: {
      quantity: { increment: payload.quantity },
    },
    create: {
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