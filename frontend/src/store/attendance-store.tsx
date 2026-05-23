import axios from "../api/axios";
import { devtools } from "zustand/middleware";
import { create } from "zustand/react";
import { supabase } from "../supabase";

const API = axios; // use shared configured axios instance (withCredentials + auth header)

export interface AttendanceRecords {
  id?: string | number;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  is_audited: boolean;
  status: "pending" | "pass" | "fail" | null;
  username: string;
  user_account_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  user_profile_image_url: string | null;
  role: string;
  ot_id?: string | null;
  check_in_image_url: string | null;
  check_out_image_url: string | null;
  u_sched_in?: string | null;
  u_sched_out?: string | null;
  ot_hours?: number | null;
}

export interface FetchRecordResponse {
  attendance_record: AttendanceRecords[];
}

interface AttendanceState {
  // State
  Attendance: AttendanceRecords[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setAttendanceRecords: (users: AttendanceRecords[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // User CRUD operations
  fetchRecord: (user_id: number | string) => Promise<void>;

  fetchRecordByID: (
    user_id: number | string,
    selected_date: string,
  ) => Promise<FetchRecordResponse | undefined>;

  fetchRecordWithOT: (
    user_id: number | string,
  ) => Promise<FetchRecordResponse | undefined>;

  failAttendnaceRecord: (
    id: string | number,
    attendance_date: string,
  ) => Promise<void>;

  passAttendnaceRecord: (
    id: string | number,
    attendance_date: string,
  ) => Promise<void>;

  updateAttendanceRecord: (
    id: string | number,
    user_id: string | number,
    attendance_date: string,
    check_in_time: string,
    check_out_time: string,
    ot_hours: number,
  ) => Promise<void>;

  resetAttendanceRecord: (
    id: string | number,
    attendance_date: string,
    check_in_image_url: string | null,
    check_out_image_url: string | null,
  ) => Promise<void>;

  updateOtRecords: (
    idArr: number[],
    ot_hours: number,
  ) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

// Helper function to delete image from Supabase
const deleteImageFromSupabase = async (imageUrl: string | null) => {
  if (!imageUrl) return;

  try {
    // Extract file path from URL
    // Format: https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const urlParts = imageUrl.split("/storage/v1/object/public/");
    if (urlParts.length < 2) return;

    const [bucket, ...pathParts] = urlParts[1].split("/");
    const filePath = pathParts.join("/");

    const { error } = await supabase.storage.from(bucket).remove([filePath]);

    if (error) {
      console.error("Error deleting image from Supabase:", error);
    }
  } catch (error) {
    console.error("Error processing image deletion:", error);
  }
};

export const useAttendanceStore = create<AttendanceState>()(
  devtools(
    (set) => ({
      // Initial State
      Attendance: [],
      isLoading: false,
      error: null,

      // Basic setters
      setAttendanceRecords: (Attendance) => set({ Attendance }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      fetchRecord: async (user_id) => {
        if (!user_id) {
          set({ isLoading: false, error: "User is not authenticated." });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await API.post(
            "/api/attendance/get-attendance-record",
            { request_code: 0, user_id: user_id },
          );
          set({ Attendance: response.data.data, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch attendance records");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching attendance records:", error);
        }
      },

      fetchRecordByID: async (user_id, selected_date) => {
        if (!selected_date) {
          set({ isLoading: false, error: "No selected date detected!" });
          return;
        }
        if (!user_id) {
          set({ isLoading: false, error: "User is not authenticated!" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.post(
            "/api/attendance/get-attendance-record",
            { request_code: 1, user_id, selected_date },
          );
          set({ isLoading: false });
          return { attendance_record: response.data.data };
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch attendance records");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching attendance record by ID:", error);
        }
      },

      fetchRecordWithOT: async (user_id) => {
        if (!user_id) {
          set({ isLoading: false, error: "User is not authenticated!" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.post(
            "/api/attendance/get-attendance-record",
            { request_code: 2, user_id },
          );
          set({ isLoading: false });
          return { attendance_record: response.data.data };
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch attendance records with overtime");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching attendance record with OT:", error);
        }
      },

      failAttendnaceRecord: async (id, attendance_date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.patch(
            "/api/attendance/audit-attendance-update",
            {
              id: id,
              attendance_date: attendance_date,
              update_code: 1, // 1 for fail
            },
          );

          // Update local state to reflect the change
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? { ...record, is_audited: true, status: "fail" }
                : record,
            ),
            isLoading: false,
          }));

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fail attendance record");
          set({ error: errorMessage, isLoading: false });
          console.error("Error failing attendance record:", error);
          throw error;
        }
      },

      passAttendnaceRecord: async (id, attendance_date) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.patch(
            "/api/attendance/audit-attendance-update",
            {
              id: id,
              attendance_date: attendance_date,
              update_code: 0, // 0 for pass
            },
          );

          // Update local state to reflect the change
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? { ...record, is_audited: true, status: "pass" }
                : record,
            ),
            isLoading: false,
          }));

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to pass attendance record");
          set({ error: errorMessage, isLoading: false });
          console.error("Error passing attendance record:", error);
          throw error;
        }
      },

      updateAttendanceRecord: async (
        id,
        user_id,
        attendance_date,
        check_in_time,
        check_out_time,
        ot_hours,
      ) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.patch(
            "/api/attendance/audit-attendance-update",
            {
              id: id,
              user_id: user_id,
              attendance_date: attendance_date,
              check_in_time: check_in_time,
              check_out_time: check_out_time,
              ot_hours: ot_hours,
              update_code: 5, // 5 for update
            },
          );

          // Update local state to reflect the changes
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? {
                    ...record,
                    check_in_time: check_in_time,
                    check_out_time: check_out_time,
                    is_audited: true,
                  }
                : record,
            ),
            isLoading: false,
          }));

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to update attendance record");
          set({ error: errorMessage, isLoading: false });
          console.error("Error updating attendance record:", error);
          throw error;
        }
      },

      resetAttendanceRecord: async (
        id,
        attendance_date,
        check_in_image_url,
        check_out_image_url,
      ) => {
        set({ isLoading: true, error: null });
        try {
          // Call backend first
          const response = await API.patch(
            "/api/attendance/audit-attendance-update",
            {
              id: id,
              attendance_date: attendance_date,
              update_code: 2, // 2 for reset
            },
          );

          // If backend call succeeds, delete images from Supabase
          await Promise.all([
            deleteImageFromSupabase(check_in_image_url),
            deleteImageFromSupabase(check_out_image_url),
          ]);

          // Update local state to reset the record
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? {
                    ...record,
                    is_audited: false,
                    status: "pending",
                    check_in_time: null,
                    check_out_time: null,
                    check_in_image_url: null,
                    check_out_image_url: null,
                  }
                : record,
            ),
            isLoading: false,
          }));

          return response.data;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to reset attendance record");
          set({ error: errorMessage, isLoading: false });
          console.error("Error resetting attendance record:", error);
          throw error;
        }
      },

      updateOtRecords: async (idArr, ot_hours) => {
        set({ isLoading: true, error: null });
        try {
          const response = await API.patch(
            "/api/attendance/audit-attendance-update",
            {
              ot_idArr: idArr,
              ot_hours: ot_hours,
              update_code: 4, // 4 for OT update
            },
          );

          set({ isLoading: false });
          return response.data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to update OT records";
          set({ error: errorMessage, isLoading: false });
          console.error("Error updating OT records:", error);
          throw error;
        }
      },

      clearError: () => set({ error: null }),
      reset: () => set({ Attendance: [], isLoading: false, error: null }),
    }),
    { name: "attendance-store" },
  ),
);