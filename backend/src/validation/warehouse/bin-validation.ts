import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const createBinSchema = Joi.object({
  bin_code: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  created_by: Joi.number().integer().required(),
});

const updateBinSchema = Joi.object({
  bin_code: Joi.string().required(),
  capacity: Joi.number().integer().min(1).required(),
  updated_by: Joi.number().integer().required(),
});

const assignItemSchema = Joi.object({
  item_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  assigned_by: Joi.number().integer().required(),
});

const transferItemSchema = Joi.object({
  item_id: Joi.number().integer().required(),
  from_bin_id: Joi.number().integer().required(),
  to_bin_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
  transferred_by: Joi.number().integer().required(),
  reason: Joi.string().allow("", null).optional(),
});

const deactivateBinSchema = Joi.object({
  updated_by: Joi.number().integer().required(),
});

const makeValidator =
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);
    if (error) {
      sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
      return;
    }
    next();
  };

export const validateCreateBin = makeValidator(createBinSchema);
export const validateUpdateBin = makeValidator(updateBinSchema);
export const validateAssignItem = makeValidator(assignItemSchema);
export const validateTransferItem = makeValidator(transferItemSchema);
export const validateDeactivateBin = makeValidator(deactivateBinSchema);
