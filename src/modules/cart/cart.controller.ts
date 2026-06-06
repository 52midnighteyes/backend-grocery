import type { Request, Response, NextFunction } from "express";
import type { TAddToCartSchema, TCartItemParams, TUpdateCartSchema } from "./cart.schemas.js";
import {
  addToCartService,
  deleteCartItemService,
  getCartService,
  updateCartService,
} from "./cart.service.js";

export const getCartController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const data = await getCartService(userId);

    res.status(200).json({ message: "Cart fetched successfully", data });
  } catch (error) {
    next(error);
  }
};

export const addToCartController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const payload = req.validated?.body as TAddToCartSchema;

    await addToCartService(userId, payload);

    res.status(201).json({ message: "Item added to cart successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateCartController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { cartItemId } = req.validated?.params as TCartItemParams;
    const payload = req.validated?.body as TUpdateCartSchema;

    await updateCartService(userId, cartItemId, payload);

    res.status(200).json({ message: "Cart item updated successfully" });
  } catch (error) {
    next(error);
  }
};

export const deleteCartItemController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { cartItemId } = req.validated?.params as TCartItemParams;

    await deleteCartItemService(userId, cartItemId);

    res.status(200).json({ message: "Cart item deleted successfully" });
  } catch (error) {
    next(error);
  }
};