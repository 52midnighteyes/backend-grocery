import type { NextFunction, Request, Response } from "express";
import {
  createProductService,
  deleteProductImageService,
  deleteProductService,
  getAdminProductsService,
  getScopedAdminProductBySlugService,
  patchProductImagesService,
  updateProductImagePositionsService,
  updateProductService,
} from "./adminProduct.service.js";
import type {
  TCreateProductBody,
  TGetProductsQuery,
  TProductSlugParam,
  TUpdateProductBody,
  TUpdateProductImagePositionsBody,
} from "../product/product.schemas.js";
import type {
  TPatchProductImagesBody,
  TProductImageParam,
} from "./adminProduct.schemas.js";
import type { TProductImageUploadFiles } from "./adminProduct.models.js";

export const createProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const files = Array.isArray(req.files)
      ? (req.files as TProductImageUploadFiles)
      : [];
    const product = await createProductService(
      req.validated?.body as TCreateProductBody,
      files,
    );

    return res.status(201).json({
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAdminProductsService(
      req.validated?.query as TGetProductsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Admin products fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await updateProductService(
      slug,
      req.validated?.body as TUpdateProductBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProductImagePositionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await updateProductImagePositionsService(
      slug,
      req.validated?.body as TUpdateProductImagePositionsBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product image positions updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const patchProductImagesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const files = Array.isArray(req.files)
      ? (req.files as TProductImageUploadFiles)
      : [];
    const product = await patchProductImagesService(
      slug,
      req.validated?.body as TPatchProductImagesBody,
      files,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product images updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProductBySlugController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await getScopedAdminProductBySlugService(
      slug,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Admin product fetched successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug } = req.validated?.params as TProductSlugParam;
    const product = await deleteProductService(slug, req.user!.id);

    return res.status(200).json({
      message: "Product deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteProductImageController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { slug, imageId } = req.validated?.params as TProductImageParam;
    const product = await deleteProductImageService(slug, imageId, req.user!.id);

    return res.status(200).json({
      message: "Product image deleted successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};
