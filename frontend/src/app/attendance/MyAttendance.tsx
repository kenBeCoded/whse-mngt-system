import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { UploadAttendanceDialog } from "./dialog/UploadAttendanceDialog";
import {
  formatDateToYYYYMMDD,
  formatUtcStringToHHmmss,
} from "@/utils/formatTime";
import {
  useAttendanceStore,
  type AttendanceRecords,
  type FetchRecordResponse,
} from "@/store/attendance-store";
import { useAuth } from "@/hooks/useAuth";

// Audit status type
type AuditStatus = "pending" | "approved" | "rejected" | null;

// Mock attendance record type - replace with your actual type
interface AttendanceRecord {
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
  check_in_image_url: string | null;
  check_out_image_url: string | null;
  status: string | null;
  audit_status: AuditStatus;
}

export default function MyAttendance() {
  const { user } = useAuth();
  const { fetchRecordByID } = useAttendanceStore();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecord, setAttendanceRecord] =
    useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [calendarDate, setCalendarDate] = useState<Date | undefined>(
    selectedDate
  );

  // Helper function to validate and cast status
  const validateAuditStatus = (status: string | null): AuditStatus => {
    if (
      status === "pending" ||
      status === "approved" ||
      status === "rejected"
    ) {
      return status;
    }
    return null;
  };

  const fetchAttendanceRecord = useCallback(
    async (date: Date) => {
      setIsLoading(true);
      const formattedDate = formatDateToYYYYMMDD(date);
      try {
        if (!user || !user.id) {
          return;
        }
        const response: FetchRecordResponse | undefined = await fetchRecordByID(
          user?.id,
          formattedDate
        );

        if (response && response.attendance_record.length > 0) {
          // Step 2: Extract the first record and explicitly type it as AttendanceRecord
          const Users: AttendanceRecords = response.attendance_record[0];

          // Mock data for demonstration and setting the record
          setAttendanceRecord({
            date: formattedDate,

            // These properties now exist on 'Users'
            check_in_time: Users.check_in_time
              ? formatUtcStringToHHmmss(Users.check_in_time)
              : null,

            check_out_time: Users.check_out_time
              ? formatUtcStringToHHmmss(Users.check_out_time)
              : null,

            check_in_photo_url: Users.check_in_image_url ?? null,
            check_out_photo_url: Users.check_out_image_url ?? null,
            check_in_image_url: Users.check_in_image_url ?? null,
            check_out_image_url: Users.check_out_image_url ?? null,
            status: Users.status ?? null,
            audit_status: validateAuditStatus(Users.status),
          });
        } else {
          setAttendanceRecord(null);
        }
      } catch (error) {
        console.error("Error fetching attendance record:", error);
        setAttendanceRecord(null);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchRecordByID, user] // Dependencies for useCallback
  );

  // Fetch attendance record based on selected date
  useEffect(() => {
    fetchAttendanceRecord(selectedDate);
  }, [selectedDate, fetchAttendanceRecord]);

  const handleDateSelect = (date: Date | undefined) => {
    setCalendarDate(date);
    if (date) {
      setSelectedDate(date); // Only update the main app state when a selection is confirmed
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const getDayOfWeek = (date: Date) => {
    return format(date, "EEEE").toUpperCase();
  };

  const formatTime = (time: string | null) => {
    if (!time) return "--:--";
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour.toString().padStart(2, "0")}:${minutes}${ampm}`;
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center border-b">
        <CardTitle className="text-2xl font-bold">MY ATTENDANCE</CardTitle>
      </CardHeader>

      <CardContent className="pt-6 space-y-8">
        {/* Tabs */}
        <div className="flex justify-center gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="font-medium gap-2">
                <Calendar className="w-4 h-4" />
                DATE
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <CalendarComponent
                mode="single"
                selected={calendarDate}
                defaultMonth={calendarDate}
                onSelect={handleDateSelect}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <Button
            variant="secondary"
            size="sm"
            className="font-medium"
            onClick={() => {
              // TODO: Navigate to summary page
              console.log("Navigate to summary");
            }}
          >
            SUMMARY
          </Button>
        </div>

        {/* Selected Date Display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {format(selectedDate, "MMMM dd, yyyy")}
          </p>
        </div>

        {/* Day Section */}
        <div className="text-center space-y-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {getDayOfWeek(selectedDate)}
          </h2>

          {isLoading ? (
            <div className="text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className={`w-64 py-4 text-lg font-semibold mx-auto flex justify-center ${
                  attendanceRecord?.check_in_time
                    ? "text-green-700 bg-green-100 border-green-300"
                    : "text-gray-500 bg-gray-100 border-gray-300"
                }`}
              >
                IN ({formatTime(attendanceRecord?.check_in_time ?? null)})
              </Badge>

              <Badge
                variant="secondary"
                className={`w-64 py-4 text-lg font-semibold mx-auto flex justify-center ${
                  attendanceRecord?.check_out_time
                    ? "text-green-700 bg-green-100 border-green-300"
                    : "text-gray-500 bg-gray-100 border-gray-300"
                }`}
              >
                OUT ({formatTime(attendanceRecord?.check_out_time ?? null)})
              </Badge>
            </div>
          )}

          <UploadAttendanceDialog
            user={user}
            selectedDate={selectedDate}
            attendanceRecord={attendanceRecord}
            onSuccess={() => fetchAttendanceRecord(selectedDate)}
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-4">
          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            onClick={handlePreviousDay}
          >
            <ChevronLeft className="w-5 h-5" />
            PREV
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
            onClick={handleNextDay}
          >
            NEXT
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
