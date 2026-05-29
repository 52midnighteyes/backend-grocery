import { AppError } from "../../class/appError.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import { FRONTEND_URL, RESET_TOKEN_SECRET, VERIFY_TOKEN_SECRET } from "../../config/config.js";
import argon2 from "argon2";
import Jwt from "jsonwebtoken";
import type { Response } from "express";
import { signVerifyToken, clearAuthCookies, signResetToken } from "./auth.helper.js";

import {
    findUserByEmail,
    findRoleByName,
    createUser,
    createReferralHistory,
    findUserByReferralCode,
    createRegisterToken,
    findRegisterToken,
    invalidateRegisterToken,
    updateUser,
    findUserByEmailWithRole,
    createForgotPasswordToken,
    findForgotPasswordToken,
    invalidateForgotPasswordToken,
    findUserById
} from "./auth.repository.js"
import type { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import { randomBytes } from "crypto";

const sendVerificationEmail = async (userId:string, name:string, email:string) => {
    const token = signVerifyToken(userId);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await createRegisterToken(token, expiresAt);

    const verifyUrl = `${FRONTEND_URL}/auth/verify?token=${token}`
    const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "register.mail.hbs", {
        name,
        url: verifyUrl,
    });

    await sendMail(email, "Verifikasi Email Kamu", html, "EMAIL_VERIFICATION");
};

export const registerService = async (
    name:string,
    email:string,
    referralCode?:string
) => {
    const existing = await findUserByEmail(email);
    if (existing) throw new AppError(400, "Email sudah terdaftar");

    const role = await findRoleByName("user");
    if (!role) throw new AppError(500, "Role tidak ditemukan");

    const user = await createUser(name, email, role.id);
    
    if (referralCode) await handleReferral(user.id, referralCode);

    await sendVerificationEmail(user.id, user.name, email)
};

const handleReferral = async (newUserId:string, referralCode:string) => {
    const referrer = await findUserByReferralCode(referralCode);
    if (!referrer) return;

    await createReferralHistory(referrer.id, newUserId)
};

export const verifyEmailService = async (token:string, password:string) => {
    const record = await findRegisterToken(token);
    if (!record) throw new AppError(400, "Token tidak valid atau sudah digunakan");

    const isExpired = record.expiresAt && record.expiresAt < new Date();
    if (isExpired) throw new AppError(400, "Token sudah kadaluarsa");

    const payload = Jwt.verify(token, VERIFY_TOKEN_SECRET) as { id:string };

    const hashedPassword = await argon2.hash(password);

    const newReferralCode = randomBytes(4).toString("hex").toUpperCase();
    await updateUser(payload.id, { 
        password: hashedPassword, 
        isVerified: true,
        referralCode: newReferralCode
    });
    
    await invalidateRegisterToken(record.id)
}

export const resendVerificationService = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user) throw new AppError(404, "User tidak ditemukan");
    if (user.isVerified) throw new AppError(400, "Email sudah terverifikasi");

    await sendVerificationEmail(user.id, user.name, email);
};

export const loginService = async (email: string, password: string):Promise<TJwtTokenPayload> => {
    const user = await findUserByEmailWithRole(email);
    if (!user || !user.password) throw new AppError(401, "Email atau password salah");
    if (!user.isVerified) throw new AppError(403, "Email belum diverifikasi");

    const isMatch = await argon2.verify(user.password, password);
    if (!isMatch) throw new AppError(401, "Email atau password salah");

    return {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role.name as "superAdmin" | "storeAdmin" | "user",
        avatarUrl: user.avatar,
        isVerified: user.isVerified,
    };
};

export const logoutService = (res: Response) => {
    clearAuthCookies(res);
};

export const forgotPasswordService = async (email: string) => {
    const user = await findUserByEmail(email);
    if (!user || !user.isVerified) return;

    const token = signResetToken(user.id, email);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    await createForgotPasswordToken(token, email, expiresAt);

    const resetUrl = `${FRONTEND_URL}/auth/reset-password?token=${token}`;
    const html = await compileHandlebars(EMAIL_TEMPLATES_DIR, "request-forgot-password.mail.hbs", {
        name: user.name,
        url: resetUrl,
    });
    await sendMail(email, "Reset Password", html, "EMAIL_VERIFICATION");
};

export const resetPasswordService = async (token: string, password: string) => {
    const record = await findForgotPasswordToken(token);
    if (!record) throw new AppError(400, "Token tidak valid atau sudah digunakan");

    const isExpired = record.expiresAt && record.expiresAt < new Date();
    if (isExpired) throw new AppError(400, "Token sudah kadaluarsa");

    const payload = Jwt.verify(token, RESET_TOKEN_SECRET) as { id: string; email: string };
    if (payload.email !== record.email) throw new AppError(400, "Token tidak valid");

    const hashedPassword = await argon2.hash(password);
    await updateUser(payload.id, { password: hashedPassword });
    await invalidateForgotPasswordToken(record.id);
};

export const getProfileService = async (userId: string) => {
    const user = await findUserById(userId);
    if (!user) throw new AppError(404, "User tidak ditemukan");

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role.name,
        isVerified: user.isVerified,
        referralCode: user.referralCode,
    };
};

export const updateProfileService = async (
    userId: string,
    name?: string,
    avatarUrl?: string
) => {
    const user = await findUserById(userId);
    if (!user) throw new AppError(404, "User tidak ditemukan");

    const data: Record<string, unknown> = {};
    if (name) data.name = name;
    if (avatarUrl) data.avatar = avatarUrl;

    await updateUser(userId, data);
};

export const changeEmailService = async (userId: string, newEmail: string) => {
    const existing = await findUserByEmail(newEmail);
    if (existing) throw new AppError(400, "Email sudah digunakan");

    const user = await findUserById(userId);
    if (!user) throw new AppError(404, "User tidak ditemukan");
    
    await updateUser(userId, { email: newEmail, isVerified: false });
    await sendVerificationEmail(userId, user.name, newEmail);
};

export const verifyEmailChangeService = async (token: string) => {
    const record = await findRegisterToken(token);
    if (!record) throw new AppError(400, "Token tidak valid atau sudah digunakan");

    const isExpired = record.expiresAt && record.expiresAt < new Date();
    if (isExpired) throw new AppError(400, "Token sudah kadaluarsa");

    const payload = Jwt.verify(token, VERIFY_TOKEN_SECRET) as { id: string };
    await updateUser(payload.id, { isVerified: true });
    await invalidateRegisterToken(record.id);
};

export const changePasswordService = async (userId: string, oldPassword: string, newPassword: string) => {
    const user = await findUserById(userId);
    if (!user || !user.password) throw new AppError(404, "User tidak ditemukan");

    const isMatch = await argon2.verify(user.password, oldPassword);
    if (!isMatch) throw new AppError(401, "Password lama tidak sesuai");

    const hashedPassword = await argon2.hash(newPassword);
    await updateUser(userId, { password: hashedPassword });
};
