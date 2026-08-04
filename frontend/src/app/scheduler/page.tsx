import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { schedulerColumns, type SchedulerUser } from "./columns";
import { SchedulerDataTable } from "./data-table";
import { useUserStore } from "@/store/user-store";
import { useAuth } from "@/hooks/useAuth";
import axios from "@/api/axios";
import { toast } from "sonner";

const API = axios;

export function SchedulerPage() {
  const { user } = useAuth();
  const { users, isLoading, error, fetchUsers, clearError } = useUserStore();
  const [isUpdating, setIsUpdating] = useState(false);
  const [resetSelection, setResetSelection] = useState(0);

  if (user?.role?.toLowerCase() === "employee") {
    return <Navigate to="/admin" replace />;
  }

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error("User store error:", error);
      toast.error(error);
    }
  }, [error]);

  // Transform users data to scheduler format
  const schedulerUsers: SchedulerUser[] = users.map((user) => ({
    id: user.id,
    username: user.username,
    user_account_id: user.user_account_id || "",
    first_name: user.first_name,
    middle_name: user.middle_name,
    last_name: user.last_name,
    role: user.role,
    u_sched_in: user.u_sched_in || null,
    u_sched_out: user.u_sched_out || null,
  }));

  const handleScheduleChange = async (
    userIds: number[],
    dateFrom: string,
    dateTo: string,
    schedIn: string,
    schedOut: string
  ) => {
    setIsUpdating(true);
    try {
      // Call the backend API directly with user IDs
      const response = await API.patch(
        "/api/attendance/audit-attendance-update",
        {
          update_code: 3,
          usersIds: userIds,
          dateFrom: dateFrom,
          dateTo: dateTo,
          u_sched_in: schedIn,
          u_sched_out: schedOut,
        }
      );

      if (response.status === 200) {
        // Refresh user data to show updated schedules
        await fetchUsers();
        toast.success(
          `Schedule updated successfully for ${userIds.length} user(s).`
        );
        // Clear selection
        setResetSelection(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule. Please try again.");
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  // Show loading state on initial load
  if (isLoading && users.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading users...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">SCHEDULER</h1>
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <SchedulerDataTable
        columns={schedulerColumns}
        data={schedulerUsers}
        isLoading={isLoading || isUpdating}
        onScheduleChange={handleScheduleChange}
        key={resetSelection}
      />
    </div>
  );
}