import { NODE_ENV } from "../config/config.js";
import { TCookieOptions } from "../models/cookie-options.type.js";
import { FIFTEEN_MINUTES_IN_MS, SEVEN_DAYS_IN_MS } from "./time.constant.js";

export const refreshTokenConfig: TCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
  maxAge: SEVEN_DAYS_IN_MS,
  path: "/",
};

export const accessTokenConfig: TCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: NODE_ENV === "production" ? "none" : "lax",
  maxAge: FIFTEEN_MINUTES_IN_MS,
  path: "/",
};
