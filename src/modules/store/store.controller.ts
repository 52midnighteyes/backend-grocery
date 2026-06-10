import type { NextFunction, Request, Response } from "express";
import {
  getMainStoreService,
  getNearestStoreService,
  getStoreByIdService,
  getStoreOptionsService,
  getStoresService,
} from "./store.service.js";
import type {
  TGetNearestStoreQuery,
  TGetStoresQuery,
  TStoreIdParam,
} from "./store.schemas.js";

export const getStoresController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getStoresService(
      req.validated?.query as TGetStoresQuery
    );

    return res.status(200).json({
      message: "Stores fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreOptionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stores = await getStoreOptionsService();

    return res.status(200).json({
      message: "Store options fetched successfully",
      data: stores,
    });
  } catch (error) {
    next(error);
  }
};

export const getNearestStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { lat, lng } = req.validated?.query as TGetNearestStoreQuery;
    const result = await getNearestStoreService(lat, lng);

    return res.status(200).json({
      message: "Nearest store fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getMainStoreController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await getMainStoreService();

    return res.status(200).json({
      message: "Main store fetched successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TStoreIdParam;
    const store = await getStoreByIdService(id);

    return res.status(200).json({
      message: "Store fetched successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};
