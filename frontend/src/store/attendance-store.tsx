import axios from "../api/axios";
import { devtools } from "zustand/middleware";
import { create } from "zustand/react";

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
  fetchRecord: (user_id: number| string) => Promise<void>;
  fetchRecordByID: (
    user_id: number | string,
    selected_date: string
  ) => Promise<FetchRecordResponse | undefined>;
  failAttendnaceRecord: (
    id: string | number,
    attendance_date: string
  ) => Promise<void>;
  passAttendnaceRecord: (
    id: string | number,
    attendance_date: string
  ) => Promise<void>;
  updateAttendanceRecord: (
    id: string | number,
    attendance_date: string,
    u_sched_in: string, // "hh:mm" format
    u_sched_out: string //"hh:mm" format
  ) => Promise<void>;

  clearError: () => void;
  reset: () => void;
}

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
          // Handle case where user is not logged in or ID is missing
          set({ isLoading: false, error: "User is not authenticated." });
          return;
        }

        set({ isLoading: true, error: null });
        try {
          const response = await API.post(
            "/api/attendance/get-attendance-record",
            { request_code: 0, user_id: user_id }
          );
          set({ Attendance: response.data.data });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch attendance records";
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
        }
      },

      fetchRecordByID: async (user_id, selected_date) => {
        if (!selected_date) {
          set({ isLoading: false, error: "No selected date detected!" });
          return;
        }
        if (!user_id) {
          // Handle case where user is not logged in or ID is missing
          set({ isLoading: false, error: "User is not authenticated!" });
          return;
        }

        set({ isLoading: true, error: null });

        try {
          const response = await API.post(
            "/api/attendance/get-attendance-record",
            { request_code: 1, user_id, selected_date }
          );
          return { attendance_record: response.data.data };
          // set({ Attendance: response.data.data });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch attendance records";
          set({ error: errorMessage });
        } finally {
          set({ isLoading: false });
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
            }
          );

          // Optionally update the local state to reflect the change
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? { ...record, is_audited: true, status: "fail" }
                : record
            ),
          }));

          return response.data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fail attendance record";
          set({ error: errorMessage });
          throw error; // Re-throw so calling code can handle it
        } finally {
          set({ isLoading: false });
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
            }
          );

          // Optionally update the local state to reflect the change
          set((state) => ({
            Attendance: state.Attendance.map((record) =>
              record.id === id
                ? { ...record, is_audited: true, status: "pass" }
                : record
            ),
          }));

          return response.data;
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to pass attendance record";
          set({ error: errorMessage });
          throw error; // Re-throw so calling code can handle it
        } finally {
          set({ isLoading: false });
        }
      },

      //? update atendance record
      
      // updateAttendanceRecord: async (
      //   id,
      //   attendance_date,
      //   u_sched_in,
      //   u_sched_out
      // ) => {
      //   set({ isLoading: true, error: null });
      //   try {
      //     const response = await API.patch(
      //       "/api/attendance/audit-attendance-update",
      //       {
      //         id: id,
      //         attendance_date: attendance_date,
      //         u_sched_in: u_sched_in,
      //         u_sched_out: u_sched_out,
      //         update_code: 3, // 3 for update
      //       }
      //     );

          
      //   } catch (error) {
      //     const errorMessage =
      //       error instanceof Error
      //         ? error.message
      //         : "Failed to update attendance record";
      //     set({ error: errorMessage });
      //     throw error; // Re-throw so calling code can handle it
      //   } finally {
      //     set({ isLoading: false });
      //   }
      // },

      //? reset attendance record
      // resetAttendanceRecord

      clearError: () => set({ error: null }),
      reset: () => set({ Attendance: [], isLoading: false, error: null }),
    }),
    { name: "attendance-store" }
  )
);
