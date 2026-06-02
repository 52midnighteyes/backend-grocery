import { Router } from "express";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { getRoleByIdController, getRolesController } from "./role.controller.js";
import { roleIdParamSchema } from "./role.schemas.js";

const roleRoutes = Router();

roleRoutes.get("/", getRolesController);

roleRoutes.get(
  "/:id",
  validateSchema(roleIdParamSchema, "params"),
  getRoleByIdController,
);

export default roleRoutes;
