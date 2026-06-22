import type { NextFunction, Request, Response } from "express";
import {
  createStoreService,
  updateStoreService,
  deleteStoreService,
} from "./adminStore.service.js";
import type {
  TAdminStoreIdParam,
  TCreateStoreBody,
  TUpdateStoreBody,
} from "./adminStore.schemas.js";

export const createStoreController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const store = await createStoreService(
      req.validated?.body as TCreateStoreBody,
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
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminStoreIdParam;
    const store = await updateStoreService(
      id,
      req.validated?.body as TUpdateStoreBody,
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
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminStoreIdParam;
    const store = await deleteStoreService(id);
    return res.status(200).json({
      message: "Store deleted successfully",
      data: store,
    });
  } catch (error) {
    next(error);
  }
};
