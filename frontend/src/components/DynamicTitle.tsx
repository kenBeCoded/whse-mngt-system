import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const routeTitleMap: Record<string, string> = {
  "/login": "Login",
  "/admin/dashboard": "Dashboard",
  "/admin/users": "User Management",
  "/admin/attendance-records": "Attendance Records",
  "/admin/user-schedule": "Scheduler",
  "/admin/suppliers": "Suppliers",
  "/admin/inventory": "Inventory",
  "/admin/purchase-orders": "Purchase Orders",
  "/admin/purchase-orders/new": "Create Purchase Order",
  "/admin/warehouses": "Warehouses",
  "/admin/profile": "My Profile",
};

export function DynamicTitle() {
  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    
    let pageTitle = "";

    if (routeTitleMap[pathname]) {
      pageTitle = routeTitleMap[pathname];
    } else if (pathname.startsWith("/admin/purchase-orders/")) {
      pageTitle = "Purchase Order Details";
    } else if (pathname.startsWith("/admin/warehouses/")) {
      pageTitle = "Warehouse Details";
    } else {
      pageTitle = "WHSE MNGT";
    }

    document.title = pageTitle === "WHSE MNGT" ? "WHSE MNGT" : `${pageTitle} | WHSE MNGT`;
  }, [location]);

  return null;
}
