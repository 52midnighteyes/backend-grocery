import type { NextFunction, Request, Response } from "express";
import {
  createCategoryService,
  deleteCategoryService,
  updateCategoryService,
} from "./adminCategory.service.js";
import type {
  TAdminCategoryIdParam,
  TCreateCategoryBody,
  TUpdateCategoryBody,
} from "./adminCategory.schemas.js";

export const createCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const category = await createCategoryService(
      req.validated?.body as TCreateCategoryBody,
    );

    return res.status(201).json({
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminCategoryIdParam;
    const category = await updateCategoryService(
      id,
      req.validated?.body as TUpdateCategoryBody,
    );

    return res.status(200).json({
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteCategoryController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminCategoryIdParam;
    const category = await deleteCategoryService(id);

    return res.status(200).json({
      message: "Category deleted successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};
