import { Router } from "express";
import { verifyAdminAccessToken } from "../../middlewares/tokenVerification/adminTokenVerification.middleware.js";
import { permissionGuard } from "../../middlewares/permissionGuard/roleGuard.middleware.js";
import { validateSchema } from "../../middlewares/zodValidator.middleware.js";
import { adminGetOrdersQuerySchema, adminOrderParamsSchema, confirmPaymentBodySchema } from "./adminOrder.schemas.js";
import { cancelOrderByAdminController, confirmPaymentController, getAdminOrderController, getAdminOrderDetailController, shipOrderController } from "./adminOrder.controller.js";

const adminOrderRoutes = Router();

adminOrderRoutes.use(verifyAdminAccessToken);

adminOrderRoutes.get(
    "/",
    permissionGuard("order:read"),
    validateSchema(adminGetOrdersQuerySchema, "query"),
    getAdminOrderController,
);

adminOrderRoutes.get(
    "/:orderId",
    permissionGuard("order:read"),
    validateSchema(adminOrderParamsSchema, "params"),
    getAdminOrderDetailController,
);

adminOrderRoutes.patch(
    "/:orderId/payment",
    permissionGuard("order:update"),
    validateSchema(adminOrderParamsSchema, "params"),
    validateSchema(confirmPaymentBodySchema, "body"),
    confirmPaymentController,
)

adminOrderRoutes.patch(
    "/:orderId/ship",
    permissionGuard("order:update"),
    validateSchema(adminOrderParamsSchema, "params"),
    shipOrderController,
)

adminOrderRoutes.patch(
    "/:orderId/cancel",
    permissionGuard("order:cancel"),
    validateSchema(adminOrderParamsSchema, "params"),
    cancelOrderByAdminController,
)

export default adminOrderRoutes;