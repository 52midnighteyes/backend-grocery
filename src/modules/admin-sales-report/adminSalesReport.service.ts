import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { getAdminRequester } from "../admin-auth/adminRequester.service.js";
import {
  buildProductTrendSalesSeries,
  buildProductSalesComparator,
  buildSalesSummary,
  normalizeCategorySeriesRows,
  normalizeCategoryShareRows,
  normalizeCategoryTrendChartRows,
  normalizeCategoryTrendItems,
  normalizeProductRows,
  normalizeProductTrendSalesChartRows,
  normalizeProductTrendSalesItems,
  normalizeProductTrendRows,
  normalizeSalesTrendRows,
  normalizeTransactionReportRows,
  resolveSalesReportDateRange,
} from "./adminSalesReport.helper.js";
import {
  countTransactionReportRows,
  findCategoryForSalesReport,
  findProductForSalesReport,
  getCategoryDetailTrendRows,
  getCategoryShareRows,
  getCategoryTrendRows,
  getProductSalesRows,
  getProductTrendSalesRows,
  getProductTrendRows,
  getSalesTrendRows,
  getTransactionReportRows,
} from "./adminSalesReport.repository.js";
import type {
  TSalesReportCategoryIdParam,
  TSalesReportProductIdParam,
  TSalesReportProductRankingQuery,
  TSalesReportProductTrendQuery,
  TSalesReportQuery,
  TSalesReportTransactionQuery,
} from "./adminSalesReport.schemas.js";

const resolveSalesReportScope = async (
  requesterId: string,
  requestedStoreId?: string,
) => {
  const requester = await getAdminRequester(requesterId);

  if (requester.role.name !== "storeAdmin") {
    return { storeId: requestedStoreId };
  }

  if (!requester.storeId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  if (requestedStoreId && requestedStoreId !== requester.storeId) {
    throw new AppError(403, "Forbidden");
  }

  return { storeId: requester.storeId };
};

const resolveDateRange = (params: TSalesReportQuery) => {
  try {
    return resolveSalesReportDateRange(
      params.granularity,
      params.startDate,
      params.endDate,
    );
  } catch (error) {
    if (error instanceof Error) throw new AppError(400, error.message);
    throw error;
  }
};

const buildFilterResponse = (
  params: TSalesReportQuery,
  scope: Awaited<ReturnType<typeof resolveSalesReportScope>>,
  range: ReturnType<typeof resolveDateRange>,
) => ({
  granularity: params.granularity,
  storeId: scope.storeId ?? null,
  startDate: range.periods[0],
  endDate: range.periods[range.periods.length - 1],
  resolvedRange: range.resolvedRange,
});

export const getSalesReportService = async (
  params: TSalesReportQuery,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const chart = normalizeSalesTrendRows(
    await getSalesTrendRows(
      params.granularity,
      range.startDate,
      range.endDate,
      scope.storeId,
    ),
    range.periods,
  );

  return {
    data: {
      filters: buildFilterResponse(params, scope, range),
      summary: buildSalesSummary(chart),
      chart,
    },
  };
};

export const getCategorySalesReportService = async (
  params: TSalesReportQuery,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const [categoryTrendRows, categoryShareRows] = await Promise.all([
    getCategoryTrendRows(
      params.granularity,
      range.startDate,
      range.endDate,
      scope.storeId,
    ),
    getCategoryShareRows(range.startDate, range.endDate, scope.storeId),
  ]);
  const items = normalizeCategoryTrendItems(categoryTrendRows);
  const series = normalizeCategorySeriesRows(categoryShareRows);
  const totalItemsSold = items.reduce((total, row) => total + row.totalItemsSold, 0);
  const productSales = items.reduce(
    (total, row) => total + row.productSales,
    0,
  );

  return {
    data: {
      filters: buildFilterResponse(params, scope, range),
      summary: {
        totalItemsSold,
        productSales,
      },
      chart: normalizeCategoryTrendChartRows(categoryTrendRows, range.periods, series),
      series,
      share: normalizeCategoryShareRows(categoryShareRows),
      items,
    },
  };
};

export const getProductSalesReportService = async (
  params: TSalesReportProductTrendQuery,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const [trendRows, aggregateRows] = await Promise.all([
    getProductTrendSalesRows(
      params.granularity,
      range.startDate,
      range.endDate,
      scope.storeId,
      params.categoryId,
      params.q,
    ),
    getProductSalesRows(
      range.startDate,
      range.endDate,
      scope.storeId,
      params.categoryId,
      params.q,
    ),
  ]);
  const productRows = normalizeProductRows(aggregateRows);
  const series = buildProductTrendSalesSeries(
    productRows,
    params.limit,
    params.includeOthers,
  );
  const items = normalizeProductTrendSalesItems(trendRows, series);
  const totalItemsSold = productRows.reduce((sum, row) => sum + row.totalItemsSold, 0);
  const totalProductSales = productRows.reduce(
    (sum, row) => sum + row.productSales,
    0,
  );

  return {
    data: {
      filters: {
        ...buildFilterResponse(params, scope, range),
        categoryId: params.categoryId ?? null,
        q: params.q ?? null,
        limit: params.limit,
        includeOthers: params.includeOthers,
      },
      summary: {
        totalItemsSold,
        productSales: totalProductSales,
      },
      chart: normalizeProductTrendSalesChartRows(trendRows, range.periods, series),
      series,
      items,
    },
  };
};

export const getProductRankingSalesReportService = async (
  params: TSalesReportProductRankingQuery,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const rows = normalizeProductRows(
    await getProductSalesRows(
      range.startDate,
      range.endDate,
      scope.storeId,
      params.categoryId,
      params.q,
    ),
  ).sort(buildProductSalesComparator(params.sortBy, params.sortOrder));
  const total = rows.length;
  const start = (params.page - 1) * params.limit;
  const items = rows.slice(start, start + params.limit);
  const totalItemsSold = rows.reduce((sum, row) => sum + row.totalItemsSold, 0);
  const productSales = rows.reduce(
    (sum, row) => sum + row.productSales,
    0,
  );

  return {
    data: {
      filters: {
        ...buildFilterResponse(params, scope, range),
        categoryId: params.categoryId ?? null,
        q: params.q ?? null,
      },
      summary: {
        totalProducts: total,
        totalItemsSold,
        productSales,
      },
      items,
    },
    meta: buildPaginationMeta(params.page, params.limit, total),
  };
};

export const getProductTrendReportService = async (
  params: TSalesReportQuery,
  productParams: TSalesReportProductIdParam,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const product = await findProductForSalesReport(
    productParams.productId,
    scope.storeId,
  );

  if (!product) throw new AppError(404, "Product not found");

  const chart = normalizeProductTrendRows(
    await getProductTrendRows(
      product.id,
      params.granularity,
      range.startDate,
      range.endDate,
      scope.storeId,
    ),
    range.periods,
  );
  const totalItemsSold = chart.reduce((sum, row) => sum + row.totalItemsSold, 0);
  const productSales = chart.reduce(
    (sum, row) => sum + row.productSales,
    0,
  );

  return {
    data: {
      filters: buildFilterResponse(params, scope, range),
      product: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
      },
      summary: {
        totalItemsSold,
        productSales,
      },
      chart,
    },
  };
};

