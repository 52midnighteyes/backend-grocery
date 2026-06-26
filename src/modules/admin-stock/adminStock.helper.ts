import type {
  StockHistoryOrderByWithRelationInput,
  StockHistoryWhereInput,
} from "../../../generated/prisma/models.js";
import type {
  TGetStockMovementsQuery,
  TGetStockReportQuery,
} from "./adminStock.schemas.js";

type TStockReportRange = {
  startDate: Date;
  endDate: Date;
  endDateExclusive: Date;
  resolvedRange: {
    startDate: string;
    endDate: string;
  };
};

const toNumber = (value: bigint | number | null | undefined) => {
  if (typeof value === "bigint") return Number(value);
  return value ?? 0;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const parseDateOnly = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

const addDays = (date: Date, amount: number) =>
  new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate() + amount,
    ),
  );

const startOfMonth = (date: Date) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

const getToday = () => {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
};

export const resolveStockReportRange = (
  params: Pick<TGetStockReportQuery, "startDate" | "endDate">,
): TStockReportRange => {
  const today = getToday();
  const endDate = params.endDate ? parseDateOnly(params.endDate) : today;
  const startDate = params.startDate
    ? parseDateOnly(params.startDate)
    : startOfMonth(endDate);

  return {
    startDate,
    endDate,
    endDateExclusive: addDays(endDate, 1),
    resolvedRange: {
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    },
  };
};

export const buildStockReportWhere = (
  params: TGetStockReportQuery,
  storeId: string | undefined,
  range: TStockReportRange,
): StockHistoryWhereInput => ({
  storeId,
  productId: params.productId,
  type: params.type,
  deletedAt: null,
  createdAt: {
    gte: range.startDate,
    lt: range.endDateExclusive,
  },
  product: {
    deletedAt: null,
    categoryId: params.categoryId,
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" } },
            { sku: { contains: params.q, mode: "insensitive" } },
          ],
        }
      : {}),
  },
  store: {
    deletedAt: null,
  },
});

export const buildStockReportOrderBy = (
  params: TGetStockReportQuery,
): StockHistoryOrderByWithRelationInput[] => {
  const fallbackOrder: StockHistoryOrderByWithRelationInput = {
    createdAt: "desc",
  };
  const sortOrder = params.sortOrder;
  const orderBy: StockHistoryOrderByWithRelationInput =
    params.sortBy === "productName"
      ? { product: { name: sortOrder } }
      : params.sortBy === "sku"
        ? { product: { sku: sortOrder } }
        : { [params.sortBy]: sortOrder };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, fallbackOrder];
};

export const buildStockHistoryWhere = (
  storeId: string,
  params: TGetStockMovementsQuery,
): StockHistoryWhereInput => ({
  storeId,
  productId: params.productId,
  type: params.type,
  deletedAt: null,
  createdAt:
    params.startDate || params.endDate
      ? {
          gte: params.startDate,
          lte: params.endDate,
        }
      : undefined,
});

export const buildStockHistoryOrderBy = (
  params: TGetStockMovementsQuery,
): StockHistoryOrderByWithRelationInput[] => {
  const sortOrder = params.sortOrder;
  const fallbackOrder: StockHistoryOrderByWithRelationInput = {
    createdAt: "desc",
  };

  const orderBy: StockHistoryOrderByWithRelationInput =
    params.sortBy === "productName"
      ? { product: { name: sortOrder } }
      : params.sortBy === "storeName"
        ? { store: { name: sortOrder } }
        : params.sortBy === "adminName"
          ? { admin: { name: sortOrder } }
          : { [params.sortBy]: sortOrder };

  if (params.sortBy === "createdAt") return [orderBy];

  return [orderBy, fallbackOrder];
};

const calculateStockDelta = (
  stockBefore: number | null,
  stockAfter: number | null,
) => {
  if (stockBefore === null || stockAfter === null) {
    return {
      stockIn: 0,
      stockOut: 0,
      netChange: 0,
    };
  }

  const netChange = stockAfter - stockBefore;

  return {
    stockIn: netChange > 0 ? netChange : 0,
    stockOut: netChange < 0 ? Math.abs(netChange) : 0,
    netChange,
  };
};

export const normalizeStockReportRows = <
  TStockHistory extends {
    id: string;
    createdAt: Date;
    productId: string;
    storeId: string;
    type: string;
    quantity: number | null;
    stockBefore: number | null;
    stockAfter: number | null;
    notes: string | null;
    transactionId: string | null;
    stockTransferRequestId: string | null;
    product: {
      name: string;
      sku: string;
      category?: {
        id: string;
        name: string;
      };
    };
    store: {
      name: string;
    };
    admin: {
      id: string;
      name: string;
      email: string;
    } | null;
  },
>(
  rows: TStockHistory[],
) =>
  rows.map((row) => ({
    historyId: row.id,
    createdAt: row.createdAt,
    productId: row.productId,
    productName: row.product.name,
    sku: row.product.sku,
    categoryId: row.product.category?.id ?? null,
    categoryName: row.product.category?.name ?? null,
    storeId: row.storeId,
    storeName: row.store.name,
    type: row.type,
    quantity: row.quantity,
    stockBefore: row.stockBefore,
    stockAfter: row.stockAfter,
    ...calculateStockDelta(row.stockBefore, row.stockAfter),
    admin: row.admin,
    transactionId: row.transactionId,
    stockTransferRequestId: row.stockTransferRequestId,
    notes: row.notes,
  }));

export const buildStockReportSummary = (
  rows: ReturnType<typeof normalizeStockReportRows>,
  totalMovements: number,
  endingStock: bigint | number | null | undefined,
  totalProducts: bigint | number | null | undefined,
) => ({
  totalMovements,
  stockIn: rows.reduce((total, row) => total + row.stockIn, 0),
  stockOut: rows.reduce((total, row) => total + row.stockOut, 0),
  netChange: rows.reduce((total, row) => total + row.netChange, 0),
  endingStock: toNumber(endingStock),
  totalProducts: toNumber(totalProducts),
});
