import axios from "../api/axios";

const API = axios;

export interface Warehouse {
  id: number;
  code: string;
  name: string;
  address: string;
  longitude?: number;
  latitude?: number;
  total_capacity: number;
  is_active: boolean;
  active_bins?: number;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateWarehousePayload {
  name: string;
  address: string;
  longitude?: number;
  latitude?: number;
  total_capacity: number;
  created_by: number;
}

export interface UpdateWarehousePayload {
  name: string;
  address: string;
  longitude?: number;
  latitude?: number;
  total_capacity: number;
  updated_by: number;
}

export interface WarehouseLocation {
  id: number;
  warehouse_id: number;
  zone: string;
  row: string;
  aisle: string;
  bay: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export const warehouseService = {
  getAll: async (): Promise<Warehouse[]> => {
    const response = await API.get("/api/warehouses");
    return response.data.data;
  },

  getById: async (id: number): Promise<Warehouse> => {
    const response = await API.get(`/api/warehouses/${id}`);
    return response.data.data;
  },

  create: async (data: CreateWarehousePayload): Promise<Warehouse> => {
    const response = await API.post("/api/warehouses", data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateWarehousePayload
  ): Promise<Warehouse> => {
    const response = await API.put(`/api/warehouses/${id}`, data);
    return response.data.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await API.patch(`/api/warehouses/${id}/deactivate`);
  },

  reactivate: async (id: number): Promise<void> => {
    await API.patch(`/api/warehouses/${id}/reactivate`);
  },

  getLocations: async (warehouseId: number): Promise<WarehouseLocation[]> => {
    const response = await API.get(
      `/api/warehouses/${warehouseId}/locations`
    );
    return response.data.data;
  },

  getUnallocated: async (warehouseId: number): Promise<any[]> => {
    const response = await API.get(
      `/api/warehouses/${warehouseId}/unallocated`
    );
    return response.data.data;
  },
};

