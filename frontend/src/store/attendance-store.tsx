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
  status: string;
  username: string;
  user_account_id: string;
  first_name: string;
  middle_name: string;
  last_name: string;
  gender: string;
  user_profile_image_url: string | null;
  role: string;
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
  fetchRecord: (user_id: number) => Promise<void>;
  fetchRecordByID: (
    user_id: number | string,
    selected_date: string
  ) => Promise<FetchRecordResponse | undefined>
  //   addUser: (user: Omit<Users, "user_account_id">) => Promise<void>;
  //   updateUser: (updatedUser: Users) => Promise<void>;
  //   deleteUser: (username: string) => Promise<void>;
  //   deleteMultipleUsers: (userIds: string[]) => Promise<void>;

  // Utility functions
  //   getUserById: (userId: string) => Users | undefined;
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

      clearError: () => set({ error: null }),
      reset: () => set({ Attendance: [], isLoading: false, error: null }),
    }),
    { name: "attendance-store" }
  )
);
