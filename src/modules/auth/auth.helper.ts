import argon2 from "argon2";
import type { User } from "../../../generated/prisma/browser.js";
import {
  PEPPER,
  REFRESH_TOKEN_SECRET,
  VERIFY_TOKEN_SECRET,
} from "../../config/config.js";
import type { IUserParams } from "../../custom.js";
import Jwt from "jsonwebtoken";
import { createHmac, randomBytes } from "node:crypto";
import { findUserByReferralCode } from "../user/user.repository.js";
import { generateReferralCode } from "../../helper/stringGenerator.js";
import { createUser } from "../user/user.repository.js";
import { TRegisterUserPayload } from "./auth.types.js";
import { jwtTokenSchema } from "../../middlewares/tokenVerification/tokenVerification.schema.js";

export const generateJwtToken = (
  params: IUserParams,
  secret: string,
  expiresTime: "15m" | "30m" | "24hr" | "30d"
) => {
  return Jwt.sign(params, secret, {
    expiresIn: expiresTime,
  });
};

export const generateRefreshToken = () => {
  const refreshToken = randomBytes(32).toString("hex");
  const hashedToken = createHmac("sha256", REFRESH_TOKEN_SECRET)
    .update(refreshToken)
    .digest("hex");

  return { refreshToken, hashedToken };
};

export const hashToken = (token: string) => {
  return createHmac("sha256", REFRESH_TOKEN_SECRET).update(token).digest("hex");
};

export const toUserPayload = (params: User): IUserParams => {
  return {
    id: params.id,
    email: params.email,
    firstName: params.firstName,
    lastName: params.lastName,
    role: params.role,
    avatarUrl: params.avatarUrl || null,
    isVerified: params.isVerified,
  };
};

export const hashPassword = async (password: string) => {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    secret: Buffer.from(PEPPER),
  });
};

export const comparePassword = async (
  passwordHash: string,
  password: string
) => {
  return await argon2.verify(passwordHash, password, {
    secret: Buffer.from(PEPPER),
  });
};

export const handleReferral = async (referrerCode: string) => {
  const referralCode = await findUserByReferralCode(referrerCode);
  if (!referralCode) return null;

  return referralCode.id;
};

//MVP OLNY! rawan race condition dan duplicate di traffic tinggi.
export const createUserWithUniqueReferral = async (
  name: string,
  data: TRegisterUserPayload
) => {
  try {
    let codeLength = 6;
    let counter = 0;
    let referralCode: string;
    while (true) {
      referralCode = generateReferralCode(name, codeLength);
      const isDuplicate = await findUserByReferralCode(referralCode);
      if (!isDuplicate) break;
      if (counter >= 6) {
        codeLength++;
      }
      counter++;
    }

    const user = await createUser({ ...data, referralCode });

    return user;
  } catch (error) {
    throw error;
  }
};

export const verifyJwtToken = (jwt: string) => {
  return jwtTokenSchema.parse(Jwt.verify(jwt, VERIFY_TOKEN_SECRET));
};

export const generateResetToken = () => {
  return randomBytes(32).toString("base64url");
};
