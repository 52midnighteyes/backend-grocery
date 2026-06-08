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
import { setAdminAuthCookies } from "./adminAuth.helper.js";
import { AppError } from "../../class/appError.js";

export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await loginAdminService(
      req.validated?.body as TAdminLoginBody,
    );

    setAdminAuthCookies(res, result.tokenPayload);

    return res.status(200).json({
      message: "Admin login successful",
      data: result.session,
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
    res.clearCookie("adminAccessToken", accessTokenConfig);
    res.clearCookie("adminRefreshToken", refreshTokenConfig);

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
    const result = await refreshAdminTokenService(req.user!.id);
    setAdminAuthCookies(res, result.tokenPayload);

    return res.status(200).json({
      message: "Admin token refreshed successfully",
      data: result.session,
    });
  } catch (error) {
    if (error instanceof AppError && error.statusCode === 401) {
      res.clearCookie("adminAccessToken", accessTokenConfig);
      res.clearCookie("adminRefreshToken", refreshTokenConfig);
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
      message: "Admin profile fetched successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};
