import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { user, logout, loading } = useAuth();

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
}

export default DashboardPage;
