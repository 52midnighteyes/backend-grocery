import {
  StoreWhereInput,
  UserWhereInput,
} from "../../../generated/prisma/models.js";

export const buildActiveStoresWhere = (): StoreWhereInput => {
  return {
    deletedAt: null,
  };
};

export const buildRegisteredUsersWhere = (
  params: { isVerified?: boolean } = {}
): UserWhereInput => {
  return {
    deletedAt: null,
    isVerified: params.isVerified,
    role: {
      deletedAt: null,
      name: "user",
    },
  };
};

export const buildAdminAccountsWhere = (
  params: {
    roleName?: "storeAdmin" | "superAdmin";
    storeId?: string;
    isVerified?: boolean;
  } = {}
): UserWhereInput => {
  return {
    deletedAt: null,
    storeId: params.storeId,
    isVerified: params.isVerified,
    role: {
      deletedAt: null,
      name: params.roleName,
      rolePermissions: {
        some: {
          deletedAt: null,
          permission: {
            deletedAt: null,
            name: "admin:login",
          },
        },
      },
    },
  };
};

export const buildStoreDashboardAdmin = (admin: {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  isVerified: boolean;
  role: {
    id: string;
    name: string;
  };
}) => {
  return admin;
};

export const buildStoreDashboardStore = (store: {
  id: string;
  name: string;
  latitude: unknown;
  longitude: unknown;
  createdAt: Date;
  updatedAt: Date;
}) => {
  return {
    id: store.id,
    name: store.name,
    latitude: store.latitude,
    longitude: store.longitude,
    createdAt: store.createdAt,
    updatedAt: store.updatedAt,
  };
};
