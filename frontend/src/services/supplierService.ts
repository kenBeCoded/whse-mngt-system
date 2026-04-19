import axios from "../api/axios";

const API = axios;

export interface Supplier {
  id: number;
  name: string;
  email: string;
  address?: string;
  is_active: boolean;
  created_by: number;
  updated_by?: number;
  created_at: string;
  updated_at: string;
}

export type CreateSupplierPayload = Pick<Supplier, "name" | "email"> & {
  address?: string;
  created_by: number;
};

export type UpdateSupplierPayload = {
  name?: string;
  email?: string;
  address?: string;
  updated_by: number;
};

export const supplierService = {
  getAll: async (): Promise<Supplier[]> => {
    const response = await API.get("/api/suppliers");
    // Backend wraps: { success: true, data: Supplier[] }
    return response.data.data;
  },

  getById: async (id: number): Promise<Supplier> => {
    const response = await API.get(`/api/suppliers/${id}`);
    return response.data.data;
  },

  create: async (data: CreateSupplierPayload): Promise<Supplier> => {
    const response = await API.post("/api/suppliers", data);
    return response.data.data;
  },

  update: async (
    id: number,
    data: UpdateSupplierPayload
  ): Promise<Supplier> => {
    const response = await API.put(`/api/suppliers/${id}`, data);
    return response.data.data;
  },

  deactivate: async (id: number): Promise<void> => {
    await API.patch(`/api/suppliers/${id}/deactivate`);
  },

  reactivate: async (id: number): Promise<void> => {
    await API.patch(`/api/suppliers/${id}/reactivate`);
  },
};
