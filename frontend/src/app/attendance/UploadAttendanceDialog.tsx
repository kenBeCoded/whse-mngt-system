import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Upload, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/supabase";
import axios from "../../api/axios";
import type { User } from "@/context/AuthContext";

const API = axios;

// Define the attendance record type
interface AttendanceRecord {
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
  audit_status: "pending" | "approved" | "rejected" | null;
}

// Schema for form validation
const attendanceSchema = z.object({
  check_in_photo: z.instanceof(File).optional(),
  check_out_photo: z.instanceof(File).optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface UploadAttendanceDialogProps {
  selectedDate: Date;
  attendanceRecord: AttendanceRecord | null;
  onSuccess: () => void;
  user: User;
}

export const UploadAttendanceDialog = ({
  selectedDate,
  attendanceRecord,
  onSuccess,
  user,
}: UploadAttendanceDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [checkInPreview, setCheckInPreview] = useState<string | null>(null);
  const [checkOutPreview, setCheckOutPreview] = useState<string | null>(null);

  const checkInInputRef = useRef<HTMLInputElement>(null);
  const checkOutInputRef = useRef<HTMLInputElement>(null);

  const {
    setValue,
    watch,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
  });

  useEffect(() => {
    if (!isOpen) {
      // Reset form and clear photo selections when dialog closes
      reset();
      setValue("check_in_photo", undefined);
      setValue("check_out_photo", undefined);

      // Reset previews to attendance record photos (if any)
      setCheckInPreview(attendanceRecord?.check_in_photo_url ?? null);
      setCheckOutPreview(attendanceRecord?.check_out_photo_url ?? null);

      // Clear file input values
      if (checkInInputRef.current) {
        checkInInputRef.current.value = "";
      }
      if (checkOutInputRef.current) {
        checkOutInputRef.current.value = "";
      }
    }
  }, [isOpen, reset, setValue, attendanceRecord]);

  const checkInPhoto = watch("check_in_photo");
  const checkOutPhoto = watch("check_out_photo");

  // Update preview states when attendanceRecord changes
  useEffect(() => {
    setCheckInPreview(attendanceRecord?.check_in_photo_url ?? null);
    setCheckOutPreview(attendanceRecord?.check_out_photo_url ?? null);
  }, [attendanceRecord]);

  // Handle check-in photo change
  const handleCheckInChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("check_in_photo", file);
      setCheckInPreview(URL.createObjectURL(file));
    }
  };

  // Handle check-out photo change
  const handleCheckOutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setValue("check_out_photo", file);
      setCheckOutPreview(URL.createObjectURL(file));
    }
  };

  // Clear check-in photo
  const clearCheckInPhoto = () => {
    setValue("check_in_photo", undefined);
    setCheckInPreview(attendanceRecord?.check_in_photo_url ?? null);
    if (checkInInputRef.current) {
      checkInInputRef.current.value = "";
    }
  };

  // Clear check-out photo
  const clearCheckOutPhoto = () => {
    setValue("check_out_photo", undefined);
    setCheckOutPreview(attendanceRecord?.check_out_photo_url ?? null);
    if (checkOutInputRef.current) {
      checkOutInputRef.current.value = "";
    }
  };

  // Upload image to Supabase
  const uploadImage = async (file: File, type: "check_in" | "check_out") => {
    const uuid_v4 = crypto.randomUUID();
    const fileExt = file.name.split(".").pop();
    const fileName = `${type}-${uuid_v4}-${Date.now()}.${fileExt}`;
    const filePath = `attendance-photos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("App-File-Storage")
      .upload(filePath, file);

    if (uploadError) {
      throw new Error(`Failed to upload image: ${uploadError.message}`);
    }

    const { data: publicUrlData } = supabase.storage
      .from("App-File-Storage")
      .getPublicUrl(filePath);

    return publicUrlData.publicUrl;
  };

  // Submit form
  const onSubmit = async (data: AttendanceFormData) => {
    try {
      const updates: Array<{
        imageUrl: string;
        recordType: "check_in" | "check_out";
        imageCaptureDate: Date;
        updateCode: number;
      }> = [];

      // Upload check-in photo if new one is provided
      if (data.check_in_photo) {
        const checkInPhotoUrl = await uploadImage(
          data.check_in_photo,
          "check_in"
        );
        updates.push({
          imageUrl: checkInPhotoUrl,
          recordType: "check_in",
          imageCaptureDate: new Date(data.check_in_photo.lastModified),
          updateCode: 0,
        });
      }

      // Upload check-out photo if new one is provided
      if (data.check_out_photo) {
        const checkOutPhotoUrl = await uploadImage(
          data.check_out_photo,
          "check_out"
        );
        updates.push({
          imageUrl: checkOutPhotoUrl,
          recordType: "check_out",
          imageCaptureDate: new Date(data.check_out_photo.lastModified),
          updateCode: 2,
        });
      }

      // Submit all updates to API
      const responses = await Promise.all(
        updates.map((update) =>
          API.post("/api/attendance/create-attendance-record", {
            username: user.username,
            image_url: update.imageUrl,
            selected_date: new Date(selectedDate),
            image_capture_date: update.imageCaptureDate,
            record_type: update.recordType,
            update_code: update.updateCode,
          })
        )
      );

      // Check if all requests succeeded
      const allSucceeded = responses.every(
        (response) => response.status === 200 || response.status === 201
      );

      if (allSucceeded) {
        toast.success("Attendance uploaded successfully", {
          description: format(new Date(), "MMM dd, yyyy 'at' h:mm a"),
        });
        setIsOpen(false);
        reset();
        onSuccess();
      }
    } catch (error) {
      console.error("Failed to upload attendance:", error);
      toast.error("Failed to upload attendance", {
        description:
          error instanceof Error ? error.message : "Please try again",
      });
    }
  };

  // Determine if check-out can be uploaded
  const canUploadCheckOut =
    attendanceRecord !== null &&
    (attendanceRecord.check_in_time !== null || checkInPhoto !== undefined);

  // Determine submit button text
  const getSubmitButtonText = () => {
    if (checkOutPhoto || (checkOutPreview && !checkInPhoto)) {
      return "SUBMIT OUT";
    }
    return "SUBMIT IN";
  };

  // Determine if submit button should be disabled
  const isSubmitDisabled = !checkInPhoto && !checkOutPhoto;

  // Get audit status color
  const getAuditStatusColor = (status: string | null) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-700 border-green-300";
      case "rejected":
        return "bg-red-100 text-red-700 border-red-300";
      case "pending":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-64 text-lg font-medium" size="lg">
          SUBMIT
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">UPLOAD ATTENDANCE</DialogTitle>
          <DialogDescription>
            Upload your attendance photos for verification
          </DialogDescription>
          <div className="space-y-2 pt-2">
            <div className="font-medium text-base text-foreground">
              {format(selectedDate, "EEEE, MMMM dd, yyyy")}
            </div>
            {attendanceRecord?.audit_status && (
              <Badge
                variant="outline"
                className={getAuditStatusColor(attendanceRecord.audit_status)}
              >
                Status: {attendanceRecord.audit_status.toUpperCase()}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Check In Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Check In</Label>
              {attendanceRecord?.check_in_time && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(
                      new Date(`2000-01-01 ${attendanceRecord.check_in_time}`),
                      "h:mm a"
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                ref={checkInInputRef}
                type="file"
                accept="image/*"
                onChange={handleCheckInChange}
                className="hidden"
                id="check_in_photo"
                disabled={
                  isSubmitting || !!attendanceRecord?.check_in_photo_url
                }
              />
              <label
                htmlFor={
                  attendanceRecord?.check_in_photo_url
                    ? undefined
                    : "check_in_photo"
                }
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors ${
                  attendanceRecord?.check_in_photo_url
                    ? "cursor-default"
                    : "cursor-pointer hover:bg-gray-50"
                }`}
              >
                {checkInPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={checkInPreview}
                      alt="Check In"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {checkInPhoto && !attendanceRecord?.check_in_photo_url && (
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 rounded-full"
                        onClick={(e) => {
                          e.preventDefault();
                          clearCheckInPhoto();
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG or JPEG (MAX. 5MB)
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Check Out Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold">Check Out</Label>
              {attendanceRecord?.check_out_time && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>
                    {format(
                      new Date(`2000-01-01 ${attendanceRecord.check_out_time}`),
                      "h:mm a"
                    )}
                  </span>
                </div>
              )}
            </div>

            <div className="relative">
              <input
                ref={checkOutInputRef}
                type="file"
                accept="image/*"
                onChange={handleCheckOutChange}
                className="hidden"
                id="check_out_photo"
                disabled={
                  isSubmitting ||
                  !canUploadCheckOut ||
                  !!attendanceRecord?.check_out_photo_url
                }
              />
              <label
                htmlFor={
                  !canUploadCheckOut || attendanceRecord?.check_out_photo_url
                    ? undefined
                    : "check_out_photo"
                }
                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg transition-colors ${
                  attendanceRecord?.check_out_photo_url
                    ? "cursor-default"
                    : canUploadCheckOut
                    ? "cursor-pointer hover:bg-gray-50"
                    : "cursor-not-allowed bg-gray-50 opacity-60"
                }`}
              >
                {checkOutPreview ? (
                  <div className="relative w-full h-full">
                    <img
                      src={checkOutPreview}
                      alt="Check Out"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {checkOutPhoto &&
                      !attendanceRecord?.check_out_photo_url && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 rounded-full"
                          onClick={(e) => {
                            e.preventDefault();
                            clearCheckOutPhoto();
                          }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">
                        {canUploadCheckOut
                          ? "Click to upload"
                          : "Check in first"}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500">
                      {canUploadCheckOut
                        ? "PNG, JPG or JPEG (MAX. 5MB)"
                        : "You must check in before checking out"}
                    </p>
                  </div>
                )}
              </label>
            </div>
          </div>

          {/* Submit Button */}
          {!(
            attendanceRecord?.check_in_photo_url &&
            attendanceRecord?.check_out_photo_url
          ) && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || isSubmitDisabled}
                className="min-w-[120px]"
              >
                {isSubmitting ? "Submitting..." : getSubmitButtonText()}
              </Button>
            </div>
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
