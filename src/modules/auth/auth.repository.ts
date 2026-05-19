import {
  PasswordResetTokenUncheckedCreateInput,
  RefreshTokenUncheckedCreateInput,
} from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findRefreshTokenByHashedToken = async (
  hashedToken: string,
  db: TPrisma = prisma,
) => {
  return db.refreshToken.findFirst({
    where: {
      hashedToken,
      expiresAt: {
        gte: new Date(),
      },
      usedAt: null,
      revokedAt: null,
    },
    include: {
      user: true,
    },
  });
};

export const updateManyRefreshTokenByHashedToken = async (
  hashedToken: string,
  db: TPrisma = prisma,
) => {
  return db.refreshToken.updateMany({
    where: {
      hashedToken,
    },
    data: { usedAt: new Date(Date.now()) },
  });
};

export const revokeManyRefreshTokenByHashedToken = async (
  hashedToken: string,
  db: TPrisma = prisma,
) => {
  return db.refreshToken.updateMany({
    where: {
      hashedToken,
    },
    data: { revokedAt: new Date(Date.now()) },
  });
};

export const createRefreshToken = async (
  data: RefreshTokenUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.refreshToken.create({
    data,
  });
};

export const createResetToken = async (
  data: PasswordResetTokenUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return await db.passwordResetToken.create({
    data: data,
  });
};

export const findResetToken = async (
  tokenHash: string,
  db: TPrisma = prisma,
) => {
  return await db.passwordResetToken.findFirst({
    where: {
      tokenHash,
      expiresAt: {
        gte: new Date(),
      },
      usedAt: null,
    },
  });
};

export const updateManyUsedResetToken = async (
  userId: string,
  db: TPrisma = prisma,
) => {
  return await db.passwordResetToken.updateMany({
    where: {
      userId,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  });
};
