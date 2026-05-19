import { NODE_ENV } from "../config/config.js";
import { TCookieOptions } from "../models/cookie-options.type.js";
import { FOURTEEN_DAYS_IN_MS } from "./time.constant.js";

export const refreshTokenConfig: TCookieOptions = {
  httpOnly: true,
  secure: NODE_ENV === "production",
  sameSite: "lax",
  maxAge: FOURTEEN_DAYS_IN_MS,
  path: "/api/auth",
};
