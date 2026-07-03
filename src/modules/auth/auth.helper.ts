import Jwt from "jsonwebtoken"
import type { Response } from "express"
import {
    JWT_SECRET,
    REFRESH_TOKEN_SECRET,
    VERIFY_TOKEN_SECRET,
    RESET_TOKEN_SECRET
} from "../../config/config.js"
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js"
import { refreshTokenConfig, accessTokenConfig } from "../../constant/cookie-options.constant.js"
export const signAccessToken = (payload:TJwtTokenPayload) : string => Jwt.sign(payload, JWT_SECRET, { expiresIn: "15m"});

export const signRefreshToken = (payload:TJwtTokenPayload) : string => Jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d"});

export const signVerifyToken = (userId: string): string => Jwt.sign({ id: userId }, VERIFY_TOKEN_SECRET, { expiresIn: "1h" });

export const signResetToken = (userId: string, email: string): string => Jwt.sign({ id: userId, email }, RESET_TOKEN_SECRET, { expiresIn: "1h" });

export const setAuthCookies = (res:Response, payload:TJwtTokenPayload):void => {
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("accessToken", accessToken, accessTokenConfig);

    res.cookie("refreshToken", refreshToken, refreshTokenConfig);
};

export const clearAuthCookies = (res:Response):void => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
}
