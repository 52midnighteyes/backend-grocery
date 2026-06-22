import { AppError } from "../../class/appError.js";
import { findStoreById } from "../store/store.repository.js";
import {
  buildPublicVoucherWhere,
  groupPublicVouchers,
} from "./voucher.helper.js";
import { findPublicVouchers } from "./voucher.repository.js";

export const getStoreVouchersService = async (storeId: string) => {
  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const vouchers = await findPublicVouchers(buildPublicVoucherWhere(storeId), {
    orderBy: [{ storeId: "desc" }, { startDate: "desc" }, { name: "asc" }],
  });

  return groupPublicVouchers(vouchers);
};
