import type {
  VoucherCreateInput,
  VoucherUpdateInput,
} from "../../../generated/prisma/models.js";
import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { getAdminRequester } from "../admin-auth/adminRequester.service.js";
import { findStoreById } from "../store/store.repository.js";
import {
  assertVoucherDiscountTypeFields,
  assertVoucherStoreAccess,
  buildVoucherOrderBy,
  buildVoucherWhere,
  normalizeVoucherCode,
  resolveVoucherStoreId,
} from "./adminVoucher.helper.js";
import {
  countVouchers,
  createVoucher,
  findVoucherByCode,
  findVoucherByCodeExceptId,
  findVoucherById,
  findVouchers,
  softDeleteVoucher,
  updateVoucher,
} from "./adminVoucher.repository.js";
import type {
  TCreateVoucherBody,
  TGetVouchersQuery,
  TUpdateVoucherBody,
} from "./adminVoucher.schemas.js";

const assertVoucherStoreExists = async (storeId: string | null) => {
  if (!storeId) return;

  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");
};

export const getVouchersService = async (
  params: TGetVouchersQuery,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const scopedStoreId =
    requester.role.name === "storeAdmin" ? requester.storeId ?? "" : undefined;

  if (requester.role.name === "storeAdmin" && !scopedStoreId) {
    throw new AppError(400, "Requester is not assigned to a store");
  }

  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildVoucherWhere(params, scopedStoreId);
  const orderBy = buildVoucherOrderBy(params);

  const [vouchers, total] = await Promise.all([
    findVouchers(where, { skip, take: limit, orderBy }),
    countVouchers(where),
  ]);

  return {
    data: vouchers,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getVoucherService = async (id: string, requesterId: string) => {
  const requester = await getAdminRequester(requesterId);
  const voucher = await findVoucherById(id);
  if (!voucher) throw new AppError(404, "Voucher was not found");

  assertVoucherStoreAccess(requester, voucher.storeId);

  return voucher;
};

export const createVoucherService = async (
  params: TCreateVoucherBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const code = normalizeVoucherCode(params.code);
  const storeId = resolveVoucherStoreId(requester, params.storeId);

  assertVoucherDiscountTypeFields(params);
  await assertVoucherStoreExists(storeId);

  const existingVoucher = await findVoucherByCode(code);
  if (existingVoucher)
    throw new AppError(400, "Voucher code is already in use");

  const data: VoucherCreateInput = {
    name: params.name,
    code,
    quantity: params.quantity,
    minimumTransaction: params.minimumTransaction ?? null,
    maxDiscount: params.maxDiscount ?? null,
    discountType: params.discountType,
    voucherType: params.voucherType,
    value: params.value,
    startDate: params.startDate,
    endDate: params.endDate,
    store: storeId
      ? {
          connect: {
            id: storeId,
          },
        }
      : undefined,
  };

  return await createVoucher(data);
};

export const updateVoucherService = async (
  id: string,
  params: TUpdateVoucherBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const voucher = await findVoucherById(id);
  if (!voucher) throw new AppError(404, "Voucher was not found");

  assertVoucherStoreAccess(requester, voucher.storeId);

  const nextStoreId =
    requester.role.name === "storeAdmin"
      ? voucher.storeId
      : params.storeId === undefined
      ? voucher.storeId
      : params.storeId;
  const nextDiscountType = params.discountType ?? voucher.discountType;
  const nextValue = params.value ?? voucher.value;
  const nextStartDate = params.startDate ?? voucher.startDate;
  const nextEndDate = params.endDate ?? voucher.endDate;

  if (nextStartDate > nextEndDate!) {
    throw new AppError(400, "Start date cannot be after end date");
  }

  assertVoucherDiscountTypeFields({
    discountType: nextDiscountType,
    value: nextValue,
  });
  await assertVoucherStoreExists(nextStoreId);

  const code = params.code ? normalizeVoucherCode(params.code) : undefined;
  if (code) {
    const existingVoucher = await findVoucherByCodeExceptId(code, id);
    if (existingVoucher) {
      throw new AppError(400, "Voucher code is already in use");
    }
  }

  const data: VoucherUpdateInput = {
    name: params.name,
    code,
    quantity: params.quantity,
    minimumTransaction: params.minimumTransaction,
    maxDiscount: params.maxDiscount,
    discountType: params.discountType,
    voucherType: params.voucherType,
    value: params.value,
    startDate: params.startDate,
    endDate: params.endDate,
    store:
      requester.role.name === "superAdmin" && params.storeId !== undefined
        ? params.storeId
          ? {
              connect: {
                id: params.storeId,
              },
            }
          : {
              disconnect: true,
            }
        : undefined,
  };

  return await updateVoucher(id, data);
};

export const deleteVoucherService = async (id: string, requesterId: string) => {
  const requester = await getAdminRequester(requesterId);
  const voucher = await findVoucherById(id);
  if (!voucher) throw new AppError(404, "Voucher was not found");

  assertVoucherStoreAccess(requester, voucher.storeId);

  return await softDeleteVoucher(id);
};
