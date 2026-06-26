import { prisma } from "../../libs/prisma/prisma.lib.js";
import { SALES_REPORT_TRANSACTION_STATUSES } from "./adminSalesReport.models.js";
import type {
  TCategoryShareRow,
  TCategoryTrendRow,
  TProductSalesRow,
  TProductTrendSalesRow,
  TProductTrendRow,
  TSalesReportGranularity,
  TSalesTrendRow,
  TTransactionReportRow,
} from "./adminSalesReport.models.js";

const getPeriodSql = (granularity: TSalesReportGranularity) => {
  if (granularity === "daily") {
    return {
      trunc: "day",
      format: "YYYY-MM-DD",
    };
  }

  if (granularity === "yearly") {
    return {
      trunc: "year",
      format: "YYYY",
    };
  }

  return {
    trunc: "month",
    format: "YYYY-MM",
  };
};

export const getSalesTrendRows = async (
  granularity: TSalesReportGranularity,
  startDate: Date,
  endDate: Date,
  storeId?: string,
) => {
  const storeFilter = storeId ?? null;
  const period = getPeriodSql(granularity);

  return await prisma.$queryRaw<TSalesTrendRow[]>`
    WITH transaction_sales AS (
      SELECT
        t.id,
        TO_CHAR(DATE_TRUNC(${period.trunc}, COALESCE(t.paid_at, t.updated_at)), ${period.format}) AS "period",
        SUM(ti.total_price)::bigint AS "productSales",
        SUM(ti.quantity)::bigint AS "totalItemsSold",
        COALESCE(MAX(vh.voucher_discount_amount), 0)::bigint AS "transactionVoucherDiscount",
        t.delivery_fee::bigint AS "deliveryRevenue",
        t.total_price::bigint AS "totalRevenue"
      FROM "transaction" t
      JOIN transaction_item ti ON ti.transaction_id = t.id
      LEFT JOIN voucher_history vh ON vh.transaction_id = t.id
      WHERE t.deleted_at IS NULL
        AND ti.deleted_at IS NULL
        AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
        AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
        AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
        AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
      GROUP BY t.id, "period", t.delivery_fee, t.total_price
    )
    SELECT
      "period",
      COUNT(id)::bigint AS "totalOrders",
      COALESCE(SUM("totalItemsSold"), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM("productSales"), 0)::bigint AS "productSales",
      COALESCE(SUM("transactionVoucherDiscount"), 0)::bigint AS "transactionVoucherDiscount",
      COALESCE(SUM("deliveryRevenue"), 0)::bigint AS "deliveryRevenue",
      COALESCE(SUM("totalRevenue"), 0)::bigint AS "totalRevenue"
    FROM transaction_sales
    GROUP BY "period"
    ORDER BY "period" ASC
  `;
};

