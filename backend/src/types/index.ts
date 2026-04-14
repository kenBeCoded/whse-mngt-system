import { Request } from "express";

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  user_account_id: number;
  username: string;
  password_hash: string;
  email?: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  gender: string;
  user_profile_image_url?: string;
  created_at: Date;
  updated_at: Date;
  is_deleted?: boolean;
  role: string;
  u_sched_in: string;
  u_sched_out: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role: string;
  };
}

export interface JWTPayload {
  userId: number;
  username: string;
  role?: string;
  iat?: number;
  exp?: number;
}

// ─── Inventory ───────────────────────────────────────────────────────────────
export interface InventoryItem {
  id: number;
  item_number: string;
  sku: string;
  name: string;
  description?: string;
  category?: string;
  unit_of_measure: string;
  default_unit_price?: number;
  is_active: boolean;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

export interface InventoryStock {
  id: number;
  item_id: number;
  warehouse_location_id: number;
  quantity: number;
  updated_at: Date;
}

export interface InventoryTransaction {
  id: number;
  transaction_number: string;
  item_id: number;
  type: "in" | "out" | "transfer";
  quantity: number;
  reason?: string;
  reference_id?: number;
  employee_id: number;
  created_at: Date;
}

// ─── Supplier ────────────────────────────────────────────────────────────────
export interface Supplier {
  id: number;
  name: string;
  email: string;
  address?: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

// ─── Purchase Order ──────────────────────────────────────────────────────────
export type POStatus =
  | "request"
  | "pending"
  | "approved"
  | "preparing"
  | "shipped"
  | "received"
  | "cancelled";

export interface PurchaseOrder {
  id: number;
  po_number: string;
  supplier_id: number;
  warehouse_id: number;
  status: POStatus;
  total_amount: number;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface POLineItem {
  item_id: number;
  quantity_ordered: number;
  unit_price: number;
}

export interface POStatusLog {
  id: number;
  po_id: number;
  from_status?: POStatus;
  to_status: POStatus;
  changed_by: number;
  remarks?: string;
  changed_at: Date;
}

export interface POReceipt {
  id: number;
  po_id: number;
  warehouse_id: number;
  received_by: number;
  status: "complete" | "partial";
  received_at: Date;
}

export interface POReceiptLine {
  id: number;
  receipt_id: number;
  po_line_id: number;
  item_id: number;
  quantity_expected: number;
  quantity_received: number;
}

// ─── Warehouse ────────────────────────────────────────────────────────────────
export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  longitude?: number;
  latitude?: number;
  total_capacity: number;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Location {
  id: number;
  warehouse_id: number;
  zone: string;
  row: string;
  aisle: string;
  bay: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface Bin {
  id: number;
  location_id: number;
  bin_code: string;
  capacity: number;
  current_occupancy: number;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: Date;
  updated_at: Date;
}

export interface ItemLocation {
  id: number;
  item_id: number;
  bin_id?: number;
  quantity: number;
  allocation_status: "allocated" | "unallocated";
  source?: "manual" | "po_receipt";
  receipt_line_id?: number;
  allocated_by?: number;
  allocated_at?: Date;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}
