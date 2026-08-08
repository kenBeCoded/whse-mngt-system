import { useAttendanceStore } from "@/store/attendance-store";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { attendanceColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";

export function AttendanceRecordsPage() {
  const { Attendance, isLoading, error, fetchRecord } = useAttendanceStore();

  const { user } = useAuth();

  useEffect(() => {
    if (user?.id && user?.role) {
      // fetchRecord uses the role to decide:
      //   admin  → request_code 0 (fetch all records)
      //   others → request_code 1 (fetch only this user's records)
      fetchRecord(user.id, user.role);
    }
  }, [fetchRecord, user?.id, user?.role]);

  useEffect(() => {
    if (error) {
      console.error("Attendance store error:", error);
    }
  }, [error]);

  // Show loading state
  if (isLoading && Attendance.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading attendance...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ATTENDANCE</h1>
      </div>

      <DataTable
        columns={attendanceColumns}
        data={Attendance}
        isLoading={isLoading}
      />
    </div>
  );
}

