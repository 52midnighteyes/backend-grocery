import type { NextFunction, Request, Response } from "express";
import {
  getAdminProductBySlugService,
  getProductBySlugService,
  getProductsService,
} from "./product.service.js";
import type {
  TGetProductBySlugQuery,
  TGetProductsQuery,
  TProductSlugParam,
} from "./product.schemas.js";

export const getProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getProductsService(
      req.validated?.query as TGetProductsQuery,
    );

    return res.status(200).json({
      message: "Products fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await getProductBySlugService(
      slug,
      req.validated?.query as TGetProductBySlugQuery,
    );

    return res.status(200).json({
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await getAdminProductBySlugService(slug);

    return res.status(200).json({
      message: "Admin product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
