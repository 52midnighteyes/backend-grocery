import type { NextFunction, Request, Response } from "express";
import {
  getCategoriesService,
  getCategoryByIdService,
} from "./category.service.js";
import type {
  TCategoryIdParam,
  TGetCategoriesQuery,
} from "./category.schemas.js";

export const getCategoriesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCategoriesService(
      req.validated?.query as TGetCategoriesQuery,
    );

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TCategoryIdParam;
    const category = await getCategoryByIdService(id);

    return res.status(200).json({
      message: "Category fetched successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
