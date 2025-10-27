import { NextFunction, Request, Response } from "express";
import { Attendance } from "../../models/Attendance.js";

export const createAttendanceRec = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { body } = req;

    const result = await Attendance.create_attendance_records(body);

    res
      .status(201)
      .json({ message: "Attendance created successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const auditAttendanceUpdate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { body } = req;

    if (!body.attendance_date || !body.id || body.id <= 0) {
      res.status(400).json({ message: "attendance_date and id are required" });
      return;
    }

    const result = await Attendance.audit_attendance_update(body);

    res
      .status(200)
      .json({ message: "Attendance updated successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const getAttendanceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      body: { request_code, user_id },
    } = req;

    //! for delete
    console.log(request_code);
    // return;

    // 0: get all (use for audit access account)
    // 1: get by user id (use for viewwing payroll)
    let result;

    switch (parseInt(request_code)) {
      case 0:
        result = await Attendance.get_attendance_records();
        break;

      case 1:
        result = await Attendance.get_attendance_records_byID(
          parseInt(user_id)
        );
        break;

      default:
        throw new Error(`Unsupported request_code: ${request_code}`);
    }

    // const result = await Attendance.get_attendance_records();

    res
      .status(200)
      .json({ message: "Attendance fetch successfully", data: result });
  } catch (error) {
    next(error);
  }
};

export const resetAttendanceRecord = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { body } = req;
  try {
    const result = await Attendance.reset_attendance_record(body);

    res
      .status(200)
      .json({ message: "Attendance reset successfully", data: result });
  } catch (error) {
    next(error);
  }
};
