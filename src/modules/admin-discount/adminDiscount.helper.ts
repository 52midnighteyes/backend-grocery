import type {
  DiscountOrderByWithRelationInput,
  DiscountWhereInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import type {
  TCreateDiscountBody,
  TGetDiscountsQuery,
  TUpdateDiscountBody,
} from "./adminDiscount.schemas.js";

export const discountInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  },
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

export const resolveDiscountStoreId = (
  requester: TAdminRequester,
  storeId?: string,
) => {
  if (requester.role.name === "storeAdmin") return getRequesterStoreId(requester);

  if (!storeId) throw new AppError(400, "Store ID is required");

  return storeId;
};

export const assertDiscountStoreAccess = (
  requester: TAdminRequester,
  storeId: string,
) => {
  if (requester.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Discount was not found");
  }
};

export const assertDiscountTypeFields = (
  params: Pick<
    TCreateDiscountBody | TUpdateDiscountBody,
    "type" | "value" | "buyQuantity" | "getQuantity"
  >,
) => {
  if (params.type === "percentage") {
    if (!params.value || params.value < 1 || params.value > 100) {
      throw new AppError(400, "Percentage discount value must be between 1 and 100");
    }
  }

  if (params.type === "nominal") {
    if (!params.value || params.value < 1) {
      throw new AppError(400, "Nominal discount value must be positive");
    }
  }

  if (params.type === "buyXGetY") {
    if (!params.buyQuantity || !params.getQuantity) {
      throw new AppError(400, "Buy X Get Y discount requires buy and get quantity");
    }
  }
};

export const buildDiscountTypeData = (
  params: Pick<
    TCreateDiscountBody | TUpdateDiscountBody,
    "type" | "value" | "buyQuantity" | "getQuantity"
  >,
) => {
  assertDiscountTypeFields(params);

  return {
    value: params.type === "buyXGetY" ? null : params.value,
    buyQuantity: params.type === "buyXGetY" ? params.buyQuantity : null,
    getQuantity: params.type === "buyXGetY" ? params.getQuantity : null,
  };
};

export const buildDiscountWhere = (
  params: TGetDiscountsQuery,
  storeId?: string,
): DiscountWhereInput => {
  return {
    deletedAt: null,
    productId: params.productId,
    storeId: storeId ?? params.storeId,
    type: params.type,
    name: params.name
      ? {
          contains: params.name,
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
            product: {
              name: {
                contains: params.q,
                mode: "insensitive",
              },
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

export const buildDiscountOrderBy = (
  params: TGetDiscountsQuery,
): DiscountOrderByWithRelationInput[] => {
  const fallbackOrder: DiscountOrderByWithRelationInput = { createdAt: "desc" };
  const orderBy: DiscountOrderByWithRelationInput =
    params.sortBy === "productName"
      ? { product: { name: params.sortOrder } }
      : params.sortBy === "storeName"
        ? { store: { name: params.sortOrder } }
        : { [params.sortBy]: params.sortOrder };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, fallbackOrder];
};
