import type { NextFunction, Request, Response } from "express";
import {
  createVoucherService,
  deleteVoucherService,
  getVoucherService,
  getVouchersService,
  updateVoucherService,
} from "./adminVoucher.service.js";
import type {
  TCreateVoucherBody,
  TGetVouchersQuery,
  TUpdateVoucherBody,
  TVoucherIdParam,
} from "./adminVoucher.schemas.js";

export const getVouchersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getVouchersService(
      req.validated?.query as TGetVouchersQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Vouchers fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TVoucherIdParam;
    const voucher = await getVoucherService(id, req.user!.id);

    return res.status(200).json({
      message: "Voucher fetched successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const createVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const voucher = await createVoucherService(
      req.validated?.body as TCreateVoucherBody,
      req.user!.id,
    );

    return res.status(201).json({
      message: "Voucher created successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TVoucherIdParam;
    const voucher = await updateVoucherService(
      id,
      req.validated?.body as TUpdateVoucherBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Voucher updated successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVoucherController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TVoucherIdParam;
    const voucher = await deleteVoucherService(id, req.user!.id);

    return res.status(200).json({
      message: "Voucher deleted successfully",
      data: voucher,
    });
  } catch (error) {
    next(error);
  }
};
