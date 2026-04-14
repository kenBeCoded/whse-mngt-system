//? /api/inventory
import { Router } from "express";
import {
  createInventoryItem,
  getAllInventoryItems,
  getInventoryItemById,
  updateInventoryItem,
  deactivateInventoryItem,
} from "../../controllers/inventory/inventoryController.js";
import {
  validateCreateInventory,
  validateUpdateInventory,
} from "../../validation/inventory/inventory-validation.js";

const router = Router();

router.post("/items", validateCreateInventory, createInventoryItem);
router.get("/items", getAllInventoryItems);
router.get("/items/:id", getInventoryItemById);
router.put("/items/:id", validateUpdateInventory, updateInventoryItem);
router.patch("/items/:id/deactivate", deactivateInventoryItem);

export default router;
