import type { NextFunction, Request, Response } from "express";
import {
  getDiscountReportsService,
  getVoucherReportsService,
} from "./adminPromoReport.service.js";
import type {
  TGetDiscountReportsQuery,
  TGetVoucherReportsQuery,
} from "./adminPromoReport.schemas.js";

export const getDiscountReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getDiscountReportsService(
      req.validated?.query as TGetDiscountReportsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Discount promo reports fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoucherReportsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getVoucherReportsService(
      req.validated?.query as TGetVoucherReportsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Voucher promo reports fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};
