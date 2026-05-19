import type { Request, Response, NextFunction } from "express";
import Jwt from "jsonwebtoken";
import { JWT_SECRET } from "../../config/config.js";
import {
  jwtTokenSchema,
  type TJwtTokenPayload,
} from "./tokenVerification.schema.js";
import { AppError } from "../../class/appError.js";

export const verifyAccessToken = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
      throw new AppError(401, "Missing Authorization header");
    }

    const [bearer, token] = authHeader.split(" ");
    if (!bearer || bearer.toLowerCase() !== "bearer" || !token) {
      throw new AppError(401, "Invalid Authorization header format", true);
    }

    const verification: TJwtTokenPayload = jwtTokenSchema.parse(
      Jwt.verify(token, JWT_SECRET)
    );

    req.user = verification;

    next();
  } catch (error) {
    next(error);
  }
};
