import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const createLocationSchema = Joi.object({
  zone: Joi.string().required(),
  row: Joi.string().required(),
  aisle: Joi.string().required(),
  bay: Joi.string().required(),
  created_by: Joi.number().integer().required(),
});

const updateLocationSchema = Joi.object({
  zone: Joi.string().required(),
  row: Joi.string().required(),
  aisle: Joi.string().required(),
  bay: Joi.string().required(),
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

export const validateCreateLocation = makeValidator(createLocationSchema);
export const validateUpdateLocation = makeValidator(updateLocationSchema);
