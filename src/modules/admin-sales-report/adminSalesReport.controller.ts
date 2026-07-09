import type { NextFunction, Request, Response } from "express";
import {
  getCategorySalesReportService,
  getCategoryTrendReportService,
  getProductRankingSalesReportService,
  getProductSalesReportService,
  getProductTrendReportService,
  getSalesReportService,
  getTransactionSalesReportExportService,
  getTransactionSalesReportService,
} from "./adminSalesReport.service.js";
import type {
  TSalesReportCategoryIdParam,
  TSalesReportProductIdParam,
  TSalesReportProductRankingQuery,
  TSalesReportProductTrendQuery,
  TSalesReportQuery,
  TSalesReportTransactionExportQuery,
  TSalesReportTransactionQuery,
} from "./adminSalesReport.schemas.js";

export const getSalesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getSalesReportService(
      req.validated?.query as TSalesReportQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Sales report fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategorySalesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCategorySalesReportService(
      req.validated?.query as TSalesReportQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Category sales report fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductSalesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getProductSalesReportService(
      req.validated?.query as TSalesReportProductTrendQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product sales report fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductRankingSalesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getProductRankingSalesReportService(
      req.validated?.query as TSalesReportProductRankingQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product ranking sales report fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getProductTrendReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getProductTrendReportService(
      req.validated?.query as TSalesReportQuery,
      req.validated?.params as TSalesReportProductIdParam,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Product sales trend report fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getCategoryTrendReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getCategoryTrendReportService(
      req.validated?.query as TSalesReportQuery,
      req.validated?.params as TSalesReportCategoryIdParam,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Category sales trend report fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionSalesReportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getTransactionSalesReportService(
      req.validated?.query as TSalesReportTransactionQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Transaction sales report fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getTransactionSalesReportExportController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getTransactionSalesReportExportService(
      req.validated?.query as TSalesReportTransactionExportQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Transaction sales report export fetched successfully",
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};
