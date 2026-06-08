import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/tokenVerification/tokenVerification.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { addToCartSchema, cartItemParamsSchema, updateCartSchema } from "./cart.schemas.js";
import {
  addToCartController,
  deleteCartItemController,
  getCartController,
  updateCartController,
} from "./cart.controller.js";

const router = Router();

router.get("/", verifyAccessToken, getCartController);

router.post(
  "/",
  verifyAccessToken,
  validateSchema(addToCartSchema, "body"),
  addToCartController,
);

router.patch(
  "/:cartItemId",
  verifyAccessToken,
  validateSchema(cartItemParamsSchema, "params"),
  validateSchema(updateCartSchema, "body"),
  updateCartController,
);

router.delete(
  "/:cartItemId",
  verifyAccessToken,
  validateSchema(cartItemParamsSchema, "params"),
  deleteCartItemController,
);

export default router;