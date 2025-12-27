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
import { useState } from "react";
import type { AttendanceRecords } from "@/store/attendance-store";
import axios from "../../../api/axios";
import { formatDateToYYYYMMDD } from "@/utils/formatTime";
import { toast } from "sonner";

interface AttendanceDialogProps {
  data: AttendanceRecords;
}

// type AttendanceAuditUpdate = {
//   id: string;
//   attendance_date: string;
//   update_code: number;
// };

const API = axios;

const AuditAttendanceDialog = ({ data }: AttendanceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isFailConfirmOpen, setIsFailConfirmOpen] = useState(false);
  const [isPassConfirmOpen, setIsPassConfirmOpen] = useState(false);

  // Function to open image in new tab
  const openImageInNewTab = (imageUrl: string | null) => {
    if (imageUrl) {
      window.open(imageUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleFailed = async () => {
  try {
    console.log(
      "Attendance marked as FAILED for",
      formatDateToYYYYMMDD(new Date(data.attendance_date))
    );

    const response = await API.patch("/api/attendance/audit-attendance-update", {
      id: data.id,
      attendance_date: formatDateToYYYYMMDD(new Date(data.attendance_date)),
      update_code: 2,
    });

    console.log("response", response);

    // Success notification
    toast.success("Attendance successfully marked as failed.");
    
    // Close dialogs on success
    setIsFailConfirmOpen(false);
    setIsOpen(false); 

  } catch (error) {
    console.error("Error updating attendance status:", error);
    
    // Error notification
    toast.error(
      error instanceof Error 
        ? error.message 
        : "Failed to update attendance status. Please try again."
    );
  }
};

  const handlePassed = async () => {
    console.log("Attendance marked as PASSED for", data.attendance_date);
    // TODO: Call your API to update status to passed
    setIsPassConfirmOpen(false);
    setIsOpen(false); // Close main dialog after action
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
              {/* ... rest of your Check In code */}
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
              {/* ... rest of your Check Out code */}
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
          <div className="flex justify-center gap-6 pt-4 border-t">
            <Button
              variant="destructive"
              className="w-32 font-bold uppercase tracking-widest"
              onClick={() => setIsFailConfirmOpen(true)}
            >
              Failed
            </Button>
            <Button
              variant="default"
              className="w-32 font-bold uppercase tracking-widest bg-green-500 hover:bg-green-600 text-white"
              onClick={() => setIsPassConfirmOpen(true)}
            >
              Passed
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleFailed}>
              Confirm Failed
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
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-600 text-white"
              onClick={handlePassed}
            >
              Confirm Passed
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AuditAttendanceDialog;

// create a dialog here for fail and pass button
// const
