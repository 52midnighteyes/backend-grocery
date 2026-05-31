import { prisma } from "../../libs/prisma/prisma.lib.js";
import { TPrisma } from "../../libs/prisma/prisma.types.js";

export type TUserWithPermissions = {
  id: string;
  role: {
    rolePermissions: {
      permission: {
        name: string;
      };
    }[];
  };
};

export const findUserPermission = async (
  userId: string,
  db: TPrisma = prisma
): Promise<TUserWithPermissions | null> => {
  const user = await db.user.findFirst({
    where: {
      id: userId,
      deletedAt: null,
      role: {
        deletedAt: null,
      },
    },
    include: {
      role: {
        include: {
          rolePermissions: {
            where: {
              deletedAt: null,
              permission: {
                deletedAt: null,
              },
            },
            include: {
              permission: true,
            },
          },
        },
      },
    },
  });

  return user as TUserWithPermissions | null;
};
