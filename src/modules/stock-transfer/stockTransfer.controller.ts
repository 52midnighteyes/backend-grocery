import type { NextFunction, Request, Response } from "express";
import {
  approveStockTransferRequestService,
  cancelStockTransferRequestService,
  createStockTransferRequestService,
  getStoreStockTransferRequestByIdService,
  getStoreStockTransferRequestsService,
  getStockTransferRequestByIdService,
  getStockTransferRequestsService,
  getStockTransferSourcesService,
  receiveStockTransferRequestService,
  rejectStockTransferRequestService,
} from "./stockTransfer.service.js";
import type {
  TCancelStockTransferRequestBody,
  TCreateStockTransferRequestBody,
  TGetStockTransferRequestsQuery,
  TGetStockTransferSourcesQuery,
  TReceiveStockTransferRequestBody,
  TRespondStockTransferRequestBody,
  TStockTransferStoreParam,
  TStockTransferRequestParam,
  TStockTransferStoreRequestParam,
} from "./stockTransfer.schemas.js";

export const getStockTransferSourcesController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const sources = await getStockTransferSourcesService(
      req.validated?.query as TGetStockTransferSourcesQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer sources fetched successfully",
      data: sources,
    });
  } catch (error) {
    next(error);
  }
};

export const createStockTransferRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const request = await createStockTransferRequestService(
      req.validated?.body as TCreateStockTransferRequestBody,
      req.user!.id,
    );

    return res.status(201).json({
      message: "Stock transfer request created successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockTransferRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await getStockTransferRequestsService(
      req.validated?.query as TGetStockTransferRequestsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer requests fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStockTransferRequestByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TStockTransferRequestParam;
    const request = await getStockTransferRequestByIdService(id, req.user!.id);

    return res.status(200).json({
      message: "Stock transfer request fetched successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreStockTransferRequestsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId } = req.validated?.params as TStockTransferStoreParam;
    const result = await getStoreStockTransferRequestsService(
      storeId,
      req.validated?.query as TGetStockTransferRequestsQuery,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store stock transfer requests fetched successfully",
      data: result.data,
      meta: result.meta,
    });
  } catch (error) {
    next(error);
  }
};

export const getStoreStockTransferRequestByIdController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { storeId, id } =
      req.validated?.params as TStockTransferStoreRequestParam;
    const request = await getStoreStockTransferRequestByIdService(
      storeId,
      id,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Store stock transfer request fetched successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const approveStockTransferRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TStockTransferRequestParam;
    const result = await approveStockTransferRequestService(
      id,
      req.validated?.body as TRespondStockTransferRequestBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer request approved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rejectStockTransferRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TStockTransferRequestParam;
    const request = await rejectStockTransferRequestService(
      id,
      req.validated?.body as TRespondStockTransferRequestBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer request rejected successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};

export const receiveStockTransferRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TStockTransferRequestParam;
    const result = await receiveStockTransferRequestService(
      id,
      req.validated?.body as TReceiveStockTransferRequestBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer request received successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelStockTransferRequestController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.validated?.params as TStockTransferRequestParam;
    const request = await cancelStockTransferRequestService(
      id,
      req.validated?.body as TCancelStockTransferRequestBody,
      req.user!.id,
    );

    return res.status(200).json({
      message: "Stock transfer request cancelled successfully",
      data: request,
    });
  } catch (error) {
    next(error);
  }
};
