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
import { PurchaseOrdersPage } from "./app/purchase-order/page";
import { PurchaseOrderFormPage } from "./app/purchase-order/create/page";
import { PurchaseOrderDetailsPage } from "./app/purchase-order/details/page";
import { WarehousesPage } from "./app/warehouse/page";
import { WarehouseDetailsPage } from "./app/warehouse/details/page";
import { DynamicTitle } from "./components/DynamicTitle";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <DynamicTitle />
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
                <Route index element={<Navigate to="admin" replace />} />
                <Route path="admin" element={<MainPage />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route
                    path="attendance-records"
                    element={<AttendanceRecordsPage />}
                  />
                  <Route path="user-schedule" element={<SchedulerPage />} />
                  <Route path="suppliers" element={<SuppliersPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                  <Route path="purchase-orders/new" element={<PurchaseOrderFormPage />} />
                  <Route path="purchase-orders/:id" element={<PurchaseOrderDetailsPage />} />
                  <Route path="warehouses" element={<WarehousesPage />} />
                  <Route path="warehouses/:id" element={<WarehouseDetailsPage />} />
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
