import type {
  ProductStockWhereInput,
  StockHistoryCreateInput,
  StockTransferRequestCreateInput,
  StockTransferRequestOrderByWithRelationInput,
  StockTransferRequestUncheckedUpdateManyInput,
  StockTransferRequestWhereInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import { findAdminAccountById } from "../user/user.repository.js";
import type {
  TCreateStockTransferRequestBody,
  TGetStockTransferRequestsQuery,
  TGetStockTransferSourcesQuery,
} from "./stockTransfer.schemas.js";

export const stockTransferSourceInclude = {
  store: {
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  },
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  },
} as const;

export const stockTransferRequestInclude = {
  product: {
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
    },
  },
  fromStore: {
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  },
  toStore: {
    select: {
      id: true,
      name: true,
      latitude: true,
      longitude: true,
    },
  },
  requestedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  approvedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  rejectedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  receivedBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  cancelledBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  stockHistories: {
    orderBy: {
      createdAt: "asc",
    },
    select: {
      id: true,
      name: true,
      quantity: true,
      stockBefore: true,
      stockAfter: true,
      productId: true,
      adminId: true,
      transactionId: true,
      stockTransferRequestId: true,
      storeId: true,
      type: true,
      notes: true,
      createdAt: true,
      updatedAt: true,
      deletedAt: true,
    },
  },
} as const;

export const getAdminRequester = async (requesterId: string) => {
  const requester = await findAdminAccountById(requesterId);
  if (!requester) throw new AppError(401, "Unauthorized");

  return requester;
};

type TAdminRequester = Awaited<ReturnType<typeof getAdminRequester>>;
type TStockTransferStoreScope = {
  fromStoreId: string;
  toStoreId: string;
};
type TNullableRecord = { id: string } | null;
type TStockTransferStock = {
  id: string;
  stock: number;
  product: {
    name: string;
  };
};
type TStockTransferMovementRequest = {
  productName: string;
  productId: string;
  fromStoreId: string;
  toStoreId: string;
  quantity: number;
  fromStore: {
    name: string;
  };
  toStore: {
    name: string;
  };
};