export const getCategoryTrendRows = async (
  granularity: TSalesReportGranularity,
  startDate: Date,
  endDate: Date,
  storeId?: string,
) => {
  const storeFilter = storeId ?? null;
  const period = getPeriodSql(granularity);

  return await prisma.$queryRaw<TCategoryTrendRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${period.trunc}, COALESCE(t.paid_at, t.updated_at)), ${period.format}) AS "period",
      c.id AS "categoryId",
      c.name AS "categoryName",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    JOIN product p ON p.id = ti.product_id
    JOIN category c ON c.id = p.category_id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
    GROUP BY "period", c.id, c.name
    ORDER BY "period" ASC, "productSales" DESC, c.name ASC
  `;
};

export const getCategoryShareRows = async (
  startDate: Date,
  endDate: Date,
  storeId?: string,
) => {
  const storeFilter = storeId ?? null;

  return await prisma.$queryRaw<TCategoryShareRow[]>`
    SELECT
      c.id AS "categoryId",
      c.name AS "categoryName",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    JOIN product p ON p.id = ti.product_id
    JOIN category c ON c.id = p.category_id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
    GROUP BY c.id, c.name
    ORDER BY "productSales" DESC, c.name ASC
  `;
};

export const getProductSalesRows = async (
  startDate: Date,
  endDate: Date,
  storeId?: string,
  categoryId?: string,
  q?: string,
) => {
  const storeFilter = storeId ?? null;
  const search = q ? `%${q}%` : null;

  return await prisma.$queryRaw<TProductSalesRow[]>`
    SELECT
      p.id AS "productId",
      p.name AS "productName",
      p.sku AS "sku",
      c.id AS "categoryId",
      c.name AS "categoryName",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    JOIN product p ON p.id = ti.product_id
    JOIN category c ON c.id = p.category_id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
      AND (${categoryId ?? null}::text IS NULL OR c.id = ${categoryId ?? null}::text)
      AND (${search}::text IS NULL OR p.name ILIKE ${search} OR p.sku ILIKE ${search})
    GROUP BY p.id, p.name, p.sku, c.id, c.name
    ORDER BY "productSales" DESC, "totalItemsSold" DESC, p.name ASC
  `;
};

export const getProductTrendSalesRows = async (
  granularity: TSalesReportGranularity,
  startDate: Date,
  endDate: Date,
  storeId?: string,
  categoryId?: string,
  q?: string,
) => {
  const storeFilter = storeId ?? null;
  const search = q ? `%${q}%` : null;
  const period = getPeriodSql(granularity);

  return await prisma.$queryRaw<TProductTrendSalesRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${period.trunc}, COALESCE(t.paid_at, t.updated_at)), ${period.format}) AS "period",
      p.id AS "productId",
      p.name AS "productName",
      p.sku AS "sku",
      c.id AS "categoryId",
      c.name AS "categoryName",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    JOIN product p ON p.id = ti.product_id
    JOIN category c ON c.id = p.category_id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
      AND (${categoryId ?? null}::text IS NULL OR c.id = ${categoryId ?? null}::text)
      AND (${search}::text IS NULL OR p.name ILIKE ${search} OR p.sku ILIKE ${search})
    GROUP BY "period", p.id, p.name, p.sku, c.id, c.name
    ORDER BY "period" ASC, "productSales" DESC, p.name ASC
  `;
};

