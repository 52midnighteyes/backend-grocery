import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { getAdminRequester } from "../admin-auth/adminRequester.service.js";
import {
  buildDiscountReportOrderBy,
  buildDiscountReportWhere,
  buildVoucherReportOrderBy,
  buildVoucherReportWhere,
} from "./adminPromoReport.helper.js";
import {
  aggregateDiscountReports,
  aggregateVoucherReports,
  countDiscountReports,
  countVoucherReports,
  findDiscountReports,
  findVoucherReports,
} from "./adminPromoReport.repository.js";
import type {
  TGetDiscountReportsQuery,
  TGetVoucherReportsQuery,
} from "./adminPromoReport.schemas.js";

const resolveReportStoreId = async (
  requesterId: string,
  requestedStoreId?: string,
) => {
  const requester = await getAdminRequester(requesterId);

  if (requester.role.name !== "storeAdmin") return requestedStoreId;

  if (!requester.storeId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  return requester.storeId;
};

export const getDiscountReportsService = async (
  params: TGetDiscountReportsQuery,
  requesterId: string,
) => {
  const storeId = await resolveReportStoreId(requesterId, params.storeId);
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildDiscountReportWhere(params, storeId);
  const orderBy = buildDiscountReportOrderBy(params);

  const [items, total, aggregate] = await Promise.all([
    findDiscountReports(where, { skip, take: limit, orderBy }),
    countDiscountReports(where),
    aggregateDiscountReports(where),
  ]);

  return {
    data: {
      summary: {
        totalUsage: total,
        totalDiscountAmount: aggregate._sum.discountAmount ?? 0,
      },
      items,
    },
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getVoucherReportsService = async (
  params: TGetVoucherReportsQuery,
  requesterId: string,
) => {
  const storeId = await resolveReportStoreId(requesterId, params.storeId);
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildVoucherReportWhere(params, storeId);
  const orderBy = buildVoucherReportOrderBy(params);

  const [items, total, aggregate] = await Promise.all([
    findVoucherReports(where, { skip, take: limit, orderBy }),
    countVoucherReports(where),
    aggregateVoucherReports(where),
  ]);
  const totalVoucherDiscountAmount =
    params.voucherType === "delivery"
      ? 0
      : aggregate._sum.voucherDiscountAmount ?? 0;
  const totalDeliveryVoucherAmount =
    params.voucherType === "transaction"
      ? 0
      : aggregate._sum.deliveryVoucherAmount ?? 0;

  return {
    data: {
      summary: {
        totalUsage: total,
        totalVoucherDiscountAmount,
        totalDeliveryVoucherAmount,
        totalDiscountAmount:
          totalVoucherDiscountAmount + totalDeliveryVoucherAmount,
      },
      items,
    },
    meta: buildPaginationMeta(page, limit, total),
  };
};
