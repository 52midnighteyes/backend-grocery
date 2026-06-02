import type { NextFunction, Request, Response } from "express";
import { getRoleByIdService, getRolesService } from "./role.service.js";
import type { TRoleIdParam } from "./role.schemas.js";

export const getRolesController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const roles = await getRolesService();

    return res.status(200).json({
      message: "Roles fetched successfully",
      data: roles,
    });
  } catch (error) {
    next(error);
  }
};

export const getRoleByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TRoleIdParam;
    const role = await getRoleByIdService(id);

    return res.status(200).json({
      message: "Role fetched successfully",
      data: role,
    });
  } catch (error) {
    next(error);
  }
};
