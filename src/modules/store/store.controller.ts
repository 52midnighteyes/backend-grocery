import type { NextFunction, Request, Response } from "express";
import {
  createStoreService,
  deleteStoreService,
  getStoreByIdService,
  getStoresService,
  updateStoreService,
} from "./store.service.js";
import type {
  TCreateStoreBody,
  TGetStoresQuery,
  TStoreIdParam,
  TUpdateStoreBody,
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

export const createStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const store = await createStoreService(
      req.validated?.body as TCreateStoreBody
    );

    return res.status(201).json({
      message: "Store created successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

export const updateStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TStoreIdParam;
    const store = await updateStoreService(
      id,
      req.validated?.body as TUpdateStoreBody
    );

    return res.status(200).json({
      message: "Store updated successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TStoreIdParam;
    await deleteStoreService(id);

    return res.status(200).json({
      message: "Store deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
