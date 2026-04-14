//? /api/suppliers
import { Router } from "express";
import {
  createSupplier,
  getAllSuppliers,
  getSupplierById,
  updateSupplier,
  deactivateSupplier,
  reactivateSupplier,
} from "../../controllers/purchase-order/supplierController.js";
import {
  validateCreateSupplier,
  validateUpdateSupplier,
} from "../../validation/purchase-order/supplier-validation.js";

const router = Router();

router.post("/", validateCreateSupplier, createSupplier);
router.get("/", getAllSuppliers);
router.get("/:id", getSupplierById);
router.put("/:id", validateUpdateSupplier, updateSupplier);
router.patch("/:id/deactivate", deactivateSupplier);
router.patch("/:id/reactivate", reactivateSupplier)

export default router;
