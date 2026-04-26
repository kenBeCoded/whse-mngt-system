import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  warehouseService,
  type Warehouse,
  type CreateWarehousePayload,
  type UpdateWarehousePayload,
} from "../services/warehouseService";
import { toast } from "sonner";
import { formatCustomDate1 } from "../utils/formatTime";

interface WarehouseState {
  // State
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchWarehouses: () => Promise<void>;
  addWarehouse: (data: CreateWarehousePayload) => Promise<void>;
  updateWarehouse: (id: number, data: UpdateWarehousePayload) => Promise<void>;
  deactivateWarehouse: (id: number) => Promise<void>;

  // Utility
  getWarehouseById: (id: number) => Warehouse | undefined;
  clearError: () => void;
  reset: () => void;
}

export const useWarehouseStore = create<WarehouseState>()(
  devtools(
    (set, get) => ({
      // Initial state
      warehouses: [],
      isLoading: false,
      error: null,

      // Fetch all warehouses
      fetchWarehouses: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await warehouseService.getAll();
          set({ warehouses: data, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to fetch warehouses";
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching warehouses:", error);
        }
      },

      // Add new warehouse
      addWarehouse: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newWarehouse = await warehouseService.create(data);
          set((state) => ({
            warehouses: [...state.warehouses, newWarehouse],
            isLoading: false,
          }));
          toast.success("Warehouse created successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to create warehouse");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to add warehouse:", error);
          throw error;
        }
      },

      // Update existing warehouse
      updateWarehouse: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await warehouseService.update(id, data);
          set((state) => ({
            warehouses: state.warehouses.map((w) =>
              w.id === id ? updated : w
            ),
            isLoading: false,
          }));
          toast.success("Warehouse updated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to update warehouse");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to update warehouse:", error);
          throw error;
        }
      },

      // Deactivate warehouse
      deactivateWarehouse: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await warehouseService.deactivate(id);
          set((state) => ({
            warehouses: state.warehouses.filter((w) => w.id !== id),
            isLoading: false,
          }));
          toast.success("Warehouse deactivated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Failed to deactivate warehouse";
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to deactivate warehouse:", error);
          throw error;
        }
      },

      // Utility
      getWarehouseById: (id) => {
        const { warehouses } = get();
        return warehouses.find((w) => w.id === id);
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          warehouses: [],
          isLoading: false,
          error: null,
        }),
    }),
    { name: "warehouse-store" }
  )
);
