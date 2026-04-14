import { Request, Response, NextFunction } from "express";
import { WarehouseModel } from "../../models/Warehouse.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/warehouses
export const createWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouse = await WarehouseModel.create(req.body);
    sendSuccess(res, 201, warehouse, "Warehouse created");
  } catch (err) {
    next(err);
  }
};

// GET /api/warehouses
export const getAllWarehouses = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouses = await WarehouseModel.findAll();
    sendSuccess(res, 200, warehouses);
  } catch (err) {
    next(err);
  }
};

// GET /api/warehouses/:id
export const getWarehouseById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const warehouse = await WarehouseModel.findById(id);
    if (!warehouse) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Warehouse not found");
      return;
    }
    sendSuccess(res, 200, warehouse);
  } catch (err) {
    next(err);
  }
};

// PUT /api/warehouses/:id
export const updateWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const warehouse = await WarehouseModel.updateById(id, req.body);
    if (!warehouse) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Warehouse not found");
      return;
    }
    sendSuccess(res, 200, warehouse, "Warehouse updated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/warehouses/:id/deactivate
export const deactivateWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await WarehouseModel.deactivate(id);
    sendSuccess(res, 200, null, "Warehouse deactivated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/warehouses/:id/reactivate
export const reactivateWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await WarehouseModel.reactivate(id);
    sendSuccess(res, 200, null, "Warehouse reactivated");
  } catch (err) {
    next(err);
  }
};

// GET /api/warehouses/:warehouseId/unallocated
export const getUnallocatedAssets = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    const results = await WarehouseModel.getUnallocated(warehouseId);
    sendSuccess(res, 200, results);
  } catch (err) {
    next(err);
  }
};
