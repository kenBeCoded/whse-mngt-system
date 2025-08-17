import { useEffect } from "react";
import { userColumns, type Users } from "./columns";
import { DataTable } from "./data-table";
import { useUserStore } from "../../store/user-store";

export function DemoPage() {
  const {
    users,
    isLoading,
    error,
    fetchUsers,
    updateUser,
    deleteUser,
    deleteMultipleUsers,
    selectedUsers,
    clearError,
    addUser,
  } = useUserStore();

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle error display (you might want to use a toast library here)
  useEffect(() => {
    if (error) {
      console.error("User store error:", error);
      // You can add toast notification here
      // toast.error(error);
    }
  }, [error]);

  const handleSaveUser = async (updatedUser: Users) => {
    try {
      // return console.log("updatedUser", updatedUser);
      await updateUser(updatedUser);
      // Success feedback could go here
      console.log("User updated successfully");
    } catch (error) {
      // Error handling is already done in the store
      console.error("Failed to update user in component:", error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      console.log("User deleted successfully");
    } catch (error) {
      console.error("Failed to delete user in component:", error);
    }
  };

  const handleDeleteMultipleUsers = async () => {
    if (selectedUsers.length === 0) return;

    try {
      await deleteMultipleUsers(selectedUsers);
      console.log("Users deleted successfully");
    } catch (error) {
      console.error("Failed to delete users in component:", error);
    }
  };

  // TODO PRIO : <onCreate1> create onCreate function here transfer to DataTable
  const handleCreateUser = async (newUser: Omit<Users, "user_account_id">) => {
  try {
    // console.log("newUser", newUser);
    await addUser(newUser);
    console.log("User created successfully");
  } catch (error) {
    console.error("Failed to create user in component:", error);
  }
};

  // Show loading state
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

      {/* Bulk actions */}
      {selectedUsers.length > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-blue-800">
              {selectedUsers.length} user(s) selected
            </p>
            <button
              onClick={handleDeleteMultipleUsers}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Deleting..." : "Delete Selected"}
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={userColumns}
        data={users}
        onSave={handleSaveUser}
        onCreate={handleCreateUser}
        onDelete={handleDeleteUser}
        isLoading={isLoading}
      />
    </div>
  );
}
