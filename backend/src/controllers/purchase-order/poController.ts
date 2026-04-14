import { Request, Response, NextFunction } from "express";
import { PurchaseOrderModel } from "../../models/PurchaseOrder.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/purchase-orders
export const createPurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const po = await PurchaseOrderModel.create(req.body);
    sendSuccess(res, 201, po, "Purchase order created");
  } catch (err) {
    next(err);
  }
};

// GET /api/purchase-orders
export const getAllPurchaseOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const pos = await PurchaseOrderModel.findAll();
    sendSuccess(res, 200, pos);
  } catch (err) {
    next(err);
  }
};

// GET /api/purchase-orders/:id
export const getPurchaseOrderById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await PurchaseOrderModel.findById(id);
    if (!result) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Purchase order not found");
      return;
    }
    sendSuccess(res, 200, result);
  } catch (err) {
    next(err);
  }
};

// GET /api/purchase-orders/:id/status-history
export const getPOStatusHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const history = await PurchaseOrderModel.getStatusHistory(id);
    sendSuccess(res, 200, history);
  } catch (err) {
    next(err);
  }
};

// PATCH /api/purchase-orders/:id/status
export const updatePOStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const po = await PurchaseOrderModel.transitionStatus(id, req.body);
    sendSuccess(res, 200, po, "PO status updated");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    if (err.statusCode === 404) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, err.message);
      return;
    }
    next(err);
  }
};

// POST /api/purchase-orders/:id/receive
export const receivePurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const result = await PurchaseOrderModel.receive(id, req.body);
    sendSuccess(res, 200, result, "Items received");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    if (err.statusCode === 404) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, err.message);
      return;
    }
    next(err);
  }
};

// POST /api/purchase-orders/:id/allocate
export const allocatePurchaseOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await PurchaseOrderModel.allocate(id, req.body);
    sendSuccess(res, 200, null, "Items allocated to bins");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    if (err.statusCode === 404) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, err.message);
      return;
    }
    next(err);
  }
};
