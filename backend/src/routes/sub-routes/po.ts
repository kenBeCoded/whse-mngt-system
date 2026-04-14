//? /api/purchase-orders
import { Router } from "express";
import {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderById,
  getPOStatusHistory,
  updatePOStatus,
  receivePurchaseOrder,
  allocatePurchaseOrder,
} from "../../controllers/purchase-order/poController.js";
import {
  validateCreatePO,
  validateUpdatePOStatus,
  validateReceivePO,
  validateAllocatePO,
} from "../../validation/purchase-order/po-validation.js";

const router = Router();

router.post("/", validateCreatePO, createPurchaseOrder);
router.get("/", getAllPurchaseOrders);
router.get("/:id", getPurchaseOrderById);
router.get("/:id/status-history", getPOStatusHistory);
router.patch("/:id/status", validateUpdatePOStatus, updatePOStatus);
router.post("/:id/receive", validateReceivePO, receivePurchaseOrder);
router.post("/:id/allocate", validateAllocatePO, allocatePurchaseOrder);

export default router;
