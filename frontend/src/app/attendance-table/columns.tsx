// Import the type from the store instead of redefining it
import type { ColumnDef } from "@tanstack/react-table";
import type { AttendanceRecords } from "@/store/attendance-store";

// Remove the duplicate type definition and use the one from the store

export const attendanceColumns: ColumnDef<AttendanceRecords, unknown>[] = [
  {
    accessorKey: "attendance_date",
    header: "Attendance Date",
    cell: ({ row }) =>
      new Date(row.original.attendance_date).toLocaleDateString(),
  },
  {
    accessorKey: "user_account_id",
    header: "User ID",
  },
  {
    header: "Full Name",
    accessorFn: (row) =>
      `${row.first_name} ${row.middle_name || ""} ${row.last_name}`.trim(),
  },

  {
    accessorKey: "check_in_time",
    header: "Check-In Time",
    cell: ({ row }) =>
      row.original.check_in_time
        ? new Date(row.original.check_in_time).toLocaleTimeString()
        : "N/A",
  },
  {
    accessorKey: "check_out_time",
    header: "Check-Out Time",
    cell: ({ row }) =>
      row.original.check_out_time
        ? new Date(row.original.check_out_time).toLocaleTimeString()
        : "N/A",
  },
  {
    accessorKey: "is_audited",
    header: "Audited",
    cell: ({ row }) => (row.original.is_audited ? "Yes" : "No"),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const statusColors = {
        pass: "text-green-600",
        fail: "text-red-600",
        pending: "text-yellow-600",
      };
      return (
        <span className={statusColors[status as keyof typeof statusColors]}>
          {status.toUpperCase()}
        </span>
      );
    },
  },
];
