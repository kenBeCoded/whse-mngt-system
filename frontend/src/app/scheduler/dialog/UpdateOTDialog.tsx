import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Clock, AlertTriangle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import axios from "@/api/axios";
import type { SchedulerUser } from "../columns";

const API = axios;

interface OTRecord {
  id: string | number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  ot_id: string | number | null;
  ot_hours: number | null;
}

interface UpdateOTDialogProps {
  user: SchedulerUser;
}

function formatAMPM(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function formatOT(hours: number | null): string {
  if (hours == null) return "N/A";
  return `${hours} HR/s`;
}

export function UpdateOTDialog({ user }: UpdateOTDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [records, setRecords] = useState<OTRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Filter & form state
  const [dateFilter, setDateFilter] = useState("");
  const [newOTHours, setNewOTHours] = useState("");

  // Selection state (by ot_id)
  const [selectedOtIds, setSelectedOtIds] = useState<Set<string | number>>(new Set());

  // Fetch attendance records with OT when dialog opens
  useEffect(() => {
    if (!isOpen || !user.id) return;
    setIsLoading(true);
    setSelectedOtIds(new Set());
    setDateFilter("");
    setNewOTHours("");

    API.post("/api/attendance/get-attendance-record", {
      request_code: 2,
      user_id: user.id,
    })
      .then((res) => {
        const data: OTRecord[] = res.data.data ?? [];
        // Only show records that have an ot_id (have an OT entry)
        setRecords(data.filter((r) => r.ot_id != null));
      })
      .catch(() => {
        toast.error("Failed to load OT records.");
      })
      .finally(() => setIsLoading(false));
  }, [isOpen, user.id]);

  // Apply date filter
  const filteredRecords = useMemo(() => {
    if (!dateFilter) return records;
    return records.filter((r) => r.attendance_date.startsWith(dateFilter));
  }, [records, dateFilter]);

  // Toggle a single row
  const toggleRow = (ot_id: string | number) => {
    setSelectedOtIds((prev) => {
      const next = new Set(prev);
      if (next.has(ot_id)) {
        next.delete(ot_id);
      } else {
        next.add(ot_id);
      }
      return next;
    });
  };

  // Toggle all visible rows
  const toggleAll = () => {
    const visibleOtIds = filteredRecords.map((r) => r.ot_id!);
    const allSelected = visibleOtIds.every((id) => selectedOtIds.has(id));
    if (allSelected) {
      setSelectedOtIds((prev) => {
        const next = new Set(prev);
        visibleOtIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedOtIds((prev) => {
        const next = new Set(prev);
        visibleOtIds.forEach((id) => next.add(id));
        return next;
      });
    }
  };

  const allVisibleSelected =
    filteredRecords.length > 0 &&
    filteredRecords.every((r) => selectedOtIds.has(r.ot_id!));
  const someVisibleSelected =
    filteredRecords.some((r) => selectedOtIds.has(r.ot_id!)) && !allVisibleSelected;

  // Selected records for confirmation display
  const selectedRecords = records.filter((r) => r.ot_id != null && selectedOtIds.has(r.ot_id));

  const canUpdate = selectedOtIds.size > 0 && newOTHours !== "" && Number(newOTHours) > 0;

  const handleUpdate = async () => {
    const otHours = parseFloat(newOTHours);
    if (isNaN(otHours) || otHours <= 0) {
      toast.error("Overtime hours must be greater than 0.");
      return;
    }
    if (selectedOtIds.size === 0) {
      toast.error("Please select at least one record.");
      return;
    }

    setIsUpdating(true);
    try {
      await API.patch("/api/attendance/audit-attendance-update", {
        update_code: 4,
        ot_hours: otHours,
        ot_idArr: Array.from(selectedOtIds).map(Number),
      });

      toast.success(`OT updated to ${otHours} HR/s for ${selectedOtIds.size} record(s).`);
      setIsConfirmOpen(false);
      setIsOpen(false);
    } catch {
      toast.error("Failed to update overtime. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      {/* Main OT Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            UPDATE OT
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Update Overtime
            </DialogTitle>
            <DialogDescription>
              <span className="font-semibold text-foreground">
                [{user.user_account_id}] {user.last_name}, {user.first_name}{" "}
                {user.middle_name || ""}
              </span>
              <br />
              Select records and set the new overtime hours.
            </DialogDescription>
          </DialogHeader>

          {/* Filters & OT Input */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="flex-1">
              <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground block mb-1">
                Filter by Date
              </label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="h-9"
              />
            </div>
            <div className="flex-1">
              <label className="text-xs font-extrabold uppercase tracking-widest text-muted-foreground block mb-1">
                New Overtime Hours
              </label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                placeholder="e.g. 2"
                value={newOTHours}
                onChange={(e) => setNewOTHours(e.target.value)}
                className="h-9"
              />
            </div>
          </div>

          {/* Data Table */}
          <div className="rounded-md border mt-3 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={allVisibleSelected ? true : someVisibleSelected ? "indeterminate" : false}
                      onCheckedChange={toggleAll}
                      disabled={filteredRecords.length === 0 || isLoading}
                      aria-label="Select all"
                    />
                  </TableHead>
                  <TableHead className="font-extrabold uppercase text-xs tracking-widest">Date</TableHead>
                  <TableHead className="font-extrabold uppercase text-xs tracking-widest">Check In</TableHead>
                  <TableHead className="font-extrabold uppercase text-xs tracking-widest">Check Out</TableHead>
                  <TableHead className="font-extrabold uppercase text-xs tracking-widest">Overtime</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                        Loading records...
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
                      No OT records found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredRecords.map((row) => (
                    <TableRow
                      key={String(row.id)}
                      className="cursor-pointer hover:bg-muted/50"
                      data-state={selectedOtIds.has(row.ot_id!) ? "selected" : undefined}
                      onClick={() => toggleRow(row.ot_id!)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedOtIds.has(row.ot_id!)}
                          onCheckedChange={() => toggleRow(row.ot_id!)}
                          aria-label="Select row"
                        />
                      </TableCell>
                      <TableCell className="font-semibold">{formatDate(row.attendance_date)}</TableCell>
                      <TableCell>{formatAMPM(row.check_in_time)}</TableCell>
                      <TableCell>{formatAMPM(row.check_out_time)}</TableCell>
                      <TableCell>
                        {row.ot_hours != null ? (
                          <Badge variant="secondary" className="font-mono text-xs">
                            {formatOT(row.ot_hours)}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">N/A</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <DialogFooter className="gap-3 mt-4 border-t pt-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {selectedOtIds.size > 0 && (
                <span>
                  <span className="font-semibold text-foreground">{selectedOtIds.size}</span> record(s) selected
                </span>
              )}
            </div>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!canUpdate}
              onClick={() => setIsConfirmOpen(true)}
            >
              Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm OT Update
            </DialogTitle>
            <DialogDescription className="pt-2">
              You are about to set overtime to{" "}
              <span className="font-bold text-foreground">{newOTHours} HR/s</span> for the
              following {selectedRecords.length} record(s):
            </DialogDescription>
          </DialogHeader>

          {/* Summary list */}
          <div className="max-h-48 overflow-y-auto rounded-md border divide-y text-sm">
            {selectedRecords.map((r) => (
              <div key={String(r.id)} className="flex items-center justify-between px-3 py-2">
                <span className="font-semibold">{formatDate(r.attendance_date)}</span>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <span>{formatAMPM(r.check_in_time)} – {formatAMPM(r.check_out_time)}</span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {formatOT(r.ot_hours)} → {newOTHours} HR/s
                  </Badge>
                </div>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-3 mt-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? "Updating..." : "Continue"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
