import type { NextFunction, Request, Response } from "express";
import { AppError } from "../class/appError.js";
import type { UserRole } from "../../generated/prisma/enums.js";

export const roleGuard = (...allowedRoles: UserRole[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError(401, "Unauthorized");
      }

      if (!allowedRoles.includes(user.role)) {
        throw new AppError(403, "Forbidden");
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
