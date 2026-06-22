import { NextFunction, Request, Response } from "express";
import { cancelOrderByAdminService, confirmPaymentService, getAdminOrderDetailService, getAdminOrderService, shipOrderService } from "./adminOrder.service.js";
import { TAdminGetOrderQuerySchema, TAdminOrderParamsSchema, TConfirmPaymentBodySchema } from "./adminOrder.schemas.js";

export const getAdminOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const result = await getAdminOrderService(
            req.user!.id,
            req.validated?.query as TAdminGetOrderQuerySchema,
        );

        return res.status(200).json({
            message: "Orders fetched successfully",
            data: result.data,
            meta: result.meta,
        });
    } catch (error) {
        next(error);
    }
};

export const getAdminOrderDetailController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { orderId } = req.validated?.params as TAdminOrderParamsSchema;
        const order = await getAdminOrderDetailService(req.user!.id, orderId);

        return res.status(200).json({
            message: "Order fetched successfully",
            data: order,
        });
    } catch (error) {
        next(error);
    }
};

export const confirmPaymentController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { orderId } = req.validated?.params as TAdminOrderParamsSchema;
        const { action } = req.validated?.body as TConfirmPaymentBodySchema;

        await confirmPaymentService(req.user!.id, orderId, action);

        return res.status(200).json({
            message: action === "approve"
                ? "Payment approved successfully"
                : "Payment rejected successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const shipOrderController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { orderId } = req.validated?.params as TAdminOrderParamsSchema;
        await shipOrderService(req.user!.id, orderId);

        return res.status(200).json({
            message: "Order status updated to on delivery",
        });
    } catch (error) {
        next(error);
    }
};

export const cancelOrderByAdminController = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { orderId } = req.validated?.params as TAdminOrderParamsSchema;
        await cancelOrderByAdminService(req.user!.id, orderId);

        return res.status(200).json({
            message: "Order cancelled successfully",
        });
    } catch (error) {
        next(error);
    }
};