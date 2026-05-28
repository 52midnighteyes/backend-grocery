import type { NextFunction, Request, Response } from "express";
import { createProductService } from "./product.service.js";
import { TCreateProductParams } from "./products/product.schemas.js";

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    const product = await createProductService({
      ...(req.validated?.body as TCreateProductParams),
      files,
    });

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
