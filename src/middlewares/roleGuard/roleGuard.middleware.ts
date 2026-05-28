import { NextFunction, Request, Response } from "express";
import { findUserPermission } from "./roleGuard.repository.js";
import { AppError } from "../../class/appError.js";

export const roleGuard = async (requiredPermission: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId)
        throw new AppError(
          401,
          "you need to be authenticated to access this resource"
        );
      const user = await findUserPermission(userId);
      if (!user) throw new AppError(401, "your credential is not valid");

      const permission = user.role.rolePermissions.map(
        (a) => a.permission.name
      );

      if (!permission.includes(requiredPermission)) {
        throw new AppError(
          403,
          "you don't have permission to access this resource"
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
