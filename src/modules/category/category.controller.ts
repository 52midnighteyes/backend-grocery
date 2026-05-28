import type { NextFunction, Request, Response } from "express";
import { getCategoriesService } from "./category.service.js";

export const getCategoriesController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const categories = await getCategoriesService();

    return res.status(200).json({
      message: "Categories fetched successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};
