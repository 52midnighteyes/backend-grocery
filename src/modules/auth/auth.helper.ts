import Jwt from "jsonwebtoken"
import type { Response } from "express"
import {
    JWT_SECRET,
    REFRESH_TOKEN_SECRET,
    VERIFY_TOKEN_SECRET,
    RESET_TOKEN_SECRET
} from "../../config/config.js"
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js"

export const signAccessToken = (payload:TJwtTokenPayload) : string => Jwt.sign(payload, JWT_SECRET, { expiresIn: "15m"});

export const signRefreshToken = (payload:TJwtTokenPayload) : string => Jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "7d"});

export const signVerifyToken = (userId: string): string => Jwt.sign({ id: userId }, VERIFY_TOKEN_SECRET, { expiresIn: "1h" });

export const signResetToken = (userId: string, email: string): string => Jwt.sign({ id: userId, email }, RESET_TOKEN_SECRET, { expiresIn: "1h" });

export const setAuthCookies = (res:Response, payload:TJwtTokenPayload):void => {
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    res.cookie("accessToken", accessToken, {
        httpOnly:true,
        secure:process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
        httpOnly:true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
};

export const clearAuthCookies = (res:Response):void => {
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
}
