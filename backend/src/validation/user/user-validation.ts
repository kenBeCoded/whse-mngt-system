import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { sendError, ErrorCodes } from "../../utils/apiResponse.js";

// const registerSchema = Joi.object({
//   username: Joi.string().alphanum().min(3).max(30).required(),
//   password: Joi.string().min(6).required(),
// });

const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// export const validateRegister = (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ) => {
//   const { error } = registerSchema.validate(req.body);
//   if (error) {
//     sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
//     return;
//   }
//   next();
// };

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { error } = loginSchema.validate(req.body);
  if (error) {
    sendError(res, 400, ErrorCodes.VALIDATION_ERROR, error.details[0].message);
    return;
  }
  next();
};
