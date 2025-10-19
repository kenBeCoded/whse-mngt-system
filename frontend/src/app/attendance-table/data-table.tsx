import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState } from "@tanstack/react-table";
import { useState } from "react";
import type { AttendanceRecords } from "./columns";

interface DataTableProps {
  columns: ColumnDef<AttendanceRecords, unknown>[];
  data: AttendanceRecords[];
  // onSave?: (updatedItem: AttendanceRecords) => void;
  // onDelete?: (id: string) => void;
  isLoading?: boolean;
  // onCreate?: (newRecord: Omit<AttendanceRecords, "user_id">) => void;
  // meta?: {
  //   onSave?: (updatedItem: AttendanceRecords) => void;
  //   onDelete?: (id: string) => void;
  // };
}

export function DataTable({
    columns,
    data,
    // onSave,
    // onDelete,
    isLoading = false,
    // onCreate,
  }: DataTableProps) {
    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  }