import type { Request, Response, NextFunction } from "express";
import { getShippingCostService } from "./shipping.service.js";
import type { TShippingCostQuery } from "./shipping.schemas.js";

export const getShippingCostController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { addressId } = req.validated?.query as TShippingCostQuery;

    const result = await getShippingCostService(userId, addressId);

    res.status(200).json({
      message: "Shipping cost calculated successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};