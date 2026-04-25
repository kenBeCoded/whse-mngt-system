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
};
