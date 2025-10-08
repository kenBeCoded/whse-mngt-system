import { Router } from "express";

import {createAttendanceRec} from "../../controllers/attendance/attendanceController.js"

const router = Router()

router.post("/create-attendance-record", createAttendanceRec)

export default router