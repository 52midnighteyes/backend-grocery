import type { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import {
  ADMIN_ACCESS_TOKEN_SECRET,
  ADMIN_REFRESH_TOKEN_SECRET,
} from "../../config/config.js";
import {
  jwtTokenSchema,
  type TJwtTokenPayload,
} from "./tokenVerification.schema.js";
import { AppError } from "../../class/appError.js";

export const verifyAdminAccessToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.adminAccessToken;
    if (!token) throw new AppError(401, "Unauthorized");

    const verification: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, ADMIN_ACCESS_TOKEN_SECRET),
    );

    req.user = verification;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyAdminRefreshToken = async (
  req: Request,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const token = req.cookies?.adminRefreshToken;
    if (!token) throw new AppError(401, "Unauthorized");

    const verification: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, ADMIN_REFRESH_TOKEN_SECRET),
    );

    req.user = verification;
    next();
  } catch (error) {
    next(error);
  }
};
