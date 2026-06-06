import type { NextFunction, Request, Response } from "express";
import {
  getAdminDashboardSummaryService,
  getStoreDashboardSummaryService,
} from "./adminDashboard.service.js";
import type { TDashboardStoreIdParam } from "./adminDashboard.schemas.js";

export const getAdminDashboardSummaryController = async (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const data = await getAdminDashboardSummaryService();

    return res.status(200).json({
      message: "Admin dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreDashboardSummaryController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TDashboardStoreIdParam;
    const data = await getStoreDashboardSummaryService(id, req.user!.id);

    return res.status(200).json({
      message: "Store dashboard summary fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
