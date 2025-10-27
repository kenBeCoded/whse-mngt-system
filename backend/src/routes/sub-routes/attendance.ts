import { Router } from "express";

import {
  createAttendanceRec,
  auditAttendanceUpdate,
  getAttendanceRecord,
  resetAttendanceRecord,
} from "../../controllers/attendance/attendanceController.js";

const router = Router();

router.post("/create-attendance-record", createAttendanceRec);
router.patch("/audit-attendance-update", auditAttendanceUpdate);
router.post("/get-attendance-record", getAttendanceRecord);
router.patch("/reset-attendance-record", resetAttendanceRecord);

export default router;
