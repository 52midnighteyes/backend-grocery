import type { NextFunction, Request, Response } from "express";
import {
  createAdminAccountService,
  deleteAdminAccountService,
  getAdminAccountService,
  getAdminAccountsService,
  updateAdminAccountService,
} from "./adminManagement.service.js";
import type {
  TAdminAccountIdParam,
  TCreateAdminAccountBody,
  TGetAdminAccountsQuery,
  TUpdateAdminAccountBody,
} from "./adminManagement.schemas.js";

export const createAdminAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const adminAccount = await createAdminAccountService(
      req.validated?.body as TCreateAdminAccountBody,
    );

    return res.status(201).json({
      message: "Admin account created successfully",
      data: adminAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAccountsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getAdminAccountsService(
      req.validated?.query as TGetAdminAccountsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Admin accounts fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminAccountIdParam;
    const adminAccount = await getAdminAccountService(id, req.user!.id);

    return res.status(200).json({
      message: "Admin account fetched successfully",
      data: adminAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const updateAdminAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminAccountIdParam;
    const adminAccount = await updateAdminAccountService(
      id,
      req.validated?.body as TUpdateAdminAccountBody,
    );

    return res.status(200).json({
      message: "Admin account updated successfully",
      data: adminAccount,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAdminAccountController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TAdminAccountIdParam;
    const data = await deleteAdminAccountService(id);

    return res.status(200).json({
      message: "Admin account deleted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