export const getCategoryTrendReportService = async (
  params: TSalesReportQuery,
  categoryParams: TSalesReportCategoryIdParam,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const category = await findCategoryForSalesReport(categoryParams.categoryId);

  if (!category) throw new AppError(404, "Category not found");

  const chart = normalizeProductTrendRows(
    await getCategoryDetailTrendRows(
      category.id,
      params.granularity,
      range.startDate,
      range.endDate,
      scope.storeId,
    ),
    range.periods,
  );
  const totalItemsSold = chart.reduce((sum, row) => sum + row.totalItemsSold, 0);
  const productSales = chart.reduce(
    (sum, row) => sum + row.productSales,
    0,
  );

  return {
    data: {
      filters: buildFilterResponse(params, scope, range),
      category,
      summary: {
        totalItemsSold,
        productSales,
      },
      chart,
    },
  };
};

export const getTransactionSalesReportService = async (
  params: TSalesReportTransactionQuery,
  requesterId: string,
) => {
  const scope = await resolveSalesReportScope(requesterId, params.storeId);
  const range = resolveDateRange(params);
  const [rows, total] = await Promise.all([
    getTransactionReportRows(
      range.startDate,
      range.endDate,
      params.page,
      params.limit,
      scope.storeId,
      params.status,
      params.q,
    ),
    countTransactionReportRows(
      range.startDate,
      range.endDate,
      scope.storeId,
      params.status,
      params.q,
    ),
  ]);

  return {
    data: {
      filters: {
        ...buildFilterResponse(params, scope, range),
        status: params.status ?? null,
        q: params.q ?? null,
      },
      items: normalizeTransactionReportRows(rows),
    },
    meta: buildPaginationMeta(params.page, params.limit, total),
  };
};
