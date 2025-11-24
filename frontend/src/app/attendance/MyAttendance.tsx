"use client";

import { useState, useEffect } from "react";
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
import { UploadAttendanceDialog } from "./UploadAttendanceDialog";

// Mock attendance record type - replace with your actual type
interface AttendanceRecord {
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  check_in_photo_url: string | null;
  check_out_photo_url: string | null;
  audit_status: "pending" | "approved" | "rejected" | null;
}

export default function MyAttendance() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceRecord, setAttendanceRecord] =
    useState<AttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attendance record based on selected date
  useEffect(() => {
    fetchAttendanceRecord(selectedDate);
  }, [selectedDate]);

  const fetchAttendanceRecord = async (date: Date) => {
    setIsLoading(true);
    console.log(date);
    try {
      // TODO: Replace with actual API call
      // const response = await API.get(`/api/attendance/get-by-date`, {
      //   params: { date: format(date, 'yyyy-MM-dd') }
      // });
      // setAttendanceRecord(response.data);

      // Mock data for demonstration
      setAttendanceRecord({
        date: format(date, "yyyy-MM-dd"),
        check_in_time: "08:00:00",
        check_out_time: "20:00:00",
        check_in_photo_url: null,
        check_out_photo_url: null,
        audit_status: "pending",
      });
    } catch (error) {
      console.error("Error fetching attendance record:", error);
      setAttendanceRecord(null);
    } finally {
      setIsLoading(false);
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
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
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
        {/* <div className="text-center">
          <p className="text-sm text-muted-foreground mb-2">
            {format(selectedDate, 'MMMM dd, yyyy')}
          </p>
        </div> */}

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