export const findProductForSalesReport = async (
  productId: string,
  storeId?: string,
) => {
  return await prisma.product.findFirst({
    where: {
      id: productId,
      deletedAt: null,
      ...(storeId
        ? {
            stocks: {
              some: {
                storeId,
                deletedAt: null,
              },
            },
          }
        : {}),
    },
    select: {
      id: true,
      name: true,
      sku: true,
      category: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};

export const findCategoryForSalesReport = async (
  categoryId: string,
) => {
  return await prisma.category.findFirst({
    where: {
      id: categoryId,
      deletedAt: null,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

export const getProductTrendRows = async (
  productId: string,
  granularity: TSalesReportGranularity,
  startDate: Date,
  endDate: Date,
  storeId?: string,
) => {
  const storeFilter = storeId ?? null;
  const period = getPeriodSql(granularity);

  return await prisma.$queryRaw<TProductTrendRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${period.trunc}, COALESCE(t.paid_at, t.updated_at)), ${period.format}) AS "period",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND ti.product_id = ${productId}::text
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
    GROUP BY "period"
    ORDER BY "period" ASC
  `;
};

export const getCategoryDetailTrendRows = async (
  categoryId: string,
  granularity: TSalesReportGranularity,
  startDate: Date,
  endDate: Date,
  storeId?: string,
) => {
  const storeFilter = storeId ?? null;
  const period = getPeriodSql(granularity);

  return await prisma.$queryRaw<TProductTrendRow[]>`
    SELECT
      TO_CHAR(DATE_TRUNC(${period.trunc}, COALESCE(t.paid_at, t.updated_at)), ${period.format}) AS "period",
      COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
      COALESCE(SUM(ti.total_price), 0)::bigint AS "productSales"
    FROM "transaction" t
    JOIN transaction_item ti ON ti.transaction_id = t.id
    JOIN product p ON p.id = ti.product_id
    JOIN category c ON c.id = p.category_id
    WHERE t.deleted_at IS NULL
      AND ti.deleted_at IS NULL
      AND p.deleted_at IS NULL
      AND c.deleted_at IS NULL
      AND c.id = ${categoryId}::text
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
    GROUP BY "period"
    ORDER BY "period" ASC
  `;
};

export const getTransactionReportRows = async (
  startDate: Date,
  endDate: Date,
  page: number,
  limit: number,
  storeId?: string,
  status?: string,
  q?: string,
) => {
  const storeFilter = storeId ?? null;
  const statusFilter = status ?? null;
  const search = q ? `%${q}%` : null;
  const offset = (page - 1) * limit;

  return await prisma.$queryRaw<TTransactionReportRow[]>`
    WITH item_sales AS (
      SELECT
        ti.transaction_id,
        COALESCE(SUM(ti.quantity), 0)::bigint AS "totalItemsSold",
        COALESCE(SUM(ti.total_price), 0)::bigint AS "totalProductSales"
      FROM transaction_item ti
      WHERE ti.deleted_at IS NULL
      GROUP BY ti.transaction_id
    ),
    voucher_sales AS (
      SELECT
        vh.transaction_id,
        COALESCE(SUM(vh.voucher_discount_amount), 0)::bigint AS "transactionVoucherDiscount"
      FROM voucher_history vh
      GROUP BY vh.transaction_id
    )
    SELECT
      t.id AS "transactionId",
      t.transaction_status::text AS "transactionStatus",
      t.store_id AS "storeId",
      s.name AS "storeName",
      t.customer_id AS "customerId",
      u.name AS "customerName",
      u.email AS "customerEmail",
      t.paid_at AS "paidAt",
      t.updated_at AS "updatedAt",
      COALESCE(t.paid_at, t.updated_at) AS "reportDate",
      item_sales."totalItemsSold",
      item_sales."totalProductSales",
      COALESCE(voucher_sales."transactionVoucherDiscount", 0)::bigint AS "transactionVoucherDiscount",
      t.delivery_fee::bigint AS "deliveryRevenue",
      t.total_price::bigint AS "totalRevenue"
    FROM "transaction" t
    JOIN item_sales ON item_sales.transaction_id = t.id
    JOIN store s ON s.id = t.store_id
    JOIN "user" u ON u.id = t.customer_id
    LEFT JOIN voucher_sales ON voucher_sales.transaction_id = t.id
    WHERE t.deleted_at IS NULL
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND (${statusFilter}::text IS NULL OR t.transaction_status::text = ${statusFilter}::text)
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
      AND (${search}::text IS NULL OR t.id ILIKE ${search} OR u.name ILIKE ${search} OR u.email ILIKE ${search})
    ORDER BY "reportDate" DESC, t.id DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;
};

export const countTransactionReportRows = async (
  startDate: Date,
  endDate: Date,
  storeId?: string,
  status?: string,
  q?: string,
) => {
  const storeFilter = storeId ?? null;
  const statusFilter = status ?? null;
  const search = q ? `%${q}%` : null;

  const rows = await prisma.$queryRaw<Array<{ total: bigint }>>`
    SELECT COUNT(DISTINCT t.id)::bigint AS total
    FROM "transaction" t
    JOIN "user" u ON u.id = t.customer_id
    WHERE t.deleted_at IS NULL
      AND EXISTS (
        SELECT 1
        FROM transaction_item ti
        WHERE ti.transaction_id = t.id
          AND ti.deleted_at IS NULL
      )
      AND t.transaction_status::text IN (${SALES_REPORT_TRANSACTION_STATUSES[0]}, ${SALES_REPORT_TRANSACTION_STATUSES[1]}, ${SALES_REPORT_TRANSACTION_STATUSES[2]}, ${SALES_REPORT_TRANSACTION_STATUSES[3]})
      AND (${statusFilter}::text IS NULL OR t.transaction_status::text = ${statusFilter}::text)
      AND COALESCE(t.paid_at, t.updated_at) >= ${startDate}
      AND COALESCE(t.paid_at, t.updated_at) < ${endDate}
      AND (${storeFilter}::text IS NULL OR t.store_id = ${storeFilter}::text)
      AND (${search}::text IS NULL OR t.id ILIKE ${search} OR u.name ILIKE ${search} OR u.email ILIKE ${search})
  `;

  return Number(rows[0]?.total ?? 0);
};
