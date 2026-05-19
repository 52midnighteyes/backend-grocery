import type { IUserParams } from "../../custom.js";
import type {
  TUpdatePassword,
  TLoginParams,
  TRegisterParams,
} from "./auth.schemas.js";
import {
  comparePassword,
  createUserWithUniqueReferral,
  generateJwtToken,
  generateRefreshToken,
  generateResetToken,
  handleReferral,
  hashPassword,
  hashToken,
  toUserPayload,
  verifyJwtToken,
} from "./auth.helper.js";
import {
  createRefreshToken,
  createResetToken,
  findRefreshTokenByHashedToken,
  findResetToken,
  revokeManyRefreshTokenByHashedToken,
  updateManyRefreshTokenByHashedToken,
  updateManyUsedResetToken,
} from "./auth.repository.js";
import {
  FOURTEEN_DAYS_IN_MS,
  ONE_MINUTE_IN_MS,
} from "../../constant/time.constant.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import {
  findUserByEmail,
  findUserById,
  updateManyUserPassword,
  verifyManyUserById,
} from "../user/user.repository.js";
import { AppError } from "../../class/appError.js";
import { compileHandlebars } from "../../helper/handlebars.js";
import { EMAIL_TEMPLATES_DIR } from "../../helper/path.js";
import { sendMail } from "../../libs/mailer/nodemailer.libs.js";
import {
  FRONTEND_URL,
  JWT_SECRET,
  VERIFY_TOKEN_SECRET,
} from "../../config/config.js";
import { TJwtTokenPayload } from "../../middlewares/tokenVerification/tokenVerification.schema.js";
import { PasswordResetTokenUncheckedCreateInput } from "../../../generated/prisma/models.js";

export const registerService = async (params: TRegisterParams) => {
  let referrerUserId: string | null = null;
  const { referrerCode, password, ...data } = params;
  const fullName = params.firstName + " " + params.lastName;
  let isEmailSent = true;

  try {
    const checkUser = await findUserByEmail(params.email);
    if (checkUser) {
      throw new AppError(409, "Email is already registered");
    }

    if (referrerCode) {
      referrerUserId = await handleReferral(referrerCode);
    }

    const passwordHash = await hashPassword(password);
    const userPayload = {
      ...data,
      passwordHash,
      ...(referrerUserId && { referrerUserId }),
    };

    const user = await createUserWithUniqueReferral(fullName, userPayload);
    const payload = toUserPayload(user);
    const verifyToken = generateJwtToken(payload, VERIFY_TOKEN_SECRET, "30d");

    const welcomeMessage = "Welcome to MATCHPASS";
    const html = await compileHandlebars(
      EMAIL_TEMPLATES_DIR,
      "register.mail.hbs",
      {
        name: fullName,
        url: `${FRONTEND_URL}/verify/${verifyToken}`,
      }
    );

    try {
      await sendMail(user.email, welcomeMessage, html);
    } catch (error) {
      console.error("Failed to send verification email:", error);
      isEmailSent = false;
    }

    return isEmailSent;
  } catch (error) {
    throw error;
  }
};

export const loginService = async (params: TLoginParams) => {
  const user = await findUserByEmail(params.email);
  if (!user) {
    throw new AppError(401, "Invalid email or password");
  }

  const isMatch = await comparePassword(user.passwordHash, params.password);
  if (!isMatch) {
    throw new AppError(401, "Invalid email or password");
  }

  const payload: IUserParams = toUserPayload(user);

  const accessToken = generateJwtToken(payload, JWT_SECRET, "15m");

  const { refreshToken, hashedToken } = generateRefreshToken();
  const refreshPayload = {
    userId: user.id,
    hashedToken,
    expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
  };

  await createRefreshToken(refreshPayload);

  return {
    refreshToken,
    data: { accessToken, user: payload },
  };
};

export const refreshTokenService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const { hashedToken, refreshToken } = generateRefreshToken();

    return await prisma.$transaction(async (tx) => {
      const checkToken = await findRefreshTokenByHashedToken(
        oldHashedToken,
        tx
      );

      if (
        !checkToken ||
        checkToken.usedAt !== null ||
        checkToken.revokedAt !== null
      ) {
        return {
          refreshToken: null,
          data: null,
        };
      }

      const payload = toUserPayload(checkToken.user);

      const refreshTokenPayload = {
        userId: checkToken.userId,
        hashedToken,
        expiresAt: new Date(Date.now() + FOURTEEN_DAYS_IN_MS),
      };

      const consume = await updateManyRefreshTokenByHashedToken(
        oldHashedToken,
        tx
      );

      if (consume.count === 0)
        return {
          refreshToken: null,
          data: null,
        };

      await createRefreshToken(refreshTokenPayload, tx);

      return {
        refreshToken,
        data: {
          accessToken: generateJwtToken(payload, JWT_SECRET, "15m"),
          user: payload,
        },
      };
    });
  } catch (error) {
    throw error;
  }
};

