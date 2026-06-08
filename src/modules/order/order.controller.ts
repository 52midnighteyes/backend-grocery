import type { Request, Response, NextFunction } from "express";
import type {
  TCreateOrderSchema,
  TGetOrdersQuerySchema,
  TOrderParamsSchema,
  TUpdateOrderStatusSchema,
} from "./order.schemas.js";
import {
  createOrderService,
  getOrdersService,
  getOrderDetailService,
  updateOrderStatusService,
} from "./order.service.js";

export const createOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const payload = req.validated?.body as TCreateOrderSchema;

    const order = await createOrderService(userId, payload);

    res.status(201).json({ message: "Order created successfully", data: order });
  } catch (error) {
    next(error);
  }
};

export const getOrdersController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const query = req.validated?.query as TGetOrdersQuerySchema;

    const result = await getOrdersService(userId, query);

    res.status(200).json({ message: "Orders fetched successfully", ...result });
  } catch (error) {
    next(error);
  }
};

export const getOrderDetailController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TOrderParamsSchema;

    const order = await getOrderDetailService(userId, orderId);

    res.status(200).json({ message: "Order fetched successfully", data: order });
  } catch (error) {
    next(error);
  }
};

// Satu controller untuk handle perubahan status oleh user (cancel dan confirmed).
export const updateOrderStatusController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TOrderParamsSchema;
    const { status } = req.validated?.body as TUpdateOrderStatusSchema;

    await updateOrderStatusService(userId, orderId, status);

    res.status(200).json({ message: `Order ${status} successfully` });
  } catch (error) {
    next(error);
  }
};