import { AppError } from "../../class/appError.js";
import { buildPaginationMeta } from "../../helper/pagination.js";
import { prisma } from "../../libs/prisma/prisma.lib.js";
import { findStoreById } from "../store/store.repository.js";
import {
  createStockHistory,
  findStoreStockByProductId,
  updateStoreStockQuantity,
  upsertStoreStock,
} from "../stock/stock.repository.js";
import {
  assertCanAccessStockTransferStore,
  assertCanManageDestinationStore,
  assertCanManageSourceStore,
  assertCanViewStockTransferRequest,
  assertDifferentStockTransferStores,
  assertSourceStockAvailable,
  assertStockTransferCreateDataExists,
  assertStockTransferRequestFound,
  assertStockTransferRequestBelongsToStore,
  assertStockTransferTransitionUpdated,
  buildApproveStockTransferData,
  buildCancelStockTransferData,
  buildCreateStockTransferRequestData,
  buildReceiveStockTransferData,
  buildRejectStockTransferData,
  buildStockTransferSourcesWhere,
  buildStockTransferRequestOrderBy,
  buildStockTransferRequestWhere,
  buildStockTransferApprovalNotes,
  buildStockTransferReceivedNotes,
  buildTransferInHistoryData,
  buildTransferOutHistoryData,
  calculateStockTransferIn,
  calculateStockTransferOut,
  getAdminRequester,
  getStockTransferDestinationStoreId,
} from "./stockTransfer.helper.js";
import {
  countStockTransferRequests,
  createStockTransferRequest,
  findStockTransferRequestById,
  findStockTransferRequests,
  findStockTransferSources,
  updateStockTransferRequestStatus,
} from "./stockTransfer.repository.js";
import type {
  TCancelStockTransferRequestBody,
  TCreateStockTransferRequestBody,
  TGetStockTransferRequestsQuery,
  TGetStockTransferSourcesQuery,
  TReceiveStockTransferRequestBody,
  TRespondStockTransferRequestBody,
} from "./stockTransfer.schemas.js";

const getStockTransferRequestsForRequester = async (
  params: TGetStockTransferRequestsQuery,
  requester: Awaited<ReturnType<typeof getAdminRequester>>,
) => {
  const page = params.page;
  const limit = params.limit;
  const skip = (page - 1) * limit;
  const where = buildStockTransferRequestWhere(params, requester);
  const orderBy = buildStockTransferRequestOrderBy(params);

  const [requests, total] = await Promise.all([
    findStockTransferRequests(where, { skip, take: limit, orderBy }),
    countStockTransferRequests(where),
  ]);

  return {
    data: requests,
    meta: buildPaginationMeta(page, limit, total),
  };
};

export const getStockTransferSourcesService = async (
  params: TGetStockTransferSourcesQuery,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const where = buildStockTransferSourcesWhere(params, requester);

  return await findStockTransferSources(where);
};

export const createStockTransferRequestService = async (
  params: TCreateStockTransferRequestBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const toStoreId = getStockTransferDestinationStoreId(requester, params);
  assertDifferentStockTransferStores(params.fromStoreId, toStoreId);

  const [fromStore, toStore, sourceStock] = await Promise.all([
    findStoreById(params.fromStoreId),
    findStoreById(toStoreId),
    findStoreStockByProductId(params.fromStoreId, params.productId),
  ]);

  assertStockTransferCreateDataExists(
    fromStore,
    toStore,
    sourceStock
  );
  const availableSourceStock = assertSourceStockAvailable(
    sourceStock,
    params.quantity
  );

  return await prisma.$transaction(async (tx) => {
    await upsertStoreStock(toStoreId, params.productId, tx);

    return await createStockTransferRequest(
      buildCreateStockTransferRequestData(
        params,
        toStoreId,
        requester.id,
        availableSourceStock.product.name
      ),
      tx
    );
  });
};

export const getStockTransferRequestsService = async (
  params: TGetStockTransferRequestsQuery,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);

  return await getStockTransferRequestsForRequester(params, requester);
};

export const getStoreStockTransferRequestsService = async (
  storeId: string,
  params: TGetStockTransferRequestsQuery,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  assertCanAccessStockTransferStore(requester, storeId);

  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  return await getStockTransferRequestsForRequester(
    { ...params, storeId },
    requester,
  );
};

export const getStockTransferRequestByIdService = async (
  id: string,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const request = await findStockTransferRequestById(id);
  const stockTransferRequest = assertStockTransferRequestFound(request);

  assertCanViewStockTransferRequest(requester, stockTransferRequest);

  return stockTransferRequest;
};

