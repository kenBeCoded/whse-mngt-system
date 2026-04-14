import { NextFunction, Request, Response } from "express";
import { Attendance } from "../../models/Attendance.js";
import { sendSuccess, sendError, ErrorCodes } from "../../utils/apiResponse.js";

export const createAttendanceRec = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body } = req;

    const result = await Attendance.create_attendance_records(body);

    sendSuccess(res, 201, result, "Attendance created successfully");
  } catch (error) {
    next(error);
  }
};

export const auditAttendanceUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { body } = req;

    const result = await Attendance.audit_attendance_update(body);

    if (!result) {
      sendError(
        res,
        400,
        ErrorCodes.BAD_REQUEST,
        "Failed to update attendance"
      );
      return;
    }

    sendSuccess(res, 200, result, "Attendance updated successfully");
  } catch (error) {
    next(error);
  }
};

export const getAttendanceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      body: { request_code, user_id, selected_date },
    } = req;

    // 0: get all (use for audit access account)
    // 1: get by user id (use for viewing attendance records)
    // 2: get by user id with overtime details
    let result;

    switch (parseInt(request_code)) {
      case 0:
        result = await Attendance.get_attendance_records();
        break;

      case 1:
        result = await Attendance.get_attendance_records_byID(
          parseInt(user_id),
          selected_date,
        );
        break;

      case 2:
        result = await Attendance.get_attendance_records_with_ot(
          parseInt(user_id),
        );
        break;

      default:
        sendError(
          res,
          400,
          ErrorCodes.BAD_REQUEST,
          `Unsupported request_code: ${request_code}`
        );
        return;
    }

    sendSuccess(res, 200, result, "Attendance fetched successfully");
  } catch (error) {
    next(error);
  }
};
