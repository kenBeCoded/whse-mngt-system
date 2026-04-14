import { Router } from "express";
import userRoutes from "./sub-routes/users.js";
import attendanceRoute from "./sub-routes/attendance.js";
import authController from "../auth/authController.js";
import inventoryRoutes from "./sub-routes/inventory.js";
import supplierRoutes from "./sub-routes/supplier.js";
import poRoutes from "./sub-routes/po.js";
import warehouseRoutes from "./sub-routes/warehouse.js";
import binRoutes from "./sub-routes/bin.js";

const router = Router();

// ── Auth (public) ────────────────────────────────────────────────────────────
router.use("/auth", authController);

// ── Users & Attendance ───────────────────────────────────────────────────────
router.use("/users", userRoutes);
router.use("/attendance", attendanceRoute);

// ── Module 1 — Inventory ─────────────────────────────────────────────────────
router.use("/inventory", inventoryRoutes);

// ── Module 2 — Purchase Orders & Suppliers ───────────────────────────────────
router.use("/suppliers", supplierRoutes);
router.use("/purchase-orders", poRoutes);

// ── Module 3 — Warehouse / Locations / Bins ──────────────────────────────────
router.use("/warehouses", warehouseRoutes);
router.use("/locations", binRoutes);

// ── API info route ────────────────────────────────────────────────────────────
router.get("/", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "API is running!",
      version: "1.0.0",
      endpoints: {
        auth: "/api/auth",
        users: "/api/users",
        attendance: "/api/attendance",
        inventory: "/api/inventory/items",
        suppliers: "/api/suppliers",
        purchaseOrders: "/api/purchase-orders",
        warehouses: "/api/warehouses",
        locations: "/api/locations",
        health: "/health",
      },
    },
  });
});

export default router;
