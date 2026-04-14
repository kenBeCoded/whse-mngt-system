import { Request, Response, NextFunction } from "express";
import { BinModel } from "../../models/Bin.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/locations/:locationId/bins
export const createBin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = Number(req.params.locationId);
    const bin = await BinModel.create({ ...req.body, location_id: locationId });
    sendSuccess(res, 201, bin, "Bin created");
  } catch (err: any) {
    if (err.statusCode === 409) {
      sendError(res, 409, ErrorCodes.ALREADY_EXISTS, err.message);
      return;
    }
    next(err);
  }
};

// GET /api/locations/:locationId/bins
export const getBinsByLocation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const locationId = Number(req.params.locationId);
    const bins = await BinModel.findAllByLocation(locationId);
    sendSuccess(res, 200, bins);
  } catch (err) {
    next(err);
  }
};

// GET /api/locations/bins/warehouse/:warehouseId
export const getBinsByWarehouse = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const warehouseId = Number(req.params.warehouseId);
    const bins = await BinModel.findAllByWarehouse(warehouseId);
    sendSuccess(res, 200, bins);
  } catch (err) {
    next(err);
  }
};

// PUT /api/locations/:locationId/bins/:id
export const updateBin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const bin = await BinModel.updateById(id, req.body);
    if (!bin) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Bin not found");
      return;
    }
    sendSuccess(res, 200, bin, "Bin updated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/locations/:locationId/bins/:id/deactivate
export const deactivateBin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updatedBy = Number(req.body.updated_by);
    await BinModel.deactivate(id, updatedBy);
    sendSuccess(res, 200, null, "Bin deactivated");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    next(err);
  }
};

// PATCH /api/locations/:locationId/bins/:id/reactivate
export const reactivateBin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const updatedBy = Number(req.body.updated_by);
    await BinModel.reactivate(id, updatedBy);
    sendSuccess(res, 200, null, "Bin reactivated");
  } catch (err) {
    next(err);
  }
};

// POST /api/warehouses/bins/:binId/assign
export const assignItemToBin = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const binId = Number(req.params.binId);
    await BinModel.assignItem(binId, req.body);
    sendSuccess(res, 200, null, "Item assigned to bin");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    next(err);
  }
};

// POST /api/warehouses/bins/transfer
export const transferItemBetweenBins = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await BinModel.transferItem(req.body);
    sendSuccess(res, 200, null, "Item transferred successfully");
  } catch (err: any) {
    if (err.statusCode === 400) {
      sendError(res, 400, ErrorCodes.BAD_REQUEST, err.message);
      return;
    }
    next(err);
  }
};
