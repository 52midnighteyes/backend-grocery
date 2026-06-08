import type { Request, Response, NextFunction } from "express";
import type {
  TCreateOrderSchema,
  TGetOrdersQuerySchema,
  TOrderParamsSchema,
} from "./order.schemas.js";
import {
  createOrderService,
  getOrdersService,
  getOrderDetailService,
  cancelOrderService,
  confirmOrderService,
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

export const cancelOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TOrderParamsSchema;

    await cancelOrderService(userId, orderId);

    res.status(200).json({ message: "Order cancelled successfully" });
  } catch (error) {
    next(error);
  }
};

export const confirmOrderController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id: userId } = req.user!;
    const { orderId } = req.validated?.params as TOrderParamsSchema;

    await confirmOrderService(userId, orderId);

    res.status(200).json({ message: "Order confirmed successfully" });
  } catch (error) {
    next(error);
  }
};