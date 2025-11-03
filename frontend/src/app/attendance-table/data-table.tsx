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
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";

import { useState, useMemo } from "react";
import { DataTablePagination } from "../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../components/data-table/data-table-column-toggle";
import type { AttendanceRecords } from "@/store/attendance-store";

import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import type { DateRange } from "react-day-picker";

interface DataTableProps {
  columns: ColumnDef<AttendanceRecords, unknown>[];
  data: AttendanceRecords[];
  onSave?: (updatedItem: AttendanceRecords) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  onCreate?: (newRecord: Omit<AttendanceRecords, "attendance_id">) => void;
  meta?: {
    onSave?: (updatedItem: AttendanceRecords) => void;
    onDelete?: (id: string) => void;
  };
}

export function DataTable({
  columns,
  data,
  isLoading = false,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Filter data based on date range
  const filteredData = useMemo(() => {
    if (!dateRange?.from && !dateRange?.to) {
      return data;
    }

    return data.filter((record) => {
      const attendanceDateStr = record.attendance_date;
      if (!attendanceDateStr) return false;

      const attendanceDate = new Date(attendanceDateStr);

      // Set time to start of day for consistent comparison
      attendanceDate.setHours(0, 0, 0, 0);

      let isWithinRange = true;

      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);
        isWithinRange = isWithinRange && attendanceDate >= fromDate;
      }

      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        toDate.setHours(23, 59, 59, 999);
        isWithinRange = isWithinRange && attendanceDate <= toDate;
      }

      return isWithinRange;
    });
  }, [data, dateRange]);

  const table = useReactTable({
    data: filteredData, // Use filtered data instead of raw data
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
    },
  });

  const handleDateRangeChange = (range: typeof dateRange) => {
    setDateRange(range);
    // Reset to first page when filter changes
    table.setPageIndex(0);
  };

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs"
          disabled={isLoading}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              id="date"
              variant={"outline"}
              className={cn(
                "justify-start text-left font-normal",
                !dateRange?.from && "text-muted-foreground"
              )}
              disabled={isLoading}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange?.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "LLL dd, y")} -{" "}
                    {format(dateRange.to, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.from, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              autoFocus
              mode="range"
              defaultMonth={dateRange?.from}
              selected={dateRange}
              onSelect={handleDateRangeChange}
              numberOfMonths={1}
            />
          </PopoverContent>
        </Popover>

        {dateRange?.from && (
          <Button
            variant="ghost"
            onClick={() => {
              setDateRange(undefined);
              table.setPageIndex(0);
            }}
            className="h-8 px-2 lg:px-3"
            disabled={isLoading}
          >
            Clear dates
          </Button>
        )}

        <DropdownMenu>
          <DataTableViewOptions table={table} />
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
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
                          header.getContext()
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
                        cell.getContext()
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

      <div className="flex items-center justify-between py-4">
        <DataTablePagination table={table} />
      </div>
    </div>
  );
}
