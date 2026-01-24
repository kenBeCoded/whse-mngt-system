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
import { Label } from "@/components/ui/label";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface ChangeScheduleDialogProps {
  selectedCount: number;
  selectedUserIds: number[];
  onScheduleChange: (
    userIds: number[],
    dateFrom: string,
    dateTo: string,
    schedIn: string,
    schedOut: string
  ) => Promise<void>;
  isLoading?: boolean;
}

export function ChangeScheduleDialog({
  selectedCount,
  selectedUserIds,
  onScheduleChange,
  isLoading = false,
}: ChangeScheduleDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [schedIn, setSchedIn] = useState("");
  const [schedOut, setSchedOut] = useState("");

  const handleContinue = async () => {
    // Validate inputs
    if (!dateFrom || !dateTo) {
      toast.error("Please provide both date from and date to.");
      return;
    }

    if (!schedIn || !schedOut) {
      toast.error("Please provide both schedule in and schedule out times.");
      return;
    }

    // Validate date range
    const fromDate = new Date(dateFrom);
    const toDate = new Date(dateTo);

    if (fromDate > toDate) {
      toast.error("Date From cannot be later than Date To.");
      return;
    }

    try {
      await onScheduleChange(selectedUserIds, dateFrom, dateTo, schedIn, schedOut);
      toast.success(
        `Schedule updated successfully for ${selectedCount} user(s).`
      );
      // Reset form
      setDateFrom("");
      setDateTo("");
      setSchedIn("");
      setSchedOut("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule. Please try again.");
    }
  };

  // Check if form is complete
  const isFormComplete = dateFrom && dateTo && schedIn && schedOut;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="ml-auto">
          <Calendar className="mr-2 h-4 w-4" />
          ({selectedCount}) CHANGE SCHEDULE
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>CHANGE ATTENDANCE SCHEDULE</DialogTitle>
          <DialogDescription className="pt-2">
            The selected users' schedules will be changed to the new schedule
            within the date range.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-from">Date FROM</Label>
              <Input
                id="date-from"
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date-to">Date TO</Label>
              <Input
                id="date-to"
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sched-in">Schedule In</Label>
              <Input
                id="sched-in"
                type="time"
                value={schedIn}
                onChange={(e) => setSchedIn(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sched-out">Schedule Out</Label>
              <Input
                id="sched-out"
                type="time"
                value={schedOut}
                onChange={(e) => setSchedOut(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            Selected users: <span className="font-semibold">{selectedCount}</span>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            CANCEL
          </Button>
          <Button onClick={handleContinue} disabled={isLoading || !isFormComplete}>
            {isLoading ? "Processing..." : "CONTINUE"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}