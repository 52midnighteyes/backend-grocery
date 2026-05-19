import dotenv from "dotenv";
dotenv.config();

const getRequiredEnv = (name: string): string => {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    throw new Error(`Missing env: ${name}`);
  }

  return value;
};

const getNumberEnv = (name: string, fallback: number): number => {
  const value = process.env[name];

  if (!value || value.trim() === "") {
    return fallback;
  }

  const parsed = Number(value);

  if (Number.isNaN(parsed)) {
    throw new Error(`Invalid number env: ${name}`);
  }

  return parsed;
};

export const PORT = getNumberEnv("PORT", 8080);
export const JWT_SECRET = getRequiredEnv("JWT_SECRET");
export const NODE_ENV = process.env.NODE_ENV || "development";
export const DATABASE_URL = getRequiredEnv("DATABASE_URL");
export const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
export const REFRESH_TOKEN_SECRET = getRequiredEnv("REFRESH_TOKEN_SECRET");
export const NODEMAILER_EMAIL = getRequiredEnv("NODEMAILER_EMAIL");
export const NODEMAILER_PASS = getRequiredEnv("NODEMAILER_PASS");
export const CLOUDINARY_CLOUD_NAME = getRequiredEnv("CLOUDINARY_CLOUD_NAME");
export const CLOUDINARY_API_KEY = getRequiredEnv("CLOUDINARY_API_KEY");
export const CLOUDINARY_API_SECRET = getRequiredEnv("CLOUDINARY_API_SECRET");
export const VERIFY_TOKEN_SECRET = getRequiredEnv("VERIFY_TOKEN_SECRET");
export const RESET_TOKEN_SECRET = getRequiredEnv("RESET_TOKEN_SECRET");
export const PEPPER = getRequiredEnv("PEPPER");
