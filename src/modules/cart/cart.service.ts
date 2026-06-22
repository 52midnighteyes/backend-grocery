import { AppError } from "../../class/appError.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import {
  createCart,
  findCartByUserId,
  findCartItemById,
  findCartItemByProductId,
  findProductStockByStore,
  softDeleteCartItem,
  updateCartItemQuantity,
  upsertCartItem,
} from "./cart.repository.js";
import type { TAddToCartPayload, TUpdateCartPayload } from "./cart.types.js";

export const getCartService = async (userId: string, storeId?: string) => {
  const cart = await findCartByUserId(userId, undefined, storeId);

  if (!cart) {
    return { items: [] };
  }

  return cart;
};

export const addToCartService = async (
  userId: string,
  payload: TAddToCartPayload,
) => {
  const { productId, quantity, storeId } = payload;

  await prisma.$transaction(async (tx) => {
    const stock = await findProductStockByStore(productId, storeId, tx);

    if (!stock) {
      throw new AppError(404, "Product is not available in this store");
    }

    if (stock.stock < quantity) {
      throw new AppError(400, "Insufficient stock");
    }

    const existingCart = await findCartByUserId(userId, tx);
    const cart = existingCart ?? (await createCart(userId, tx));

    const existingItem = await findCartItemByProductId(cart.id, productId, tx);
    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (stock.stock < newQuantity) {
      throw new AppError(400, "Insufficient stock");
    }

    await upsertCartItem(cart.id, payload, tx);
  });
};

export const updateCartService = async (
  userId: string,
  cartItemId: string,
  payload: TUpdateCartPayload,
) => {
  const cartItem = await findCartItemById(cartItemId);

  if (!cartItem) {
    throw new AppError(404, "Cart item not found");
  }

  const cart = await findCartByUserId(userId);

  if (!cart || cartItem.cartId !== cart.id) {
    throw new AppError(403, "Forbidden");
  }

  await updateCartItemQuantity(cartItemId, payload);
};

export const deleteCartItemService = async (
  userId: string,
  cartItemId: string,
) => {
  const cartItem = await findCartItemById(cartItemId);

  if (!cartItem) {
    throw new AppError(404, "Cart item not found");
  }

  const cart = await findCartByUserId(userId);

  if (!cart || cartItem.cartId !== cart.id) {
    throw new AppError(403, "Forbidden");
  }

  await softDeleteCartItem(cartItemId);
};