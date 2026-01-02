import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Image as ImageIcon,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import {
  useAttendanceStore,
  type AttendanceRecords,
} from "@/store/attendance-store";
import { formatDateToYYYYMMDD } from "@/utils/formatTime";
import { toast } from "sonner";

interface AttendanceDialogProps {
  data: AttendanceRecords;
}

const AuditAttendanceDialog = ({ data }: AttendanceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFailConfirmOpen, setIsFailConfirmOpen] = useState(false);
  const [isPassConfirmOpen, setIsPassConfirmOpen] = useState(false);

  console.log("data",data)

  const {
    failAttendnaceRecord,
    passAttendnaceRecord,
    error,
    isLoading,
    clearError,
  } = useAttendanceStore();

  // Handle errors from store
  useEffect(() => {
    if (error) {
      toast.error(error);
      clearError();
    }
  }, [error, clearError]);

  // Function to open image in new tab
  const openImageInNewTab = (imageUrl: string | null) => {
    if (imageUrl) {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleFailed = async () => {
    if (!data.id || !data.attendance_date) {
      toast.error("Invalid attendance record data.");
      return;
    }
    try {
      await failAttendnaceRecord(
        data.id,
        formatDateToYYYYMMDD(new Date(data.attendance_date))
      );

      // Success notification
      toast.success("Attendance successfully marked as failed.");

      // Close dialogs on success
      setIsFailConfirmOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking attendance as failed:", error);
      // Error is handled by the useEffect above
    }
  };

  const handlePassed = async () => {
    if (!data.id || !data.attendance_date) {
      toast.error("Invalid attendance record data.");
      return;
    }
    try {
      await passAttendnaceRecord(
        data.id,
        formatDateToYYYYMMDD(new Date(data.attendance_date))
      );

      // Success notification
      toast.success("Attendance successfully marked as passed.");

      // Close dialogs on success
      setIsPassConfirmOpen(false);
      setIsOpen(false);
    } catch (error) {
      console.error("Error marking attendance as passed:", error);
      // Error is handled by the useEffect above
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            Details
          </Button>
        </DialogTrigger>

        <DialogContent
          className="max-w-4xl max-h-[90vh] overflow-y-auto"
          aria-describedby={undefined}
        >
          {/* HEADER SECTION */}
          <DialogHeader className="flex flex-row items-center justify-between border-b pb-4 space-y-0">
            <div className="flex items-center gap-4">
              <DialogTitle className="text-xl font-semibold text-foreground">
                {new Date(data.attendance_date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "2-digit",
                })}
              </DialogTitle>
              {/* Overtime Icon */}
              <div
                className="h-6 w-6 rounded-full border-2 border-dashed border-muted-foreground flex items-center justify-center"
                title="Overtime"
              >
                <Clock className="h-3 w-3 text-muted-foreground" />
              </div>
            </div>
            <Badge
              variant="outline"
              className="px-4 py-1 uppercase tracking-wider"
            >
              {data.status || "<audit_status>"}
            </Badge>
          </DialogHeader>

          {/* CONTENT SECTION: IMAGES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            {/* Full Name Section - Spans full width, aligned left */}
            <div className="col-span-full">
              <h2 className="text-md font-semibold text-foreground">
                {data
                  ? `[${data.user_account_id}] ${data.last_name}, ${data.first_name} ${data.middle_name}`
                  : "N/A"}
              </h2>
            </div>

            {/* Check In Column */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="font-bold text-lg tracking-tight">CHECK IN</h3>
              <Card
                className="w-full aspect-[4/3] flex items-center justify-center bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageInNewTab(data.check_in_image_url)}
              >
                {data.check_in_image_url ? (
                  <img
                    src={data.check_in_image_url}
                    alt="Check In"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
                )}
              </Card>
              <div className="w-full flex border rounded-sm overflow-hidden text-sm border-border">
                <span className="bg-muted px-3 py-2 border-r font-medium text-xs uppercase text-muted-foreground border-border">
                  Check In Time
                </span>
                <span className="px-3 py-2 flex-1 text-foreground">
                  {data.check_in_time
                    ? new Date(data.check_in_time).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
            </div>

            {/* Check Out Column */}
            <div className="flex flex-col items-center gap-4">
              <h3 className="font-bold text-lg tracking-tight">CHECK OUT</h3>
              <Card
                className="w-full aspect-[4/3] flex items-center justify-center bg-muted overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
                onClick={() => openImageInNewTab(data.check_out_image_url)}
              >
                {data.check_out_image_url ? (
                  <img
                    src={data.check_out_image_url}
                    alt="Check Out"
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <ImageIcon className="h-20 w-20 text-muted-foreground/30" />
                )}
              </Card>
              <div className="w-full flex border rounded-sm overflow-hidden text-sm border-border">
                <span className="bg-muted px-3 py-2 border-r font-medium text-xs uppercase text-muted-foreground border-border">
                  Check Out Time
                </span>
                <span className="px-3 py-2 flex-1 text-foreground">
                  {data.check_out_time
                    ? new Date(data.check_out_time).toLocaleTimeString()
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

          {/* FOOTER SECTION: ACTION BUTTONS */}
          {!data.is_audited ? (
            <div className="flex justify-center gap-6 pt-4 border-t">
              <Button
                variant="destructive"
                className="w-32 font-bold uppercase tracking-widest"
                onClick={() => setIsFailConfirmOpen(true)}
                disabled={isLoading}
              >
                Failed
              </Button>
              <Button
                variant="default"
                className="w-32 font-bold uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white"
                onClick={() => setIsPassConfirmOpen(true)}
                disabled={isLoading}
              >
                Passed
              </Button>
            </div>
          ) : (
            <div className="flex justify-center gap-6 pt-4 border-t">
              <Button
                variant="secondary"
                className="w-32 font-bold uppercase tracking-widest"
                // onClick={() => setIsFailConfirmOpen(true)}
                disabled={isLoading}
              >
                Resubmit
              </Button>
              <Button
                variant="default"
                className="w-32 font-bold uppercase tracking-widest "
                // onClick={() => setIsPassConfirmOpen(true)}
                disabled={isLoading}
              >
                Update
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for FAILED */}
      <Dialog open={isFailConfirmOpen} onOpenChange={setIsFailConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              Confirm Mark as Failed
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to mark this attendance record for{" "}
              <span className="font-semibold">
                {new Date(data.attendance_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>{" "}
              as <span className="font-bold text-destructive">FAILED</span>?
              <br />
              <br />
              This action may require the employee to resubmit their attendance.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsFailConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleFailed}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Failed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog for PASSED */}
      <Dialog open={isPassConfirmOpen} onOpenChange={setIsPassConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-green-600">
              <CheckCircle className="h-6 w-6" />
              Confirm Mark as Passed
            </DialogTitle>
            <DialogDescription className="pt-2">
              Are you sure you want to approve this attendance record for{" "}
              <span className="font-semibold">
                {new Date(data.attendance_date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>{" "}
              as <span className="font-bold text-green-600">PASSED</span>?
              <br />
              <br />
              This will finalize the audit for this date.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3 mt-4">
            <Button
              variant="outline"
              onClick={() => setIsPassConfirmOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handlePassed}
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Confirm Passed"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuditAttendanceDialog;
