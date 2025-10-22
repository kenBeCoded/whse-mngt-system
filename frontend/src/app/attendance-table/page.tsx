import { useAttendanceStore } from "@/store/attendance-store";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { attendanceColumns } from "./columns";

export function AttendanceRecordsPage() {
  const { Attendance, isLoading, error, fetchRecord, clearError } =
    useAttendanceStore();

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  useEffect(() => {
    if (error) {
      console.error("User store error:", error);
      // You can add toast notification here
    }
  }, [error]);

  // Show loading state
  if (isLoading && Attendance.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <DataTable
      columns={attendanceColumns}
      data={Attendance}
      isLoading={isLoading}
    />
  );
}
