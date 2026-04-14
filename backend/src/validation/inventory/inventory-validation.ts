import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const createInventorySchema = Joi.object({
  item_number: Joi.string().required(),
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().allow("", null).optional(),
  unit_of_measure: Joi.string().required(),
  default_unit_price: Joi.number().min(0).allow(null).optional(),
  created_by: Joi.number().integer().required(),
});

const updateInventorySchema = Joi.object({
  item_number: Joi.string().required(),
  sku: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().allow("", null).optional(),
  category: Joi.string().allow("", null).optional(),
  unit_of_measure: Joi.string().required(),
  default_unit_price: Joi.number().min(0).allow(null).optional(),
});

export const validateCreateInventory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = createInventorySchema.validate(req.body);
  if (error) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
    return;
  }
  next();
};

export const validateUpdateInventory = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updateInventorySchema.validate(req.body);
  if (error) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
    return;
  }
  next();
};
