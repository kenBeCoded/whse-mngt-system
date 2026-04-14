import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

const lineItemSchema = Joi.object({
  item_id: Joi.number().integer().required(),
  quantity_ordered: Joi.number().integer().min(1).required(),
  unit_price: Joi.number().min(0).required(),
});

const createPOSchema = Joi.object({
  supplier_id: Joi.number().integer().required(),
  warehouse_id: Joi.number().integer().required(),
  total_amount: Joi.number().min(0).required(),
  created_by: Joi.number().integer().required(),
  line_items: Joi.array().items(lineItemSchema).min(1).required(),
});

const updateStatusSchema = Joi.object({
  to_status: Joi.string()
    .valid("pending", "approved", "preparing", "shipped", "received", "cancelled")
    .required(),
  changed_by: Joi.number().integer().required(),
  remarks: Joi.string().allow("", null).optional(),
});

const receiveItemSchema = Joi.object({
  po_line_id: Joi.number().integer().required(),
  item_id: Joi.number().integer().required(),
  quantity_expected: Joi.number().integer().min(1).required(),
  quantity_received: Joi.number().integer().min(1).required(),
});

const receiveSchema = Joi.object({
  received_by: Joi.number().integer().required(),
  items: Joi.array().items(receiveItemSchema).min(1).required(),
});

const allocationItemSchema = Joi.object({
  receipt_line_id: Joi.number().integer().required(),
  bin_id: Joi.number().integer().required(),
  item_id: Joi.number().integer().required(),
  quantity: Joi.number().integer().min(1).required(),
});

const allocateSchema = Joi.object({
  allocated_by: Joi.number().integer().required(),
  allocations: Joi.array().items(allocationItemSchema).min(1).required(),
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

export const validateCreatePO = makeValidator(createPOSchema);
export const validateUpdatePOStatus = makeValidator(updateStatusSchema);
export const validateReceivePO = makeValidator(receiveSchema);
export const validateAllocatePO = makeValidator(allocateSchema);
