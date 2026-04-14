import { Request, Response, NextFunction } from "express";
import { SupplierModel } from "../../models/Supplier.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

// POST /api/suppliers
export const createSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const supplier = await SupplierModel.create(req.body);
    sendSuccess(res, 201, supplier, "Supplier created");
  } catch (err: any) {
    if (err.statusCode === 409) {
      sendError(res, 409, ErrorCodes.ALREADY_EXISTS, err.message);
      return;
    }
    next(err);
  }
};

// GET /api/suppliers
export const getAllSuppliers = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const suppliers = await SupplierModel.findAll();
    sendSuccess(res, 200, suppliers);
  } catch (err) {
    next(err);
  }
};

// GET /api/suppliers/:id
export const getSupplierById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const supplier = await SupplierModel.findById(id);
    if (!supplier) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Supplier not found");
      return;
    }
    sendSuccess(res, 200, supplier);
  } catch (err) {
    next(err);
  }
};

// PUT /api/suppliers/:id
export const updateSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    const supplier = await SupplierModel.updateById(id, req.body);
    if (!supplier) {
      sendError(res, 404, ErrorCodes.NOT_FOUND, "Supplier not found");
      return;
    }
    sendSuccess(res, 200, supplier, "Supplier updated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/suppliers/:id/deactivate
export const deactivateSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await SupplierModel.deactivate(id);
    sendSuccess(res, 200, null, "Supplier deactivated");
  } catch (err) {
    next(err);
  }
};

// PATCH /api/suppliers/:id/reactivate
export const reactivateSupplier = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const id = Number(req.params.id);
    await SupplierModel.reactivate(id);
    sendSuccess(res, 200, null, "Supplier reactivated");
  } catch (err) {
    next(err);
  }
};