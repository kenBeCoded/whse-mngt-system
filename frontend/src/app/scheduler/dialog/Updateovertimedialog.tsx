import { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { SchedulerUser } from "../columns";
import { OtConfirmationDialog } from "./Otconfirmationdialog";

// ------- Types -------

export type AttendanceRecord = {
  id: string | number;
  date: string;       // ISO "YYYY-MM-DD"
  check_in: string | null;  // "HH:MM" 24-hour
  check_out: string | null; // "HH:MM" 24-hour
  ot: number | null;        // hours, can be decimal e.g. 3.5
};

interface UpdateOvertimeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: SchedulerUser;
  attendanceRecords: AttendanceRecord[];
  isLoading?: boolean;
  onUpdateOt: (
    recordIds: (string | number)[],
    dateFrom: string,
    dateTo: string,
    overtime: number
  ) => Promise<void>;
}

// ------- Helpers -------

// function formatDate(iso: string): string {
//   const [year, month, day] = iso.split("-");
//   return `${month}/${day}/${year}`;
// }

function format12Hour(time: string | null): string {
  if (!time) return "—";
  const [hourStr, minuteStr] = time.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr ?? "00";
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  return `${hour}:${minute} ${ampm}`;
}

function formatOt(ot: number | null): string {
  if (ot === null || ot === undefined) return "N/A";
  return ot === 1 ? "1 HR" : `${ot} HRS`;
}

const ROWS_PER_PAGE_OPTIONS = [5, 10, 20];

// ------- Component -------

