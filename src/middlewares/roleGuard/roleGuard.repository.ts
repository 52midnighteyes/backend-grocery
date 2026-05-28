import { prisma } from "../../libs/prisma/prisma.lib.js";

export const findUserPermission = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      role: {
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });
};
