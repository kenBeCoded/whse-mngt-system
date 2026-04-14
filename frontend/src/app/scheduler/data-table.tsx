import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import { useState } from "react";
import { DataTablePagination } from "@/components/data-table/data-table-pagination";
import { DataTableViewOptions } from "@/components/data-table/data-table-column-toggle";
import { ChangeScheduleDialog } from "./dialog/ChangeScheduleDialog";
import type { SchedulerUser } from "./columns";

interface DataTableProps {
  columns: ColumnDef<SchedulerUser>[];
  data: SchedulerUser[];
  isLoading?: boolean;
  onScheduleChange: (
    userIds: number[],
    dateFrom: string,
    dateTo: string,
    schedIn: string,
    schedOut: string,
  ) => Promise<void>;
}

export function SchedulerDataTable({
  columns,
  data,
  isLoading = false,
  onScheduleChange,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");
  const [rowSelection, setRowSelection] = useState({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
  });

  // Get selected user IDs
  const selectedRows = table.getFilteredSelectedRowModel().rows;
  const selectedUserIds = selectedRows
    .map((row) => {
      const id = row.original.id;
      return typeof id === "number"
        ? id
        : typeof id === "string"
          ? parseInt(id)
          : null;
    })
    .filter((id): id is number => id !== null);
  const selectedCount = selectedUserIds.length;

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {/* Left Group: Search and Dialog */}
        <div className="flex items-center gap-3">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(event.target.value)}
            className="max-w-sm"
            disabled={isLoading}
          />

          {/* This will now appear immediately next to the input */}
          {selectedCount > 0 && (
            <ChangeScheduleDialog
              selectedCount={selectedCount}
              selectedUserIds={selectedUserIds}
              onScheduleChange={onScheduleChange}
              isLoading={isLoading}
            />
          )}
        </div>

        {/* Right Group: View Options */}
        <DataTableViewOptions table={table} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mr-2"></div>
                    Loading...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-2">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
