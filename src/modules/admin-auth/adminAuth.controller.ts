import type { NextFunction, Request, Response } from "express";
import { setAuthCookies } from "../auth/auth.helper.js";
import {
  getAdminProfileService,
  loginAdminService,
  logoutAdminService,
  refreshAdminTokenService,
} from "./adminAuth.service.js";
import type { TAdminLoginBody } from "./adminAuth.schemas.js";

export const loginAdminController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const payload = await loginAdminService(
      req.validated?.body as TAdminLoginBody
    );

    setAuthCookies(res, payload);

    return res.status(200).json({
      message: "Admin login successful",
    });
  } catch (error) {
    next(error);
  }
};

export const logoutAdminController = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logoutAdminService(res);

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
  next: NextFunction
) => {
  try {
    const payload = await refreshAdminTokenService(req.user!.id);
    setAuthCookies(res, payload);

    return res.status(200).json({
      message: "Admin token refreshed successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminProfileController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const profile = await getAdminProfileService(req.user!.id);

    return res.status(200).json({
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};
