// type attendance_records

import type { ColumnDef } from "@tanstack/react-table";

// user_id, attendance_date, check_in_image_id, check_in_time, check_out_image_id, check_out_time, is_audited, status, created_at, updated_at
export type AttendanceRecords = {
  user_id: string;
  attendance_date: string; // ISO date string
  check_in_image_id?: string;
  check_in_time?: string; // ISO date string
  check_out_image_id?: string;
  check_out_time?: string; // ISO date string
  is_audited: boolean;
  status: "fail" | "pass" | "pending";
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
};

// type TableMeta = {
//   <function> like update, create, delete, etc...
// };

// attendanceColumns ColumnDef<Users>
// user_id, attendance_date, check_in_image_id, check_in_time, check_out_image_id, check_out_time, is_audited, status, created_at, updated_at
export const attendanceColumns: ColumnDef<AttendanceRecords>[] = [
  {
    accessorKey: "user_id",
    header: "User ID",
  },
  {
    accessorKey: "attendance_date",
    header: "Attendance Date",
  },
  {
    accessorKey: "check_in_time",
    header: "Check-In Time",
  },
  {
    accessorKey: "check_out_time",
    header: "Check-Out Time",
  },
  {
    accessorKey: "is_audited",
    header: "Audited",
    cell: ({ row }) => (row.original.is_audited ? "Yes" : "No"),
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "created_at",
    header: "Created At",
  },
  {
    accessorKey: "updated_at",
    header: "Updated At",
  },
];