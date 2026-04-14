//? /api/warehouses
import { Router } from "express";
import {
  createWarehouse,
  getAllWarehouses,
  getWarehouseById,
  updateWarehouse,
  deactivateWarehouse,
  reactivateWarehouse,
  getUnallocatedAssets,
} from "../../controllers/warehouse/warehouseController.js";
import {
  createLocation,
  getLocationsByWarehouse,
  updateLocation,
  deactivateLocation,
  reactivateLocation,
} from "../../controllers/warehouse/locationController.js";
import {
  assignItemToBin,
  transferItemBetweenBins,
} from "../../controllers/warehouse/binController.js";
import {
  validateCreateWarehouse,
  validateUpdateWarehouse,
} from "../../validation/warehouse/warehouse-validation.js";
import {
  validateCreateLocation,
  validateUpdateLocation,
} from "../../validation/warehouse/location-validation.js";
import {
  validateAssignItem,
  validateTransferItem,
} from "../../validation/warehouse/bin-validation.js";

const router = Router();

// ── Warehouse CRUD ──────────────────────────────────────────────────────────
router.post("/", validateCreateWarehouse, createWarehouse);
router.get("/", getAllWarehouses);
router.get("/:id", getWarehouseById);
router.put("/:id", validateUpdateWarehouse, updateWarehouse);
router.patch("/:id/deactivate", deactivateWarehouse);
router.patch("/:id/reactivate", reactivateWarehouse);

// ── Unallocated assets ───────────────────────────────────────────────────────
router.get("/:warehouseId/unallocated", getUnallocatedAssets);

// ── Locations (nested under warehouse) ──────────────────────────────────────
router.post("/:warehouseId/locations", validateCreateLocation, createLocation);
router.get("/:warehouseId/locations", getLocationsByWarehouse);
router.put("/:warehouseId/locations/:id", validateUpdateLocation, updateLocation);
router.patch("/:warehouseId/locations/:id/deactivate", deactivateLocation);
router.patch("/:warehouseId/locations/:id/reactivate", reactivateLocation);

// ── Bin manual assign & transfer ─────────────────────────────────────────────
router.post("/bins/:binId/assign", validateAssignItem, assignItemToBin);
router.post("/bins/transfer", validateTransferItem, transferItemBetweenBins);

export default router;
