import * as z from "zod";
import { UserRole } from "../../../generated/prisma/enums.js";

export const registerUserSchema = z.object({
  email: z
    .email("Email format is invalid")
    .nonempty("Email is required")
    .trim(),
  firstName: z.string().nonempty("First name is required").trim(),
  lastName: z.string().nonempty("Last name is required").trim(),
  password: z
    .string()
    .nonempty("Password is required")
    .max(20, "Password must not exceed 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character",
    ),
  role: z
    .enum([UserRole.CUSTOMER, UserRole.ORGANIZER], {
      message: "Role must be USER or ORGANIZER",
    })
    .default(UserRole.CUSTOMER),

  referrerCode: z.string().optional(),
});

export const loginSchema = z.object({
  email: z
    .email("Email format is invalid")
    .nonempty("Email is required")
    .trim(),
  password: z.string().nonempty("Password is required"),
});

export const verifyParamsSchema = z.object({
  token: z.string().nonempty("Verification token is required"),
});

export const updatePasswordSchema = z.object({
  oldPassword: z.string().nonempty("Old password is required"),
  newPassword: z
    .string()
    .nonempty("Password is required")
    .max(20, "Password must not exceed 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character",
    ),
});

export const emailSchema = z.object({
  email: z
    .email("Email format is invalid")
    .nonempty("Email is required")
    .trim(),
});

export const forgotPasswordSchema = z.object({
  newPassword: z
    .string()
    .nonempty("Password is required")
    .max(20, "Password must not exceed 20 characters")
    .regex(
      /^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must be at least 8 characters long and include at least 1 uppercase letter, 1 number, and 1 special character",
    ),
});

export const uuidParamsSchema = z.object({ id: z.uuid("Invalid user ID") });
export const tokenParamsSchema = z.object({
  token: z.string().nonempty("Token is required"),
});

export type TForgotPasswordParams = z.infer<typeof forgotPasswordSchema>;
export type TTokenParams = z.infer<typeof tokenParamsSchema>;
export type TEmailParams = z.infer<typeof emailSchema>;
export type TUuidParams = z.infer<typeof uuidParamsSchema>;
export type TUpdatePassword = z.infer<typeof updatePasswordSchema>;
export type TLoginParams = z.infer<typeof loginSchema>;
export type TRegisterParams = z.infer<typeof registerUserSchema>;
