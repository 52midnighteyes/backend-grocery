import type { NextFunction, Request, Response } from "express";
import {
  createDiscountService,
  deleteDiscountService,
  getDiscountService,
  getDiscountsService,
  updateDiscountService,
} from "./adminDiscount.service.js";
import type {
  TCreateDiscountBody,
  TDiscountIdParam,
  TGetDiscountsQuery,
  TUpdateDiscountBody,
} from "./adminDiscount.schemas.js";

export const getDiscountsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getDiscountsService(
      req.validated?.query as TGetDiscountsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Discounts fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TDiscountIdParam;
    const discount = await getDiscountService(id, req.user!.id);

    return res.status(200).json({
      message: "Discount fetched successfully",
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};

export const createDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const discount = await createDiscountService(
      req.validated?.body as TCreateDiscountBody,
      req.user!.id,
    );

    return res.status(201).json({
      message: "Discount created successfully",
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};

export const updateDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TDiscountIdParam;
    const discount = await updateDiscountService(
      id,
      req.validated?.body as TUpdateDiscountBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Discount updated successfully",
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteDiscountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TDiscountIdParam;
    const discount = await deleteDiscountService(id, req.user!.id);

    return res.status(200).json({
      message: "Discount deleted successfully",
      data: discount,
    });
  } catch (error) {
    next(error);
  }
};
