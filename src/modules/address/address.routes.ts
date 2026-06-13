import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { createUserAddressController, deleteUserAddressController, getAddressesController, updateDefaultUserAddress, updateUserAddressController } from "./address.controller.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { addressIdParamSchema, createAddressBodySchema, updateAddressBodySchema } from "./address.validation.js";

const router = Router();

// GET /api/addresses - ambil list address milik user yang sedang login
router.get("/", verifyAccessToken, getAddressesController);

router.post(
  "/",
  verifyAccessToken,
  validateSchema(createAddressBodySchema, "body"),
  createUserAddressController,
);

router.patch(
  "/:addressId/default",
  verifyAccessToken,
  validateSchema(addressIdParamSchema, "params"),
  updateDefaultUserAddress,
);

router.delete(
  "/:addressId",
  verifyAccessToken,
  validateSchema(addressIdParamSchema, "params"),
  deleteUserAddressController,
);

router.patch(
  "/:addressId",
  verifyAccessToken,
  validateSchema(addressIdParamSchema, "params"),
  validateSchema(updateAddressBodySchema, "body"),
  updateUserAddressController,
);



export default router;