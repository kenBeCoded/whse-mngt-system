//? /api/locations
import { Router } from "express";
import {
  createBin,
  getBinsByLocation,
  getBinsByWarehouse,
  updateBin,
  deactivateBin,
  reactivateBin,
} from "../../controllers/warehouse/binController.js";
import {
  validateCreateBin,
  validateUpdateBin,
  validateDeactivateBin,
} from "../../validation/warehouse/bin-validation.js";

const router = Router();

// All bins under a warehouse
router.get("/bins/warehouse/:warehouseId", getBinsByWarehouse);

// Bin CRUD under a location
router.post("/:locationId/bins", validateCreateBin, createBin);
router.get("/:locationId/bins", getBinsByLocation);
router.put("/:locationId/bins/:id", validateUpdateBin, updateBin);
router.patch("/:locationId/bins/:id/deactivate", validateDeactivateBin, deactivateBin);
router.patch("/:locationId/bins/:id/reactivate", reactivateBin);

export default router;
