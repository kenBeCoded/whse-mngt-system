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
