import type { UserUncheckedCreateInput } from "../../../generated/prisma/models.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import type { TPrisma } from "../../libs/prisma/prisma.types.js";

export const findUserByEmail = async (email: string, db: TPrisma = prisma) => {
  return db.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });
};

export const findUserById = async (id: string, db: TPrisma = prisma) => {
  return db.user.findUnique({
    where: { id },
  });
};

export const createUser = async (
  data: UserUncheckedCreateInput,
  db: TPrisma = prisma,
) => {
  return db.user.create({
    data,
  });
};

export const findUserByReferralCode = async (
  referralCode: string,
  db: TPrisma = prisma,
) => {
  return await db.user.findFirst({
    where: {
      referralCode: { equals: referralCode, mode: "insensitive" },
    },
  });
};

export const verifyManyUserById = async (id: string, db: TPrisma = prisma) => {
  return await db.user.updateMany({
    where: {
      id,
      isVerified: false,
    },
    data: {
      isVerified: true,
    },
  });
};

export const updateManyUserPassword = async (
  params: { id: string; passwordHash: string },
  db: TPrisma = prisma,
) => {
  return await db.user.updateMany({
    where: { id: params.id },
    data: { passwordHash: params.passwordHash },
  });
};

export const updateUserAvatar = async (
  params: {
    avatarUrl: string;
    avatarPublicId: string;
    id: string;
  },
  db: TPrisma = prisma,
) => {
  return await db.user.update({
    where: { id: params.id },
    data: {
      avatarPublicId: params.avatarPublicId,
      avatarUrl: params.avatarUrl,
    },
  });
};
