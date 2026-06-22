import type {
  VoucherOrderByWithRelationInput,
  VoucherWhereInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import type {
  TCreateVoucherBody,
  TGetVouchersQuery,
  TUpdateVoucherBody,
} from "./adminVoucher.schemas.js";

export const voucherInclude = {
  store: {
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  },
} as const;

type TAdminRequester = {
  storeId: string | null;
  role: {
    name: string;
  };
};

export const getRequesterStoreId = (requester: TAdminRequester) => {
  if (!requester.storeId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  return requester.storeId;
};

export const resolveVoucherStoreId = (
  requester: TAdminRequester,
  storeId?: string | null,
) => {
  if (requester.role.name === "storeAdmin") return getRequesterStoreId(requester);

  return storeId ?? null;
};

export const assertVoucherStoreAccess = (
  requester: TAdminRequester,
  storeId: string | null,
) => {
  if (requester.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Voucher was not found");
  }
};

export const normalizeVoucherCode = (code: string) =>
  code.trim().toUpperCase();

export const assertVoucherDiscountTypeFields = (
  params: Pick<TCreateVoucherBody | TUpdateVoucherBody, "discountType" | "value">,
) => {
  if (params.discountType === "percentage") {
    if (!params.value || params.value < 1 || params.value > 100) {
      throw new AppError(400, "Percentage voucher value must be between 1 and 100");
    }
  }

  if (params.discountType === "nominal") {
    if (!params.value || params.value < 1) {
      throw new AppError(400, "Nominal voucher value must be positive");
    }
  }
};

export const buildVoucherWhere = (
  params: TGetVouchersQuery,
  storeId?: string,
): VoucherWhereInput => {
  return {
    deletedAt: null,
    storeId: storeId ?? params.storeId,
    discountType: params.discountType,
    voucherType: params.voucherType,
    name: params.name
      ? {
          contains: params.name,
          mode: "insensitive",
        }
      : undefined,
    code: params.code
      ? {
          contains: params.code,
          mode: "insensitive",
        }
      : undefined,
    OR: params.q
      ? [
          {
            name: {
              contains: params.q,
              mode: "insensitive",
            },
          },
          {
            code: {
              contains: params.q,
              mode: "insensitive",
            },
          },
          {
            store: {
              name: {
                contains: params.q,
                mode: "insensitive",
              },
            },
          },
        ]
      : undefined,
    startDate: params.endDate
      ? {
          lte: params.endDate,
        }
      : undefined,
    endDate: params.startDate
      ? {
          gte: params.startDate,
        }
      : undefined,
  };
};

export const buildVoucherOrderBy = (
  params: TGetVouchersQuery,
): VoucherOrderByWithRelationInput[] => {
  const fallbackOrder: VoucherOrderByWithRelationInput = { createdAt: "desc" };
  const orderBy: VoucherOrderByWithRelationInput =
    params.sortBy === "storeName"
      ? { store: { name: params.sortOrder } }
      : { [params.sortBy]: params.sortOrder };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, fallbackOrder];
};
