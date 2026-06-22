import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { getStoreVouchersController } from "./voucher.controller.js";
import { storeVoucherParamSchema } from "./voucher.schemas.js";

const voucherRoutes = Router();

voucherRoutes.get(
  "/store/:storeId",
  validateSchema(storeVoucherParamSchema, "params"),
  getStoreVouchersController,
);

export default voucherRoutes;
