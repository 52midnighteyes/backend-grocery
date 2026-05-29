import type { Request, Response, NextFunction } from "express";
import { uploadToCloudinary } from "../../libs/cloudinary/cloudinary.lib.js";
import { setAuthCookies } from "./auth.helper.js";
import {
    registerService,
    verifyEmailService,
    verifyEmailChangeService,
    resendVerificationService,
    loginService,
    logoutService,
    forgotPasswordService,
    resetPasswordService,
    getProfileService,
    updateProfileService,
    changeEmailService,
} from "./auth.service.js";

export const register = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name, email, referralCode } = req.body;
        await registerService(name, email, referralCode);
        res.status(201).json({ message: "Registrasi berhasil, cek email untuk verifikasi" });
    } catch (error) { next(error); }
};

export const verifyEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query as { token: string };
        const { password } = req.body;
        await verifyEmailService(token, password);
        res.status(200).json({ message: "Email berhasil diverifikasi, silakan login" });
    } catch (error) { next(error); }
};

export const verifyEmailChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query as { token: string };
        await verifyEmailChangeService(token);
        res.status(200).json({ message: "Email berhasil diperbarui" });
    } catch (error) { next(error); }
};

export const resendVerification = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await resendVerificationService(email);
        res.status(200).json({ message: "Email verifikasi telah dikirim ulang" });
    } catch (error) { next(error); }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;
        const payload = await loginService(email, password);
        setAuthCookies(res, payload);
        res.status(200).json({ message: "Login berhasil" });
    } catch (error) { next(error); }
};

export const logout = (_req: Request, res: Response, next: NextFunction) => {
    try {
        logoutService(res);
        res.status(200).json({ message: "Logout berhasil" });
    } catch (error) { next(error); }
};

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await forgotPasswordService(email);
        res.status(200).json({ message: "Jika email terdaftar, link reset akan dikirimkan" });
    } catch (error) { next(error); }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { token } = req.query as { token: string };
        const { password } = req.body;
        await resetPasswordService(token, password);
        res.status(200).json({ message: "Password berhasil direset, silakan login" });
    } catch (error) { next(error); }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const profile = await getProfileService(req.user!.id);
        res.status(200).json({ data: profile });
    } catch (error) { next(error); }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { name } = req.body;
        let avatarUrl: string | undefined;
        if (req.file) {
            const result = await uploadToCloudinary(req.file, req.user!.id, "AVATAR");
            avatarUrl = result.secure_url;
        }
        await updateProfileService(req.user!.id, name, avatarUrl);
        res.status(200).json({ message: "Profil berhasil diperbarui" });
    } catch (error) { next(error); }
};

export const changeEmail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { email } = req.body;
        await changeEmailService(req.user!.id, email);
        res.status(200).json({ message: "Email diperbarui, cek email baru untuk verifikasi" });
    } catch (error) { next(error); }
};