export const getStoreStockTransferRequestByIdService = async (
  storeId: string,
  id: string,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  assertCanAccessStockTransferStore(requester, storeId);

  const store = await findStoreById(storeId);
  if (!store) throw new AppError(404, "Store was not found");

  const request = await findStockTransferRequestById(id);
  const stockTransferRequest = assertStockTransferRequestFound(request);

  assertStockTransferRequestBelongsToStore(stockTransferRequest, storeId);
  assertCanViewStockTransferRequest(requester, stockTransferRequest);

  return stockTransferRequest;
};

export const approveStockTransferRequestService = async (
  id: string,
  params: TRespondStockTransferRequestBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);

  return await prisma.$transaction(async (tx) => {
    const request = assertStockTransferRequestFound(
      await findStockTransferRequestById(id, tx)
    );
    assertCanManageSourceStore(requester, request.fromStoreId);
    const responseNotes = buildStockTransferApprovalNotes(
      request,
      params.responseNotes
    );

    const transition = await updateStockTransferRequestStatus(
      id,
      "pending",
      buildApproveStockTransferData(requester.id, responseNotes),
      tx
    );
    assertStockTransferTransitionUpdated(transition.count, "pending");

    const sourceStock = assertSourceStockAvailable(
      await findStoreStockByProductId(
        request.fromStoreId,
        request.productId,
        tx
      ),
      request.quantity
    );

    const { stockBefore, stockAfter } = calculateStockTransferOut(
      sourceStock.stock,
      request.quantity
    );
    const updatedStock = await updateStoreStockQuantity(
      sourceStock.id,
      stockAfter,
      tx
    );

    const history = await createStockHistory(
      buildTransferOutHistoryData({
        requestId: id,
        request,
        requesterId: requester.id,
        stockBefore,
        stockAfter,
        responseNotes,
      }),
      tx
    );

    const transferRequest = await findStockTransferRequestById(id, tx);

    return {
      request: transferRequest,
      stock: updatedStock,
      history,
    };
  });
};

export const rejectStockTransferRequestService = async (
  id: string,
  params: TRespondStockTransferRequestBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const request = assertStockTransferRequestFound(
    await findStockTransferRequestById(id)
  );
  assertCanManageSourceStore(requester, request.fromStoreId);

  const transition = await updateStockTransferRequestStatus(
    id,
    "pending",
    buildRejectStockTransferData(requester.id, params.responseNotes)
  );
  assertStockTransferTransitionUpdated(transition.count, "pending");

  return await findStockTransferRequestById(id);
};

export const receiveStockTransferRequestService = async (
  id: string,
  params: TReceiveStockTransferRequestBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);

  return await prisma.$transaction(async (tx) => {
    const request = assertStockTransferRequestFound(
      await findStockTransferRequestById(id, tx)
    );
    assertCanManageDestinationStore(requester, request.toStoreId);
    const receivedNotes = buildStockTransferReceivedNotes(
      request,
      params.receivedNotes
    );

    const transition = await updateStockTransferRequestStatus(
      id,
      "approved",
      buildReceiveStockTransferData(requester.id, receivedNotes),
      tx
    );
    assertStockTransferTransitionUpdated(transition.count, "approved");

    const destinationStock = await upsertStoreStock(
      request.toStoreId,
      request.productId,
      tx
    );

    const { stockBefore, stockAfter } = calculateStockTransferIn(
      destinationStock.stock,
      request.quantity
    );
    const updatedStock = await updateStoreStockQuantity(
      destinationStock.id,
      stockAfter,
      tx
    );

    const history = await createStockHistory(
      buildTransferInHistoryData({
        requestId: id,
        request,
        requesterId: requester.id,
        stockBefore,
        stockAfter,
        receivedNotes,
      }),
      tx
    );

    const transferRequest = await findStockTransferRequestById(id, tx);

    return {
      request: transferRequest,
      stock: updatedStock,
      history,
    };
  });
};

export const cancelStockTransferRequestService = async (
  id: string,
  params: TCancelStockTransferRequestBody,
  requesterId: string
) => {
  const requester = await getAdminRequester(requesterId);
  const request = assertStockTransferRequestFound(
    await findStockTransferRequestById(id)
  );
  assertCanManageDestinationStore(requester, request.toStoreId);

  const transition = await updateStockTransferRequestStatus(
    id,
    "pending",
    buildCancelStockTransferData(requester.id, params.cancelledNotes)
  );
  assertStockTransferTransitionUpdated(transition.count, "pending");

  return await findStockTransferRequestById(id);
};
