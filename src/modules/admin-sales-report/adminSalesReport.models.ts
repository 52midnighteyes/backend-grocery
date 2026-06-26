import { TransactionStatus } from "../../../generated/prisma/enums.js";
import type { TransactionStatus as TTransactionStatus } from "../../../generated/prisma/enums.js";
import type { TSalesReportQuery } from "./adminSalesReport.schemas.js";

export type TSalesReportGranularity = TSalesReportQuery["granularity"];

export const SALES_REPORT_TRANSACTION_STATUSES = [
  TransactionStatus.paid,
  TransactionStatus.process,
  TransactionStatus.onDelivery,
  TransactionStatus.confirmed,
] as const satisfies readonly TTransactionStatus[];

export type TSalesReportDateRange = {
  startDate: Date;
  endDate: Date;
  periods: string[];
  resolvedRange: {
    startDate: string;
    endDate: string;
  };
};

export type TSalesTrendRow = {
  period: string;
  totalOrders: bigint | number | null;
  totalItemsSold: bigint | number | null;
  productSales: bigint | number | null;
  transactionVoucherDiscount: bigint | number | null;
  deliveryRevenue: bigint | number | null;
  totalRevenue: bigint | number | null;
};

export type TCategoryTrendRow = {
  period: string;
  categoryId: string;
  categoryName: string;
  totalItemsSold: bigint | number | null;
  productSales: bigint | number | null;
};

export type TCategoryShareRow = {
  categoryId: string;
  categoryName: string;
  totalItemsSold: bigint | number | null;
  productSales: bigint | number | null;
};

export type TProductSalesRow = {
  productId: string;
  productName: string;
  sku: string;
  categoryId: string;
  categoryName: string;
  totalItemsSold: bigint | number | null;
  productSales: bigint | number | null;
};

export type TProductTrendSalesRow = TProductSalesRow & {
  period: string;
};

export type TProductTrendRow = {
  period: string;
  totalItemsSold: bigint | number | null;
  productSales: bigint | number | null;
};

export type TTransactionReportRow = {
  transactionId: string;
  transactionStatus: string;
  storeId: string;
  storeName: string;
  customerId: string;
  customerName: string | null;
  customerEmail: string | null;
  paidAt: Date | null;
  updatedAt: Date;
  reportDate: Date;
  totalItemsSold: bigint | number | null;
  totalProductSales: bigint | number | null;
  transactionVoucherDiscount: bigint | number | null;
  deliveryRevenue: bigint | number | null;
  totalRevenue: bigint | number | null;
};
