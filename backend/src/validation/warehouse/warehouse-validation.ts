import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const createWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  longitude: Joi.number().allow(null).optional(),
  latitude: Joi.number().allow(null).optional(),
  total_capacity: Joi.number().integer().min(1).required(),
  created_by: Joi.number().integer().required(),
});

const updateWarehouseSchema = Joi.object({
  name: Joi.string().required(),
  address: Joi.string().required(),
  longitude: Joi.number().allow(null).optional(),
  latitude: Joi.number().allow(null).optional(),
  total_capacity: Joi.number().integer().min(1).required(),
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

export const validateCreateWarehouse = makeValidator(createWarehouseSchema);
export const validateUpdateWarehouse = makeValidator(updateWarehouseSchema);
