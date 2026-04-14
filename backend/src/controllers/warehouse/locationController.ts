import { Request, Response, NextFunction } from "express";
import { LocationModel } from "../../models/Location.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/warehouses/:warehouseId/locations
export const createLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    const location = await LocationModel.create({
      ...req.body,
      warehouse_id: warehouseId,
    });
    sendSuccess(res, 201, location, "Location created");
  } catch (err) {
    next(err);
  }
};

// GET /api/warehouses/:warehouseId/locations
export const getLocationsByWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    const locations = await LocationModel.findAllByWarehouse(warehouseId);
    sendSuccess(res, 200, locations);
  } catch (err) {
    next(err);
  }
};

// PUT /api/warehouses/:warehouseId/locations/:id
export const updateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const location = await LocationModel.updateById(id, req.body);
    if (!location) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Location not found");
      return;
    }
    sendSuccess(res, 200, location, "Location updated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/warehouses/:warehouseId/locations/:id/deactivate
export const deactivateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await LocationModel.deactivate(id);
    sendSuccess(res, 200, null, "Location deactivated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/warehouses/:warehouseId/locations/:id/reactivate
export const reactivateLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await LocationModel.reactivate(id);
    sendSuccess(res, 200, null, "Location reactivated");
  } catch (err) {
    next(err);
  }
};
