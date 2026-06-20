import type { NextFunction, Request, Response } from "express";
import { getStoreVouchersService } from "./voucher.service.js";
import type { TStoreVoucherParam } from "./voucher.schemas.js";

export const getStoreVouchersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = req.validated?.params as TStoreVoucherParam;
    const vouchers = await getStoreVouchersService(storeId);

    return res.status(200).json({
      message: "Vouchers fetched successfully",
      data: vouchers,
    });
  } catch (error) {
    next(error);
  }
};
