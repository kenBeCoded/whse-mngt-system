import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const createSupplierSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  address: Joi.string().allow("", null).optional(),
  created_by: Joi.number().integer().required(),
});

const updateSupplierSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  address: Joi.string().allow("", null).optional(),
  updated_by: Joi.number().integer().required(),
}).or("name", "email", "address");

export const validateCreateSupplier = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = createSupplierSchema.validate(req.body);
  if (error) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
    return;
  }
  next();
};

export const validateUpdateSupplier = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { error } = updateSupplierSchema.validate(req.body);
  if (error) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
    return;
  }
  next();
};
