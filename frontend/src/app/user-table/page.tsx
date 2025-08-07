import { useState, useEffect } from "react";
import { userColumns, type Users } from "./columns";
import { DataTable } from "./data-table";
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
  withCredentials: true,
});

export async function getUsers(): Promise<Users[]> {
  try {
    const response = await API.get("/api/users/get-all-users");
    if (response.status === 200) {
      return response.data as Users[];
    }
    throw new Error(`Unexpected response status: ${response.status}`);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
}

export function DemoPage() {
  const [users, setUsers] = useState<Users[]>([]);

  const handleSaveUser = async (updatedUser: Users) => {
    console.log("updatedUser", updatedUser);
    try {
      // remove updated_at
      const body = {
        ...updatedUser,
        updated_at: undefined,
      };

      // Optional: Make API call to save user to backend
      const response = await API.patch(`/api/users/update-user`, body);

      if (response.status !== 200) {
        throw new Error(`Failed to update user: ${response.status}`);
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.user_account_id === updatedUser.user_account_id
            ? updatedUser
            : user
        )
      );

      console.log("User updated successfully");
    } catch (error) {
      console.error("Failed to update user:", error);
      // You might want to show an error toast/notification here
    }
  };

  console.log("users", users);

  useEffect(() => {
    getUsers()
      .then((fetchedUsers) => setUsers(fetchedUsers))
      .catch((error) => {
        console.error("Failed to fetch users:", error);
      });
  }, []);

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={userColumns} data={users} onSave={handleSaveUser} />
    </div>
  );
}
