import MyAttendance from "@/app/attendance/MyAttendance";
import { useAuth } from "../hooks/useAuth";

function DashboardPage() {
  const { loading } = useAuth();

  if (loading) {
    return <div>Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <MyAttendance />
    </div>
  );
}

export default DashboardPage;
