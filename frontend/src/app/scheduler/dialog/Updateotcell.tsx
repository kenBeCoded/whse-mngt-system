import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SchedulerUser } from "../columns";
import { useAttendanceStore } from "@/store/attendance-store";
import {
  UpdateOvertimeDialog,
  type AttendanceRecord,
} from "./Updateovertimedialog";

interface UpdateOtCellProps {
  user: SchedulerUser;
}

export function UpdateOtCell({ user }: UpdateOtCellProps) {
  const { fetchRecordWithOT, updateOtRecords } = useAttendanceStore();

  const [open, setOpen] = useState(false);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [isFetching, setIsFetching] = useState(false);

  // Fetches attendance records for this user and maps the store shape
  // (AttendanceRecords) into the dialog shape (AttendanceRecord).
  async function loadRecords() {
    if (user.id === undefined) return;
    setIsFetching(true);
    try {
      const response = await fetchRecordWithOT(user.id);
      if (response?.attendance_record) {
        const mapped: AttendanceRecord[] = response.attendance_record.map(
          (r) => ({
            id: r.id ?? "",
            date: r.attendance_date, // "YYYY-MM-DD"
            check_in: r.check_in_time, // "HH:MM" or null
            check_out: r.check_out_time, // "HH:MM" or null
            ot: r.ot_hours !== null && r.ot_hours !== undefined
              ? Number(r.ot_hours)
              : null,
          }),
        );
        setRecords(mapped);
      }
    } finally {
      setIsFetching(false);
    }
  }

  async function handleOpen() {
    setOpen(true);
    await loadRecords();
  }

  // After the user confirms in OtConfirmationDialog:
  // 1. Call updateOtRecords with the selected record IDs and overtime value.
  // 2. Refetch so the dialog table immediately reflects the new OT values
  //    without the user needing to close and reopen.
  async function handleUpdateOt(
    recordIds: (string | number)[],
    _dateFrom: string, // kept for interface compatibility; store doesn't need them
    _dateTo: string,
    overtime: number,
  ) {
    const numericIds = recordIds.map((id) =>
      typeof id === "string" ? parseInt(id, 10) : (id as number),
    );

    await updateOtRecords(numericIds, overtime);

    // Refetch to reflect updated OT in the table
    await loadRecords();
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={handleOpen}>
        UPDATE OT
      </Button>

      <UpdateOvertimeDialog
        open={open}
        onOpenChange={setOpen}
        user={user}
        attendanceRecords={records}
        isLoading={isFetching}
        onUpdateOt={handleUpdateOt}
      />
    </>
  );
}
