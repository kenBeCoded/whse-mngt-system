import axios from "../api/axios";

const API = axios;

// ─── Types ─────────────────────────────────────────────────────────────────────

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
  created_at: string;
  updated_at: string;
}

export interface POLineItem {
  id: number;
  po_id: number;
  item_id: number;
  item_name: string;
  sku: string;
  quantity_ordered: number;
  quantity_received?: number;
  unit_price: number;
  subtotal: number;
}

export interface POStatusLogEntry {
  id: number;
  from_status: POStatus | null;
  to_status: POStatus;
  changed_by: string;
  remarks?: string;
  changed_at: string;
}

export interface PODetail {
  po: PurchaseOrder;
  lines: POLineItem[];
}

export interface CreatePOLineItem {
  item_id: number;
  quantity_ordered: number;
  unit_price: number;
}

export interface CreatePOPayload {
  supplier_id: number;
  warehouse_id: number;
  total_amount: number;
  created_by: number;
  line_items: CreatePOLineItem[];
  attachment_url?: string;
  attachment_file_type?: string;
}

export interface UpdateStatusPayload {
  to_status: POStatus;
  changed_by: number;
  remarks?: string;
}

export interface ReceiveItemPayload {
  po_line_id: number;
  item_id: number;
  quantity_expected: number;
  quantity_received: number;
}

export interface ReceivePOPayload {
  received_by: number;
  items: ReceiveItemPayload[];
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const purchaseOrderService = {
  getAll: async (): Promise<PurchaseOrder[]> => {
    const response = await API.get("/api/purchase-orders");
    return response.data.data;
  },

  getById: async (id: number): Promise<PODetail> => {
    const response = await API.get(`/api/purchase-orders/${id}`);
    return response.data.data;
  },

  create: async (data: CreatePOPayload): Promise<PurchaseOrder> => {
    const response = await API.post("/api/purchase-orders", data);
    return response.data.data;
  },

  getStatusHistory: async (id: number): Promise<POStatusLogEntry[]> => {
    const response = await API.get(
      `/api/purchase-orders/${id}/status-history`
    );
    return response.data.data;
  },

  updateStatus: async (
    id: number,
    data: UpdateStatusPayload
  ): Promise<PurchaseOrder> => {
    const response = await API.patch(
      `/api/purchase-orders/${id}/status`,
      data
    );
    return response.data.data;
  },

  receive: async (
    id: number,
    data: ReceivePOPayload
  ): Promise<{ receipt_id: number; status: string }> => {
    const response = await API.post(
      `/api/purchase-orders/${id}/receive`,
      data
    );
    return response.data.data;
  },
};
