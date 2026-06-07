import type { NextFunction, Request, Response } from "express";
import {
  getStoreStockByProductSlugService,
  getStoreStocksService,
} from "./adminStock.service.js";
import type {
  TGetStoreStocksQuery,
  TStoreProductStockParam,
  TStoreStockParam,
} from "./adminStock.schemas.js";

export const getStoreStocksController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = req.validated?.params as TStoreStockParam;
    const result = await getStoreStocksService(
      storeId,
      req.validated?.query as TGetStoreStocksQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store stocks fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreStockByProductSlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, slug } = req.validated
      ?.params as TStoreProductStockParam;
    const stock = await getStoreStockByProductSlugService(
      storeId,
      slug,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store product stock fetched successfully",
      data: stock,
    });
  } catch (error) {
    next(error);
  }
};
