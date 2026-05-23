import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  supplierService,
  type Supplier,
  type CreateSupplierPayload,
  type UpdateSupplierPayload,
} from "../services/supplierService";
import { toast } from "sonner";
import { formatCustomDate1 } from "../utils/formatTime";

interface SupplierState {
  // State
  suppliers: Supplier[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setSuppliers: (suppliers: Supplier[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD operations
  fetchSuppliers: () => Promise<void>;
  addSupplier: (data: CreateSupplierPayload) => Promise<void>;
  updateSupplier: (id: number, data: UpdateSupplierPayload) => Promise<void>;
  deactivateSupplier: (id: number) => Promise<void>;

  // Utility
  getSupplierById: (id: number) => Supplier | undefined;
  clearError: () => void;
  reset: () => void;
}

export const useSupplierStore = create<SupplierState>()(
  devtools(
    (set, get) => ({
      // Initial State
      suppliers: [],
      isLoading: false,
      error: null,

      // Basic setters
      setSuppliers: (suppliers) => set({ suppliers }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Fetch all suppliers
      fetchSuppliers: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await supplierService.getAll();
          set({ suppliers: data, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch suppliers");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching suppliers:", error);
        }
      },

      // Add new supplier
      addSupplier: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newSupplier = await supplierService.create(data);
          set((state) => ({
            suppliers: [...state.suppliers, newSupplier],
            isLoading: false,
          }));
          toast.success("Supplier created successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to create supplier");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to add supplier:", error);
          throw error;
        }
      },

      // Update existing supplier
      updateSupplier: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await supplierService.update(id, data);
          set((state) => ({
            suppliers: state.suppliers.map((s) =>
              s.id === id ? updated : s
            ),
            isLoading: false,
          }));
          toast.success("Supplier updated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to update supplier");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to update supplier:", error);
          throw error;
        }
      },

      // Deactivate supplier
      deactivateSupplier: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await supplierService.deactivate(id);
          set((state) => ({
            suppliers: state.suppliers.filter((s) => s.id !== id),
            isLoading: false,
          }));
          toast.success("Supplier deactivated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to deactivate supplier");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to deactivate supplier:", error);
          throw error;
        }
      },

      // Utility functions
      getSupplierById: (id) => {
        const { suppliers } = get();
        return suppliers.find((s) => s.id === id);
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          suppliers: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "supplier-store",
    }
  )
);
