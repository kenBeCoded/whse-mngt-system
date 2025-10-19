import type { AttendanceRecords } from "@/app/attendance-table/columns";
import axios from "axios";
import { devtools } from "zustand/middleware/devtools";
import { create } from "zustand/react";

const API = axios.create({
  withCredentials: true,
});

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
  fetchRecord: () => Promise<void>;
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
    (set, get) => ({
      // Initial State
      Attendance: [],
      isLoading: false,
      error: null,

      // Basic setters
      setAttendanceRecords: (Attendance) => set({ Attendance }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

    //   fetchRecord: async () => {
    //     set({ isLoading: true, error: null });
    //     try {
    //       const response = await API.get<AttendanceRecords[]>("/attendance");
    //       set({ Attendance: response.data });
    //     } catch (error) {
    //       console.error("Failed to fetch attendance records:", error);
    //       set({ error: error.message || "Failed to fetch attendance records" });
    //     } finally {
    //       set({ isLoading: false });
    //     }
    //   }
    }),
    { name: "attendance-store" }
  )
);