export function UpdateOvertimeDialog({
  open,
  onOpenChange,
  user,
  attendanceRecords,
  isLoading = false,
  onUpdateOt,
}: UpdateOvertimeDialogProps) {
  // Filters
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [overtime, setOvertime] = useState("");

  // Table selection
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set());

  // Pagination
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Confirmation dialog
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filtered records
  const filteredRecords = useMemo(() => {
    return attendanceRecords.filter((rec) => {
      if (dateFrom && rec.date < dateFrom) return false;
      if (dateTo && rec.date > dateTo) return false;
      return true;
    });
  }, [attendanceRecords, dateFrom, dateTo]);

  // Paginated records
  const totalResults = filteredRecords.length;
  const totalPages = Math.max(1, Math.ceil(totalResults / rowsPerPage));
  const paginatedRecords = filteredRecords.slice(
    (page - 1) * rowsPerPage,
    page * rowsPerPage
  );

  // Selection helpers
  const allPageIds = paginatedRecords.map((r) => r.id);
  const allPageSelected =
    allPageIds.length > 0 && allPageIds.every((id) => selectedIds.has(id));
  const somePageSelected = allPageIds.some((id) => selectedIds.has(id));

  function toggleAll(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      allPageIds.forEach((id) => {
        if (checked) {
          next.add(id);
        } else {
          next.delete(id);
        }
      });
      return next;
    });
  }

  function toggleRow(id: string | number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }

  // Header label
  const headerLabel = `[${user.user_account_id}] ${user.first_name} ${
    user.middle_name ? user.middle_name + " " : ""
  }${user.last_name}`;

  // Overtime validation
  const overtimeValid =
    overtime !== "" && !isNaN(parseFloat(overtime)) && parseFloat(overtime) >= 0;
  const canContinue = selectedIds.size > 0 && overtimeValid;

  // Called after OtConfirmationDialog confirms.
  // onUpdateOt (from UpdateOtCell) handles the API call + refetch.
  // We only reset local filter/selection state here, not close the dialog,
  // so the user can see the refreshed OT values in the table.
  async function handleConfirm() {
    setIsUpdating(true);
    try {
      await onUpdateOt(
        Array.from(selectedIds),
        dateFrom,
        dateTo,
        parseFloat(overtime)
      );
      // Clear selection and overtime input; keep date filters intact
      setSelectedIds(new Set());
      setOvertime("");
    } finally {
      setIsUpdating(false);
    }
  }

  function handlePageChange(newPage: number) {
    setPage(Math.min(Math.max(1, newPage), totalPages));
  }

  console.log("attendanceRecords",attendanceRecords)

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl w-full">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold truncate">
              {headerLabel}
            </DialogTitle>
          </DialogHeader>

          {/* Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-1">
            {/* Date From */}
            <div className="space-y-1.5">
              <Label htmlFor="ot-date-from" className="text-xs font-medium">
                Date From
              </Label>
              <Input
                id="ot-date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-sm"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <Label htmlFor="ot-date-to" className="text-xs font-medium">
                Date To
              </Label>
              <Input
                id="ot-date-to"
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-sm"
              />
            </div>

            {/* Overtime */}
            <div className="space-y-1.5">
              <Label htmlFor="ot-hours" className="text-xs font-medium">
                Overtime (hrs)
              </Label>
              <Input
                id="ot-hours"
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 3 or 3.5"
                value={overtime}
                onChange={(e) => setOvertime(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border mt-2 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={
                        allPageSelected
                          ? true
                          : somePageSelected
                          ? "indeterminate"
                          : false
                      }
                      onCheckedChange={(v) => toggleAll(!!v)}
                      aria-label="Select all on page"
                    />
                  </TableHead>
                  <TableHead className="text-xs font-semibold">DATE</TableHead>
                  <TableHead className="text-xs font-semibold">CHECK IN</TableHead>
                  <TableHead className="text-xs font-semibold">CHECK OUT</TableHead>
                  <TableHead className="text-xs font-semibold">OT</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-foreground" />
                        Loading records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedRecords.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-24 text-center text-sm text-muted-foreground"
                    >
                      No records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedRecords.map((rec) => (
                    <TableRow
                      key={rec.id}
                      data-state={selectedIds.has(rec.id) ? "selected" : undefined}
                      className="cursor-pointer"
                      onClick={() => toggleRow(rec.id, !selectedIds.has(rec.id))}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(rec.id)}
                          onCheckedChange={(v) => toggleRow(rec.id, !!v)}
                          aria-label={`Select record ${rec.id}`}
                        />
                      </TableCell>
                      <TableCell className="text-sm font-mono">
                        {new Date(rec.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format12Hour(rec.check_in)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format12Hour(rec.check_out)}
                      </TableCell>
                      <TableCell className="text-sm">
                        <span
                          className={
                            rec.ot === null
                              ? "text-muted-foreground"
                              : "font-medium text-foreground"
                          }
                        >
                          {formatOt(rec.ot)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination + footer */}
          <div className="flex items-center justify-between mt-2 gap-2 flex-wrap">
            {/* Left: total & rows per page */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <span>
                {selectedIds.size > 0 && (
                  <span className="font-medium text-foreground mr-1">
                    {selectedIds.size} selected ·{" "}
                  </span>
                )}
                {totalResults} result{totalResults !== 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-xs">Rows:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setPage(1);
                  }}
                  className="text-xs border rounded px-1 py-0.5 bg-background"
                >
                  {ROWS_PER_PAGE_OPTIONS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right: page controls + UPDATE button */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePageChange(1)}
                  disabled={page === 1}
                >
                  «
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                >
                  ‹
                </Button>
                <span className="text-xs px-1 text-muted-foreground">
                  {page} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                >
                  ›
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={page === totalPages}
                >
                  »
                </Button>
              </div>

              <Button
                size="sm"
                disabled={!canContinue || isLoading || isUpdating}
                onClick={() => setConfirmOpen(true)}
              >
                UPDATE
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <OtConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={handleConfirm}
        isLoading={isUpdating}
        userLabel={headerLabel}
        dateFrom={dateFrom ? new Date(dateFrom).toLocaleDateString() : "—"}
        dateTo={dateTo ? new Date(dateTo).toLocaleDateString() : "—"}
        overtime={overtime}
        selectedCount={selectedIds.size}
      />
    </>
  );
}

// new Date().toLocaleTimeString()