export const logoutService = async (oldRefreshToken: string) => {
  try {
    const oldHashedToken = hashToken(oldRefreshToken);
    const checkToken = await findRefreshTokenByHashedToken(oldHashedToken);
    if (!checkToken) throw new AppError(404, "Refresh token not found");

    const revokeToken = await revokeManyRefreshTokenByHashedToken(
      oldHashedToken
    );
    if (revokeToken.count === 0)
      throw new AppError(
        500,
        "race condition detected, failed to revoke refresh token"
      );
  } catch (error) {
    console.error("Failed to delete refresh token during logout:", error);
    throw error;
  }
};

export const verifyUserService = async (token: string) => {
  try {
    const data: TJwtTokenPayload = verifyJwtToken(token);
    const user = await findUserById(data.id);
    if (!user)
      throw new AppError(
        404,
        "BE: creadentials invalid. please request new verification email from your profile page"
      );

    if (user.isVerified)
      throw new AppError(409, "BE: User is already verified");

    const verified = await verifyManyUserById(data.id);
    if (verified.count === 0) throw new AppError(409, "User is already verified");

    const payload = toUserPayload({ ...user, isVerified: true });
    const accessToken = generateJwtToken(payload, JWT_SECRET, "15m");

    return {
      accessToken,
      user: payload,
    };
  } catch (error) {
    throw error;
  }
};

export const updatePasswordService = async (
  params: TUpdatePassword & { userId: string }
) => {
  try {
    const user = await findUserById(params.userId);
    if (!user) throw new AppError(404, "User resource not found");

    const compareOldPassword = await comparePassword(
      user.passwordHash,
      params.oldPassword
    );
    if (!compareOldPassword) throw new AppError(422, "Validation failed");

    const newPasswordHash = await hashPassword(params.newPassword);
    const updatePasswordPayload = {
      id: user.id,
      passwordHash: newPasswordHash,
    };

    const updatePassword = await updateManyUserPassword(updatePasswordPayload);
    if (updatePassword.count === 0)
      throw new AppError(409, "Resource already exists");
  } catch (error) {
    throw error;
  }
};

export const forgotPasswordRequestService = async (email: string) => {
  try {
    const user = await findUserByEmail(email);
    if (user) {
      const token = generateResetToken();
      const tokenHash = hashToken(token);
      const resetTokenPayload: PasswordResetTokenUncheckedCreateInput = {
        userId: user.id,
        tokenHash: tokenHash,
        expiresAt: new Date(Date.now() + ONE_MINUTE_IN_MS * 15),
      };

      await createResetToken(resetTokenPayload);

      const titleMessage = "We Received Your Reset Request";
      const html = await compileHandlebars(
        EMAIL_TEMPLATES_DIR,
        "request-forgot-password.mail.hbs",
        {
          name: `${user.firstName} ${user.lastName}`,
          url: `${FRONTEND_URL}/forgot-password-verification/${token}`,
        }
      );

      await sendMail(user.email, titleMessage, html);
      return;
    } else {
      return;
    }
  } catch (error) {
    throw error;
  }
};

export const forgotPasswordService = async (
  token: string,
  newPassword: string
) => {
  try {
    const tokenHash = hashToken(token);
    const found = await findResetToken(tokenHash);
    if (!found) throw new AppError(400, "Invalid or expired token");

    const newPasswordHash = await hashPassword(newPassword);
    await prisma.$transaction(async (tx) => {
      const updatePassword = await updateManyUserPassword(
        {
          id: found.userId,
          passwordHash: newPasswordHash,
        },
        tx
      );

      if (updatePassword.count === 0)
        throw new AppError(404, "User resource not found");

      const revokeToken = await updateManyUsedResetToken(found.userId, tx);
      if (revokeToken.count === 0)
        throw new AppError(
          404,
          "race condition detected, failed to revoke reset token"
        );
    });
  } catch (error) {
    throw error;
  }
};

export const checkResetTokenService = async (token: string) => {
  try {
    const tokenHash = hashToken(token);
    const found = await findResetToken(tokenHash);
    if (!found) return 0;
    return 1;
  } catch (error) {
    throw error;
  }
};

export const resendVerificationEmailService = async (userId: string) => {
  let isEmailSent = true;
  try {
    const user = await findUserById(userId);
    if (!user) throw new AppError(404, "User resource not found");
    if (user.isVerified) throw new AppError(409, "User is already verified");

    const payload = toUserPayload(user);
    const verifyToken = generateJwtToken(payload, VERIFY_TOKEN_SECRET, "30d");

    const fullName = user.firstName + " " + user.lastName;
    const welcomeMessage = "Welcome to MATCHPASS";
    const html = await compileHandlebars(
      EMAIL_TEMPLATES_DIR,
      "register.mail.hbs",
      {
        name: fullName,
        url: `${FRONTEND_URL}/verify/${verifyToken}`,
      }
    );

    try {
      await sendMail(user.email, welcomeMessage, html);
    } catch (error) {
      isEmailSent = false;
      console.error("Failed to send verification email:", error);
    }

    return isEmailSent;
  } catch (error) {
    throw error;
  }
};