export const getRequesterStoreId = (requester: TAdminRequester) => {
  if (!requester.storeId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  return requester.storeId;
};

export const getStockTransferDestinationStoreId = (
  requester: TAdminRequester,
  params: Pick<TCreateStockTransferRequestBody, "toStoreId">,
) => {
  const toStoreId =
    requester.role.name === "storeAdmin"
      ? getRequesterStoreId(requester)
      : params.toStoreId;

  if (!toStoreId) {
    throw new AppError(400, "Destination store ID is required");
  }

  return toStoreId;
};

export const assertDifferentStockTransferStores = (
  fromStoreId: string,
  toStoreId: string,
) => {
  if (fromStoreId === toStoreId) {
    throw new AppError(400, "Source and destination store cannot be the same");
  }
};

export const assertStockTransferRequestFound = <TRequest>(
  request: TRequest | null,
): TRequest => {
  if (!request) throw new AppError(404, "Stock transfer request was not found");

  return request;
};

export const assertStockTransferCreateDataExists = (
  fromStore: TNullableRecord,
  toStore: TNullableRecord,
  sourceStock: TStockTransferStock | null,
) => {
  if (!fromStore) throw new AppError(404, "Source store was not found");
  if (!toStore) throw new AppError(404, "Destination store was not found");
  if (!sourceStock) throw new AppError(404, "Source product stock was not found");
};

export const assertSourceStockAvailable = (
  sourceStock: TStockTransferStock | null,
  quantity: number,
): TStockTransferStock => {
  if (!sourceStock) throw new AppError(404, "Source product stock was not found");

  if (sourceStock.stock < quantity) {
    throw new AppError(400, "Source stock is insufficient");
  }

  return sourceStock;
};

export const assertStockTransferTransitionUpdated = (
  updatedCount: number,
  requiredStatus: "pending" | "approved",
) => {
  if (updatedCount !== 1) {
    throw new AppError(
      400,
      `Stock transfer request is not ${requiredStatus}`,
    );
  }
};

export const calculateStockTransferOut = (
  currentStock: number,
  quantity: number,
) => ({
  stockBefore: currentStock,
  stockAfter: currentStock - quantity,
});

export const calculateStockTransferIn = (
  currentStock: number,
  quantity: number,
) => ({
  stockBefore: currentStock,
  stockAfter: currentStock + quantity,
});

export const assertCanManageSourceStore = (
  requester: TAdminRequester,
  fromStoreId: string,
) => {
  if (requester.role.name === "storeAdmin" && requester.storeId !== fromStoreId) {
    throw new AppError(403, "Forbidden");
  }
};

export const assertCanManageDestinationStore = (
  requester: TAdminRequester,
  toStoreId: string,
) => {
  if (requester.role.name === "storeAdmin" && requester.storeId !== toStoreId) {
    throw new AppError(403, "Forbidden");
  }
};

export const assertCanAccessStockTransferStore = (
  requester: TAdminRequester,
  storeId: string,
) => {
  if (requester.role.name === "storeAdmin" && requester.storeId !== storeId) {
    throw new AppError(404, "Store was not found");
  }
};

export const assertCanViewStockTransferRequest = (
  requester: TAdminRequester,
  request: TStockTransferStoreScope,
) => {
  if (
    requester.role.name === "storeAdmin" &&
    requester.storeId !== request.fromStoreId &&
    requester.storeId !== request.toStoreId
  ) {
    throw new AppError(404, "Stock transfer request was not found");
  }
};

export const assertStockTransferRequestBelongsToStore = (
  request: TStockTransferStoreScope,
  storeId: string,
) => {
  if (request.fromStoreId !== storeId && request.toStoreId !== storeId) {
    throw new AppError(404, "Stock transfer request was not found");
  }
};

export const buildStockTransferSourcesWhere = (
  params: TGetStockTransferSourcesQuery,
  requester: TAdminRequester,
): ProductStockWhereInput => {
  const excludeStoreId =
    requester.role.name === "storeAdmin"
      ? getRequesterStoreId(requester)
      : params.excludeStoreId;

  return {
    productId: params.productId,
    deletedAt: null,
    stock: {
      gt: 0,
    },
    storeId: excludeStoreId
      ? {
          not: excludeStoreId,
        }
      : undefined,
    store: {
      deletedAt: null,
    },
    product: {
      deletedAt: null,
    },
  };
};

export const buildStockTransferRequestWhere = (
  params: TGetStockTransferRequestsQuery,
  requester: TAdminRequester,
): StockTransferRequestWhereInput => {
  const andConditions: StockTransferRequestWhereInput[] = [
    { deletedAt: null },
  ];

  if (params.status) andConditions.push({ status: params.status });
  if (params.productId) andConditions.push({ productId: params.productId });
  if (params.fromStoreId) andConditions.push({ fromStoreId: params.fromStoreId });
  if (params.toStoreId) andConditions.push({ toStoreId: params.toStoreId });

  if (params.startDate || params.endDate) {
    andConditions.push({
      createdAt: {
        gte: params.startDate,
        lte: params.endDate,
      },
    });
  }

  if (requester.role.name === "storeAdmin") {
    const storeId = getRequesterStoreId(requester);
    if (params.direction === "incoming") {
      andConditions.push({ toStoreId: storeId });
    } else if (params.direction === "outgoing") {
      andConditions.push({ fromStoreId: storeId });
    } else {
      andConditions.push({
        OR: [{ fromStoreId: storeId }, { toStoreId: storeId }],
      });
    }
  } else if (params.storeId) {
    if (params.direction === "incoming") {
      andConditions.push({ toStoreId: params.storeId });
    } else if (params.direction === "outgoing") {
      andConditions.push({ fromStoreId: params.storeId });
    } else {
      andConditions.push({
        OR: [
          { fromStoreId: params.storeId },
          { toStoreId: params.storeId },
        ],
      });
    }
  } else if (params.direction === "incoming" && params.toStoreId) {
    andConditions.push({ toStoreId: params.toStoreId });
  } else if (params.direction === "outgoing" && params.fromStoreId) {
    andConditions.push({ fromStoreId: params.fromStoreId });
  }

  return { AND: andConditions };
};

export const buildStockTransferRequestOrderBy = (
  params: TGetStockTransferRequestsQuery,
): StockTransferRequestOrderByWithRelationInput[] => {
  const orderBy: StockTransferRequestOrderByWithRelationInput = {
    [params.sortBy]: params.sortOrder,
  };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, { createdAt: "desc" }];
};

