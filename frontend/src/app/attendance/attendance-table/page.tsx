import { useAttendanceStore } from "@/store/attendance-store";
import { useEffect } from "react";
import { DataTable } from "./data-table";
import { attendanceColumns } from "./columns";
import { useAuth } from "@/hooks/useAuth";

export function AttendanceRecordsPage() {
  const { Attendance, isLoading, error, fetchRecord } = useAttendanceStore();

  const { user } = useAuth();

  useEffect(() => {
    // 1. Null Check: Ensure user and user.id exist before proceeding.
    if (user?.id) {
      // 2. Type Correction: Pass user.id as a string if fetchRecord expects string,
      //    or parse it to a number if fetchRecord was updated to accept number.
      //    Assuming the original store change was to accept a string (which is typical for user IDs).
      fetchRecord(user.id);
    }
  }, [fetchRecord, user?.id]); // 3. Dependency Array: Include user?.id to re-run when the user logs in/out.

  useEffect(() => {
    if (error) {
      console.error("User store error:", error);
      // You can add toast notification here
    }
  }, [error]);

  const isAdmin = user?.role?.toLowerCase() === "admin";

  const displayAttendance = isAdmin
    ? Attendance
    : Attendance.filter(
        (record) =>
          String(record.user_id) === String(user?.id) ||
          record.username === user?.username ||
          record.user_account_id === user?.id
      );

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
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">ATTENDANCE</h1>
      </div>

      <DataTable
        columns={attendanceColumns}
        data={displayAttendance}
        isLoading={isLoading}
      />
    </div>
  );
}
