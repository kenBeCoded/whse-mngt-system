// import React, { useEffect, useState } from "react";
// import { useAuth } from "../context/AuthProvider";
// import axios from "../api/axios";
import { useAuth } from "../hooks/useAuth";

// interface UserData {
//   // Define your user data structure
//   id: number;
//   username: string;
//   // email?: string;
// }

const DashboardPage: React.FC = () => {
  const { user, logout, loading } = useAuth();
  // const [userData, setUserData] = useState<UserData | null>(null);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   const fetchUserData = async () => {
  //     try {
  //       // This will automatically include the auth token via interceptor
  //       const response = await axios.get("/api/auth/profile");
  //       setUserData(response.data);
  //     } catch (error) {
  //       console.error("Failed to fetch user data:", error);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, []);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div className="user-info">
        <h3>Welcome, {user?.username}!</h3>
        <p>User ID: {user?.id}</p>
        {user && (
          <div>
            <h4>Profile Information:</h4>
            <p>Username: {user?.username}</p>
            <p>ID: {user?.id || "Not provided"}</p>
          </div>
        )}
      </div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default DashboardPage;
