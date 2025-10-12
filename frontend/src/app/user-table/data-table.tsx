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
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useState } from "react";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableViewOptions } from "./data-table-column-toggle";
import { useUserStore } from "../../store/user-store";
import { UserCreateModal } from "./modal/UserCreateModal";
import type { Users } from "./columns";

interface DataTableProps {
  columns: ColumnDef<Users, unknown>[];
  data: Users[];
  onSave?: (updatedItem: Users) => void;
  onDelete?: (id: string) => void;
  isLoading?: boolean;
  onCreate?: (newUser: Omit<Users, "user_account_id">) => void;
  meta?: {
    onSave?: (updatedItem: Users) => void;
    onDelete?: (id: string) => void;
  };
}

export function DataTable({
  columns,
  data,
  onSave,
  onDelete,
  isLoading = false,
  onCreate,
}: DataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [globalFilter, setGlobalFilter] = useState<string>("");

  console.log("data", data);

  // Get selection state and actions from Zustand store
  const {
    selectedUsers,
    // selectAllUsers,
    // unselectAllUsers,
    toggleUserSelection,
  } = useUserStore();

  // Convert selectedUsers array to TanStack table row selection format
  const rowSelection = selectedUsers.reduce((acc, userId) => {
    // Find the row index for this user
    const rowIndex = data.findIndex((item) => item.user_account_id === userId);
    if (rowIndex !== -1) {
      acc[rowIndex] = true;
    }
    return acc;
  }, {} as Record<string, boolean>);

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
    onRowSelectionChange: (updaterOrValue) => {
      // Handle row selection changes by updating Zustand store
      if (typeof updaterOrValue === "function") {
        const newSelection = updaterOrValue(rowSelection);

        // Convert back to user IDs and update store
        Object.keys(newSelection).forEach((rowIndex) => {
          const user = data[parseInt(rowIndex)];
          if (user && newSelection[rowIndex]) {
            if (!selectedUsers.includes(user.user_account_id)) {
              toggleUserSelection(user.user_account_id);
            }
          }
        });

        // Handle deselections
        selectedUsers.forEach((userId) => {
          const rowIndex = data.findIndex(
            (item) => item.user_account_id === userId
          );
          if (rowIndex !== -1 && !newSelection[rowIndex]) {
            toggleUserSelection(userId);
          }
        });
      }
    },
    meta: {
      onSave,
      onDelete,
    },
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      globalFilter,
      rowSelection,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Search all columns..."
          value={globalFilter ?? ""}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
          disabled={isLoading}
        />
        <UserCreateModal onCreate={(newUser) => onCreate?.(newUser)} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto" disabled={isLoading}>
              Columns
            </Button>
          </DropdownMenuTrigger>
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

      <div className="mt-2">
        <DataTablePagination table={table} />
        <DataTableViewOptions table={table} />
      </div>
    </div>
  );
}
