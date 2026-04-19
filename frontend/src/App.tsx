import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
// import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HomePage from "./pages/HomePage";
// import AppPage from "./pages/AppPage";
import MainPage from "./app/MainPage";
import { ThemeProvider } from "./components/theme-provider";
import { UsersPage } from "./app/user-table/page";
import { Toaster } from "@/components/ui/sonner";
import { AttendanceRecordsPage } from "./app/attendance/attendance-table/page";
import { SchedulerPage } from "./app/scheduler/page";
import { SuppliersPage } from "./app/supplier-table/page";
import { InventoryPage } from "./app/inventory-table/page";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <HomePage />
                  </ProtectedRoute>
                }
              >
                <Route element={<Navigate to="admin" />} />
                <Route path="admin" element={<MainPage />}>
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route
                    path="attendance-records"
                    element={<AttendanceRecordsPage />}
                  />
                  <Route path="user-schedule" element={<SchedulerPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                </Route>

                {/* Example nested routes - extend with your full nav structure */}

                {/* Add routes for Architecture, Community, etc., following the same pattern */}
                <Route
                  path="*"
                  element={<div>404 - Page Not Found</div>} // Optional: catch-all for unmatched nested routes
                />
              </Route>
              <Route path="/login" element={<LoginPage />} />
            </Routes>
          </div>
        </Router>
        <Toaster closeButton={true} />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
