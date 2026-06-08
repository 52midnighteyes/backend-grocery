import type { NextFunction, Request, Response } from "express";
import {
  getStoreByIdService,
  getStoreOptionsService,
  getStoresService,
} from "./store.service.js";
import type { TGetStoresQuery, TStoreIdParam } from "./store.schemas.js";

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
