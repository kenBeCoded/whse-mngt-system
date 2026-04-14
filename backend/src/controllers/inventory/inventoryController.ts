import { Request, Response, NextFunction } from "express";
import { InventoryModel } from "../../models/Inventory.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/inventory/items
export const createInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const item = await InventoryModel.create(req.body);
    sendSuccess(res, 201, item, "Inventory item created");
  } catch (err: any) {
    if (err.statusCode === 409) {
      sendError(res, 409, ErrorCodes.ALREADY_EXISTS, err.message);
      return;
    }
    next(err);
  }
};

// GET /api/inventory/items
export const getAllInventoryItems = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const items = await InventoryModel.findAll();
    sendSuccess(res, 200, items);
  } catch (err) {
    next(err);
  }
};

// GET /api/inventory/items/:id
export const getInventoryItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const item = await InventoryModel.findById(id);
    if (!item) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Inventory item not found");
      return;
    }
    sendSuccess(res, 200, item);
  } catch (err) {
    next(err);
  }
};

// PUT /api/inventory/items/:id
export const updateInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const item = await InventoryModel.updateById(id, req.body);
    if (!item) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Inventory item not found");
      return;
    }
    sendSuccess(res, 200, item, "Inventory item updated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/inventory/items/:id/deactivate
export const deactivateInventoryItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await InventoryModel.deactivate(id);
    sendSuccess(res, 200, null, "Inventory item deactivated");
  } catch (err) {
    next(err);
  }
};
