import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { validateSchema } from "../middlewares/zodValidator.middleware.js";
import { createProductController } from "./product.controller.js";
import { createProductSchema } from "./products/product.schemas.js";

const productRoutes = Router();

productRoutes.post(
  "/",
  upload.array("images", 10),
  validateSchema(createProductSchema, "body"),
  createProductController
);

export default productRoutes;
