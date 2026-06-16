import type { NextFunction, Request, Response } from "express";
import {
  clearStoreProductStockService,
  createStockMovementService,
  getStoreProductStockMovementsService,
  getStoreStockMovementByIdService,
  getStoreStockByProductSlugService,
  getStoreStockMovementsService,
  getStoreStocksService,
} from "./adminStock.service.js";
import type {
  TClearStockBody,
  TCreateStockMovementBody,
  TGetStockMovementsQuery,
  TGetStoreStocksQuery,
  TStoreProductStockMovementParam,
  TStoreProductStockParam,
  TStoreStockMovementDetailParam,
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

export const getStoreStockMovementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = req.validated?.params as TStoreStockParam;
    const result = await getStoreStockMovementsService(
      storeId,
      req.validated?.query as TGetStockMovementsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store stock movements fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreStockMovementByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, historyId } = req.validated
      ?.params as TStoreStockMovementDetailParam;
    const history = await getStoreStockMovementByIdService(
      storeId,
      historyId,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store stock movement fetched successfully",
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreProductStockMovementsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, productId } = req.validated
      ?.params as TStoreProductStockMovementParam;
    const result = await getStoreProductStockMovementsService(
      storeId,
      productId,
      req.validated?.query as TGetStockMovementsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store product stock movements fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const createStockMovementController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, productId } = req.validated
      ?.params as TStoreProductStockMovementParam;
    const result = await createStockMovementService(
      storeId,
      productId,
      req.validated?.body as TCreateStockMovementBody,
      req.user!.id,
    );

    return res.status(201).json({
      message: "Stock movement created successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const clearStoreProductStockController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, productId } = req.validated
      ?.params as TStoreProductStockMovementParam;
    const result = await clearStoreProductStockService(
      storeId,
      productId,
      req.validated?.body as TClearStockBody,
      req.user!.id,
    );

    return res.status(201).json({
      message: "Stock cleared successfully",
      data: result,
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
