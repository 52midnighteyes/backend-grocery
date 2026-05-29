import type { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { JWT_SECRET, REFRESH_TOKEN_SECRET } from "../../config/config.js";
import { jwtTokenSchema, type TJwtTokenPayload } from "./tokenVerification.schema.js";
import { AppError } from "../../class/appError.js";

export const verifyAccessToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.accessToken;
    if (!token) throw new AppError(401, "Unauthorized");

    const verification: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, JWT_SECRET)
    );

    req.user = verification;
    next();
  } catch (error) {
    next(error);
  }
};

export const verifyRefreshToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new AppError(401, "Unauthorized");

    const verification: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, REFRESH_TOKEN_SECRET)
    );

    req.user = verification;
    next();
  } catch (error) {
    next(error);
  }
};
