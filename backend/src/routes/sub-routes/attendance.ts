import { Router } from "express";

import {
  createAttendanceRec,
  auditAttendanceUpdate,
  getAttendanceRecord,
} from "../../controllers/attendance/attendanceController.js";

const router = Router();

router.post("/create-attendance-record", createAttendanceRec);
router.patch("/audit-attendance-update", auditAttendanceUpdate);
router.get("/get-attendance-record", getAttendanceRecord);

export default router;
