// Import the type from the store instead of redefining it
import type { ColumnDef } from "@tanstack/react-table";
import type { AttendanceRecords } from "@/store/attendance-store";
import { Badge } from "@/components/ui/badge";

// Remove the duplicate type definition and use the one from the store

export const attendanceColumns: ColumnDef<AttendanceRecords, unknown>[] = [
  {
    accessorKey: "attendance_date",
    header: "Attendance Date",
    accessorFn: (row) => new Date(row.attendance_date).toLocaleDateString(),
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

      // Define variants or classes for your badges
      let variant: "default" | "secondary" | "destructive" | "outline" =
        "default";
      let className = "";

      switch (status) {
        case "pass":
          // Use a green background for 'pass'
          className = "bg-green-100 text-green-700 hover:bg-green-100/80";
          variant = "default"; // or keep it as 'default' for custom styling
          break;
        case "fail":
          // Use the 'destructive' variant or a custom red class
          variant = "destructive";
          break;
        case "pending":
          // Use a yellow/amber background for 'pending'
          className = "bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80";
          variant = "default";
          break;
        default:
          variant = "outline";
          break;
      }

      return (
        <Badge variant={variant} className={className}>
          {status.toUpperCase()}
        </Badge>
      );
    },
  },
];
