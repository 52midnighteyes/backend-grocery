import type {
  TCategoryShareRow,
  TCategoryTrendRow,
  TProductSalesRow,
  TProductTrendSalesRow,
  TProductTrendRow,
  TSalesReportDateRange,
  TSalesReportGranularity,
  TSalesTrendRow,
} from "./adminSalesReport.models.js";
import type { TSalesReportProductRankingQuery } from "./adminSalesReport.schemas.js";

const DEFAULT_DAILY_RANGE = 30;
const DEFAULT_MONTHLY_RANGE = 12;
const DEFAULT_YEARLY_RANGE = 5;
const DAILY_RANGE_LIMIT = 366;
const MONTHLY_RANGE_LIMIT = 24;
const YEARLY_RANGE_LIMIT = 10;
const OTHER_SERIES_KEY = "Others";

const toNumber = (value: bigint | number | null | undefined) => {
  if (typeof value === "bigint") return Number(value);
  return value ?? 0;
};

const toChartNumber = (value: string | number | undefined) => {
  if (typeof value === "number") return value;
  return 0;
};

const pad = (value: number) => String(value).padStart(2, "0");

const formatDate = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`;

const formatMonth = (date: Date) =>
  `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}`;

const formatYear = (date: Date) => String(date.getUTCFullYear());

const parseDateOnly = (date: string) => {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

const addDays = (date: Date, amount: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount));

const addMonths = (date: Date, amount: number) =>
  new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1));

const addYears = (date: Date, amount: number) =>
  new Date(Date.UTC(date.getUTCFullYear() + amount, 0, 1));

const startOfGranularity = (date: Date, granularity: TSalesReportGranularity) => {
  if (granularity === "daily") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  }

  if (granularity === "monthly") {
    return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
  }

  return new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
};

const addPeriod = (date: Date, granularity: TSalesReportGranularity, amount: number) => {
  if (granularity === "daily") return addDays(date, amount);
  if (granularity === "monthly") return addMonths(date, amount);
  return addYears(date, amount);
};

const formatPeriod = (date: Date, granularity: TSalesReportGranularity) => {
  if (granularity === "daily") return formatDate(date);
  if (granularity === "monthly") return formatMonth(date);
  return formatYear(date);
};

const getPeriodLimit = (granularity: TSalesReportGranularity) => {
  if (granularity === "daily") return DAILY_RANGE_LIMIT;
  if (granularity === "monthly") return MONTHLY_RANGE_LIMIT;
  return YEARLY_RANGE_LIMIT;
};

const getDefaultPeriodRange = (granularity: TSalesReportGranularity) => {
  if (granularity === "daily") return DEFAULT_DAILY_RANGE;
  if (granularity === "monthly") return DEFAULT_MONTHLY_RANGE;
  return DEFAULT_YEARLY_RANGE;
};

export const resolveSalesReportDateRange = (
  granularity: TSalesReportGranularity,
  startDate?: string,
  endDate?: string,
): TSalesReportDateRange => {
  const now = new Date();
  const today = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
  ));
  const resolvedEndDate = endDate ? parseDateOnly(endDate) : today;
  const endPeriodStart = startOfGranularity(resolvedEndDate, granularity);
  const resolvedStartDate = startDate
    ? parseDateOnly(startDate)
    : addPeriod(endPeriodStart, granularity, -(getDefaultPeriodRange(granularity) - 1));
  const startPeriodStart = startOfGranularity(resolvedStartDate, granularity);

  const periods: string[] = [];
  for (
    let cursor = startPeriodStart;
    cursor <= endPeriodStart;
    cursor = addPeriod(cursor, granularity, 1)
  ) {
    periods.push(formatPeriod(cursor, granularity));
  }

  const limit = getPeriodLimit(granularity);
  if (periods.length > limit) {
    throw new Error(`Date range cannot exceed ${limit} ${granularity} periods`);
  }

  return {
    startDate: resolvedStartDate,
    endDate: addDays(resolvedEndDate, 1),
    periods,
    resolvedRange: {
      startDate: formatDate(resolvedStartDate),
      endDate: formatDate(resolvedEndDate),
    },
  };
};

export const normalizeSalesTrendRows = (
  rows: TSalesTrendRow[],
  periods: string[],
) => {
  const rowMap = new Map(rows.map((row) => [row.period, row]));

  return periods.map((period) => {
    const row = rowMap.get(period);
    const productSales = toNumber(row?.productSales);
    const transactionVoucherDiscount = toNumber(
      row?.transactionVoucherDiscount,
    );
    const totalOrders = toNumber(row?.totalOrders);
    const totalRevenue = toNumber(row?.totalRevenue);

    return {
      period,
      totalOrders,
      totalItemsSold: toNumber(row?.totalItemsSold),
      productSales,
      transactionVoucherDiscount,
      deliveryRevenue: toNumber(row?.deliveryRevenue),
      totalRevenue,
      averageOrderValue:
        totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
    };
  });
};

export const normalizeCategoryTrendChartRows = (
  rows: TCategoryTrendRow[],
  periods: string[],
  series: ReturnType<typeof normalizeCategorySeriesRows>,
) => {
  const chartRows = periods.map((period) => {
    const chartRow: Record<string, string | number> = { period };
    for (const item of series) chartRow[item.key] = 0;
    return chartRow;
  });

  const chartRowMap = new Map(
    chartRows.map((row) => [row.period as string, row]),
  );

  for (const row of rows) {
    const chartRow = chartRowMap.get(row.period);
    if (!chartRow) continue;
    chartRow[row.categoryId] = toNumber(row.productSales);
  }

  return chartRows;
};

export const normalizeCategorySeriesRows = (rows: TCategoryShareRow[]) =>
  rows.map((row) => ({
    key: row.categoryId,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    totalItemsSold: toNumber(row.totalItemsSold),
    productSales: toNumber(row.productSales),
  }));

export const normalizeCategoryTrendItems = (rows: TCategoryTrendRow[]) =>
  rows.map((row) => ({
    period: row.period,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    totalItemsSold: toNumber(row.totalItemsSold),
    productSales: toNumber(row.productSales),
  }));

export const normalizeCategoryShareRows = (rows: TCategoryShareRow[]) => {
  const totalSales = rows.reduce(
    (total, row) => total + toNumber(row.productSales),
    0,
  );

  return rows.map((row) => {
    const productSales = toNumber(row.productSales);
    return {
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      totalItemsSold: toNumber(row.totalItemsSold),
      productSales,
      percentage:
        totalSales > 0
          ? Number(((productSales / totalSales) * 100).toFixed(2))
          : 0,
    };
  });
};

export const normalizeProductRows = (rows: TProductSalesRow[]) =>
  rows.map((row) => ({
    key: row.productId,
    productId: row.productId,
    productName: row.productName,
    sku: row.sku,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    totalItemsSold: toNumber(row.totalItemsSold),
    productSales: toNumber(row.productSales),
  }));

export const normalizeProductTrendSalesChartRows = (
  rows: TProductTrendSalesRow[],
  periods: string[],
  series: ReturnType<typeof buildProductTrendSalesSeries>,
) => {
  const topProductIds = new Set(
    series
      .filter((item) => !item.isOthers && item.productId)
      .map((item) => item.productId),
  );
  const hasOthers = series.some((item) => item.isOthers);

  const chartRows = periods.map((period) => {
    const chartRow: Record<string, string | number> = { period };
    for (const item of series) chartRow[item.key] = 0;
    return chartRow;
  });

  const chartRowMap = new Map(
    chartRows.map((row) => [row.period as string, row]),
  );

  for (const row of rows) {
    const chartRow = chartRowMap.get(row.period);
    if (!chartRow) continue;
    if (topProductIds.has(row.productId)) {
      chartRow[row.productId] =
        toChartNumber(chartRow[row.productId]) + toNumber(row.productSales);
      continue;
    }

    if (hasOthers) {
      chartRow[OTHER_SERIES_KEY] =
        toChartNumber(chartRow[OTHER_SERIES_KEY]) + toNumber(row.productSales);
    }
  }

  return chartRows;
};

export const normalizeProductTrendSalesItems = (
  rows: TProductTrendSalesRow[],
  series: ReturnType<typeof buildProductTrendSalesSeries>,
) => {
  const topProductIds = new Set(
    series
      .filter((item) => !item.isOthers && item.productId)
      .map((item) => item.productId),
  );
  const hasOthers = series.some((item) => item.isOthers);
  const items = rows
    .filter((row) => topProductIds.has(row.productId))
    .map((row) => ({
      period: row.period,
      key: row.productId,
      productId: row.productId,
      productName: row.productName,
      sku: row.sku,
      categoryId: row.categoryId,
      categoryName: row.categoryName,
      totalItemsSold: toNumber(row.totalItemsSold),
      productSales: toNumber(row.productSales),
      isOthers: false,
    }));

  if (!hasOthers) return items;

  const otherRows = new Map<string, {
    totalItemsSold: number;
    productSales: number;
  }>();

  for (const row of rows) {
    if (topProductIds.has(row.productId)) continue;

    const current = otherRows.get(row.period) ?? {
      totalItemsSold: 0,
      productSales: 0,
    };

    current.totalItemsSold += toNumber(row.totalItemsSold);
    current.productSales += toNumber(row.productSales);
    otherRows.set(row.period, current);
  }

  return [
    ...items,
    ...Array.from(otherRows.entries()).map(([period, row]) => ({
      period,
      key: OTHER_SERIES_KEY,
      productId: null,
      productName: OTHER_SERIES_KEY,
      sku: null,
      categoryId: null,
      categoryName: null,
      totalItemsSold: row.totalItemsSold,
      productSales: row.productSales,
      isOthers: true,
    })),
  ].sort((first, second) => {
    const periodSort = first.period.localeCompare(second.period);
    if (periodSort !== 0) return periodSort;
    return second.productSales - first.productSales;
  });
};

export const buildProductTrendSalesSeries = (
  rows: ReturnType<typeof normalizeProductRows>,
  limit: number,
  includeOthers: boolean,
) => {
  const topRows = rows.slice(0, limit);
  const otherRows = rows.slice(limit);
  const series: Array<{
    key: string;
    productId: string | null;
    productName: string;
    sku: string | null;
    categoryId: string | null;
    categoryName: string | null;
    totalItemsSold: number;
    productSales: number;
    isOthers: boolean;
  }> = topRows.map((row) => ({
    key: row.productId,
    productId: row.productId,
    productName: row.productName,
    sku: row.sku,
    categoryId: row.categoryId,
    categoryName: row.categoryName,
    totalItemsSold: row.totalItemsSold,
    productSales: row.productSales,
    isOthers: false,
  }));

  if (includeOthers && otherRows.length > 0) {
    series.push({
      key: OTHER_SERIES_KEY,
      productId: null,
      productName: OTHER_SERIES_KEY,
      sku: null,
      categoryId: null,
      categoryName: null,
      totalItemsSold: otherRows.reduce(
        (total, row) => total + row.totalItemsSold,
        0,
      ),
      productSales: otherRows.reduce((total, row) => total + row.productSales, 0),
      isOthers: true,
    });
  }

  return series;
};

export const normalizeProductTrendRows = (
  rows: TProductTrendRow[],
  periods: string[],
) => {
  const rowMap = new Map(rows.map((row) => [row.period, row]));

  return periods.map((period) => {
    const row = rowMap.get(period);

    return {
      period,
      totalItemsSold: toNumber(row?.totalItemsSold),
      productSales: toNumber(row?.productSales),
    };
  });
};

export const buildSalesSummary = (
  salesTrend: ReturnType<typeof normalizeSalesTrendRows>,
) => {
  const totalOrders = salesTrend.reduce((total, row) => total + row.totalOrders, 0);
  const totalItemsSold = salesTrend.reduce(
    (total, row) => total + row.totalItemsSold,
    0,
  );
  const productSales = salesTrend.reduce(
    (total, row) => total + row.productSales,
    0,
  );
  const transactionVoucherDiscount = salesTrend.reduce(
    (total, row) => total + row.transactionVoucherDiscount,
    0,
  );
  const deliveryRevenue = salesTrend.reduce(
    (total, row) => total + row.deliveryRevenue,
    0,
  );
  const totalRevenue = salesTrend.reduce(
    (total, row) => total + row.totalRevenue,
    0,
  );

  return {
    totalOrders,
    totalItemsSold,
    productSales,
    transactionVoucherDiscount,
    deliveryRevenue,
    totalRevenue,
    averageOrderValue:
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0,
  };
};

export const buildProductSalesComparator = (
  sortBy: TSalesReportProductRankingQuery["sortBy"],
  sortOrder: TSalesReportProductRankingQuery["sortOrder"],
) => {
  const multiplier = sortOrder === "asc" ? 1 : -1;

  return (
    first: ReturnType<typeof normalizeProductRows>[number],
    second: ReturnType<typeof normalizeProductRows>[number],
  ) => {
    const firstValue = first[sortBy];
    const secondValue = second[sortBy];

    if (typeof firstValue === "number" && typeof secondValue === "number") {
      return (firstValue - secondValue) * multiplier;
    }

    return String(firstValue).localeCompare(String(secondValue)) * multiplier;
  };
};
