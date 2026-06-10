import type { NextFunction, Request, Response } from "express";
import {
  getProductBySlugService,
  getProductsService,
  getStoreScopedProductBySlugService,
  getStoreScopedProductsService,
} from "./product.service.js";
import type {
  TGetProductBySlugQuery,
  TGetProductsQuery,
  TGetStoreScopedProductsQuery,
  TProductSlugParam,
  TStoreProductSlugParam,
  TStoreProductsParam,
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

export const getStoreScopedProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = req.validated?.params as TStoreProductsParam;
    const result = await getStoreScopedProductsService(
      storeId,
      req.validated?.query as TGetStoreScopedProductsQuery,
    );

    return res.status(200).json({
      message: "Store products fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreScopedProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, slug } = req.validated?.params as TStoreProductSlugParam;
    const product = await getStoreScopedProductBySlugService(storeId, slug);

    return res.status(200).json({
      message: "Store product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
