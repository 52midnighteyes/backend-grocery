import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import {
  getStoreByIdController,
  getStoreOptionsController,
  getStoresController,
} from "./store.controller.js";
import {
  getStoresQuerySchema,
  storeIdParamSchema,
} from "./store.schemas.js";

const storeRoutes = Router();

storeRoutes.get(
  "/",
  validateSchema(getStoresQuerySchema, "query"),
  getStoresController
);

storeRoutes.get("/options", getStoreOptionsController);

storeRoutes.get(
  "/:id",
  validateSchema(storeIdParamSchema, "params"),
  getStoreByIdController
);

export default storeRoutes;
