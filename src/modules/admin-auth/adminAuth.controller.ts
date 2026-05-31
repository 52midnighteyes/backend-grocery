import type { NextFunction, Request, Response } from "express";
import {
  getAdminProfileService,
  loginAdminService,
  refreshAdminTokenService,
} from "./adminAuth.service.js";
import type { TAdminLoginBody } from "./adminAuth.schemas.js";
import {
  accessTokenConfig,
  refreshTokenConfig,
} from "../../constant/cookie-options.constant.js";
import {
  setAdminAuthCookies,
  verifyRefreshTokenHelper,
} from "./adminAuth.helper.js";
import { AppError } from "../../class/appError.js";

export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const payload = await loginAdminService(
      req.validated?.body as TAdminLoginBody,
    );

    setAdminAuthCookies(res, payload);

    return res.status(200).json({
      message: "Admin login successful",
      data: payload,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdminController = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    res.clearCookie("accessToken", accessTokenConfig);
    res.clearCookie("refreshToken", refreshTokenConfig);

    return res.status(200).json({
      message: "Admin logout successful",
    });
  } catch (error) {
    next(error);
  }
};

export const refreshAdminTokenController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    verifyRefreshTokenHelper(req); //sementara
    const payload = await refreshAdminTokenService(req.user!.id);
    setAdminAuthCookies(res, payload);

    return res.status(200).json({
      message: "Admin token refreshed successfully",
      data: payload,
    });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      res.clearCookie("accessToken", accessTokenConfig);
      res.clearCookie("refreshToken", refreshTokenConfig);
    }
    next(error);
  }
};

export const getAdminProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const data = await getAdminProfileService(req.user!.id);

    return res.status(200).json({
      data,
    });
  } catch (error) {
    next(error);
  }
};
