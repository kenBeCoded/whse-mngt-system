import { Router } from "express";

import {createAttendanceRec, auditAttendanceUpdate} from "../../controllers/attendance/attendanceController.js"

const router = Router()

router.post("/create-attendance-record", createAttendanceRec)
router.patch("/audit-attendance-update", auditAttendanceUpdate)

export default router