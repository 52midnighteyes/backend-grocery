import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../class/appError.js";
import { findUserPermission } from "./roleGuard.repository.js";

type TPermissionGuardOptions = {
  mode?: "every" | "some";
};

export const permissionGuard = (
  permissions: string | string[],
  options: TPermissionGuardOptions = {}
) => {
  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];
  const mode = options.mode ?? "every";

  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) throw new AppError(401, "Unauthorized");

      const user = await findUserPermission(req.user.id);
      if (!user) throw new AppError(401, "Unauthorized");

      const userPermissions = new Set(
        user.role.rolePermissions.map(
          (rolePermission) => rolePermission.permission.name
        )
      );

      const hasPermission =
        mode === "some"
          ? requiredPermissions.some((permission) =>
              userPermissions.has(permission)
            )
          : requiredPermissions.every((permission) =>
              userPermissions.has(permission)
            );

      if (!hasPermission) throw new AppError(403, "Forbidden");

      next();
    } catch (error) {
      next(error);
    }
  };
};