export const buildStockTransferApprovalNotes = (
  request: TStockTransferMovementRequest,
  responseNotes?: string,
) =>
  responseNotes ??
  `Approved transfer of ${request.quantity} ${request.productName} to ${request.toStore.name}.`;

export const buildStockTransferReceivedNotes = (
  request: TStockTransferMovementRequest,
  receivedNotes?: string,
) =>
  receivedNotes ??
  `Received ${request.quantity} ${request.productName} from ${request.fromStore.name}.`;

export const buildCreateStockTransferRequestData = (
  params: TCreateStockTransferRequestBody,
  toStoreId: string,
  requesterId: string,
  productName: string,
): StockTransferRequestCreateInput => {
  return {
    productName,
    quantity: params.quantity,
    notes: params.notes,
    requestNotes: params.requestNotes,
    product: {
      connect: {
        id: params.productId,
      },
    },
    fromStore: {
      connect: {
        id: params.fromStoreId,
      },
    },
    toStore: {
      connect: {
        id: toStoreId,
      },
    },
    requestedBy: {
      connect: {
        id: requesterId,
      },
    },
  };
};

export const buildApproveStockTransferData = (
  requesterId: string,
  responseNotes?: string,
): StockTransferRequestUncheckedUpdateManyInput => ({
  status: "approved",
  approvedAt: new Date(),
  approvedById: requesterId,
  responseNotes,
});

export const buildRejectStockTransferData = (
  requesterId: string,
  responseNotes?: string,
): StockTransferRequestUncheckedUpdateManyInput => ({
  status: "rejected",
  rejectedAt: new Date(),
  rejectedById: requesterId,
  responseNotes,
});

export const buildReceiveStockTransferData = (
  requesterId: string,
  receivedNotes?: string,
): StockTransferRequestUncheckedUpdateManyInput => ({
  status: "received",
  receivedAt: new Date(),
  receivedById: requesterId,
  receivedNotes,
});

export const buildCancelStockTransferData = (
  requesterId: string,
  cancelledNotes?: string,
): StockTransferRequestUncheckedUpdateManyInput => ({
  status: "cancelled",
  cancelledAt: new Date(),
  cancelledById: requesterId,
  cancelledNotes,
});

export const buildStockTransferHistoryData = (params: {
  requestId: string;
  request: TStockTransferMovementRequest;
  requesterId: string;
  storeId: string;
  stockBefore: number;
  stockAfter: number;
  type: "transferIn" | "transferOut";
  notes?: string;
}): StockHistoryCreateInput => ({
  name: params.request.productName,
  quantity: params.request.quantity,
  stockBefore: params.stockBefore,
  stockAfter: params.stockAfter,
  product: {
    connect: {
      id: params.request.productId,
    },
  },
  store: {
    connect: {
      id: params.storeId,
    },
  },
  admin: {
    connect: {
      id: params.requesterId,
    },
  },
  stockTransferRequest: {
    connect: {
      id: params.requestId,
    },
  },
  type: params.type,
  notes: params.notes,
});

export const buildTransferOutHistoryData = (params: {
  requestId: string;
  request: TStockTransferMovementRequest;
  requesterId: string;
  stockBefore: number;
  stockAfter: number;
  responseNotes?: string;
}) =>
  buildStockTransferHistoryData({
    requestId: params.requestId,
    request: params.request,
    requesterId: params.requesterId,
    storeId: params.request.fromStoreId,
    stockBefore: params.stockBefore,
    stockAfter: params.stockAfter,
    type: "transferOut",
    notes: buildStockTransferApprovalNotes(
      params.request,
      params.responseNotes,
    ),
  });

export const buildTransferInHistoryData = (params: {
  requestId: string;
  request: TStockTransferMovementRequest;
  requesterId: string;
  stockBefore: number;
  stockAfter: number;
  receivedNotes?: string;
}) =>
  buildStockTransferHistoryData({
    requestId: params.requestId,
    request: params.request,
    requesterId: params.requesterId,
    storeId: params.request.toStoreId,
    stockBefore: params.stockBefore,
    stockAfter: params.stockAfter,
    type: "transferIn",
    notes: buildStockTransferReceivedNotes(
      params.request,
      params.receivedNotes,
    ),
  });
