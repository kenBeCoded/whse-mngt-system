import axios from "../api/axios";

const API = axios;

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
  created_at: string;
  updated_at: string;
}

export type CreateInventoryPayload = Omit<
  InventoryItem,
  "id" | "is_active" | "created_at" | "updated_at"
>;

export type UpdateInventoryPayload = Omit<
  InventoryItem,
  "id" | "is_active" | "created_by" | "created_at" | "updated_at"
>;

export const inventoryService = {
  getAll: async (): Promise<InventoryItem[]> => {
    const response = await API.get("/api/inventory/items");
    // Backend wraps: { success: true, data: InventoryItem[] }
    return response.data.data;
  },

  getById: async (id: number): Promise<InventoryItem> => {
    const response = await API.get(`/api/inventory/items/${id}`);
    return response.data.data;
  },

  create: async (data: CreateInventoryPayload): Promise<InventoryItem> => {
    const response = await API.post("/api/inventory/items", data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateInventoryPayload
  ): Promise<InventoryItem> => {
    const response = await API.put(`/api/inventory/items/${id}`, data);
    return response.data.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await API.patch(`/api/inventory/items/${id}/deactivate`);
  },
};
