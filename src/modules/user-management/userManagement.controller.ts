import type { NextFunction, Request, Response } from "express";
import {
  getManagedUserByIdService,
  getManagedUsersService,
} from "./userManagement.service.js";
import type {
  TGetManagedUsersQuery,
  TManagedUserIdParam,
} from "./userManagement.schemas.js";

export const getManagedUsersController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await getManagedUsersService(
      req.validated?.query as TGetManagedUsersQuery
    );

    return res.status(200).json({
      message: "Users fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getManagedUserByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.validated?.params as TManagedUserIdParam;
    const user = await getManagedUserByIdService(id);

    return res.status(200).json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
