import * as z from "zod"

const passwordSchema = z
    .string()
    .min(8, "Password minimal 8 karakter")
    .regex(/[A-Z]/, "Password harus mengandung huruf kapital")
    .regex(/[0-9]/, "Password harus mengandung angka");

export const registerBodySchema = z.object({
    name:z.string().min(1, "Nama wajib diisi").trim(),
    email: z.email("Format email tidak valid"),
    referralCode: z.string().optional(),
});

export const verifyEmailBodySchema = z.object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"]
    });

export const verifyEmailQuerySchema = z.object({
    token: z.string().min(1, "Token tidak valid"),
});

export const loginBodySchema = z.object({
    email: z.email("Format email tidak valid"),
    password: z.string().min(1, "Password wajib diisi")
});

export const forgotPasswordBodySchema = z.object({
    email: z.email("Format email tidak valid"),
});

export const resetPasswordBodySchema = z.object({
        password: passwordSchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Password tidak cocok",
        path: ["confirmPassword"],
    });

export const resetPasswordQuerySchema = z.object({
    token: z.string().min(1, "Token tidak valid")
});

export const updateProfileBodySchema = z.object({
    name: z.string().min(1, "Nama wajib diisi").trim().optional(),
});

export const changeEmailBodySchema = z.object({
    email: z.email("Format email tidak valid"),
});

export const changePasswordBodySchema = z.object({
    oldPassword: z.string().min(1, "Password lama wajib diisi"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password tidak cocok",
    path: ["confirmPassword"],
});

export const googleAuthBodySchema = z.object({
    credential: z.string().min(1, "Credential Google wajib diisi"),
});


export type TRegisterBody = z.infer<typeof registerBodySchema>;
export type TVerifyEmailBody = z.infer<typeof verifyEmailBodySchema>;
export type TVerifyEmailQuery = z.infer<typeof verifyEmailQuerySchema>;
export type TLoginBody = z.infer<typeof loginBodySchema>;
export type TEmailBody = z.infer<typeof forgotPasswordBodySchema>;
export type TResetPasswordBody = z.infer<typeof resetPasswordBodySchema>;
export type TResetPasswordQuery = z.infer<typeof resetPasswordQuerySchema>;
export type TUpdateProfileBody = z.infer<typeof updateProfileBodySchema>;
export type TChangeEmailBody = z.infer<typeof changeEmailBodySchema>;
export type TChangePasswordBody = z.infer<typeof changePasswordBodySchema>;
export type TGoogleAuthBody = z.infer<typeof googleAuthBodySchema>;
