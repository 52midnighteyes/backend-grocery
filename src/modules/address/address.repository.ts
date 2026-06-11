import { prisma } from "../../libs/prisma/prisma.lib.js";

export const findAddressesByUserId = async (userId: string) => {
  return prisma.address.findMany({
    where: { userId, deletedAt: null },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
      notes: true,
      isDefault: true,
    },
  });
};

export const findAddressById = async (addressId: string, userId: string) => {
  return prisma.address.findFirst({
    where: { id: addressId, userId, deletedAt: null },
  });
};