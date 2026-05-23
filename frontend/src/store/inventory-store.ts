import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  inventoryService,
  type InventoryItem,
  type CreateInventoryPayload,
  type UpdateInventoryPayload,
} from "../services/inventoryService";
import { toast } from "sonner";
import { formatCustomDate1 } from "../utils/formatTime";

interface InventoryState {
  // State
  items: InventoryItem[];
  isLoading: boolean;
  error: string | null;

  // Actions
  setItems: (items: InventoryItem[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // CRUD operations
  fetchItems: () => Promise<void>;
  addItem: (data: CreateInventoryPayload) => Promise<void>;
  updateItem: (id: number, data: UpdateInventoryPayload) => Promise<void>;
  deactivateItem: (id: number) => Promise<void>;

  // Utility
  getItemById: (id: number) => InventoryItem | undefined;
  clearError: () => void;
  reset: () => void;
}

export const useInventoryStore = create<InventoryState>()(
  devtools(
    (set, get) => ({
      // Initial State
      items: [],
      isLoading: false,
      error: null,

      // Basic setters
      setItems: (items) => set({ items }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      // Fetch all items
      fetchItems: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await inventoryService.getAll();
          set({ items: data, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch inventory items");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching inventory items:", error);
        }
      },

      // Add new item
      addItem: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newItem = await inventoryService.create(data);
          set((state) => ({
            items: [...state.items, newItem],
            isLoading: false,
          }));
          toast.success("Item created successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to create item");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to add item:", error);
          throw error;
        }
      },

      // Update existing item
      updateItem: async (id, data) => {
        set({ isLoading: true, error: null });
        try {
          const updated = await inventoryService.update(id, data);
          set((state) => ({
            items: state.items.map((item) =>
              item.id === id ? updated : item
            ),
            isLoading: false,
          }));
          toast.success("Item updated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to update item");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to update item:", error);
          throw error;
        }
      },

      // Deactivate item
      deactivateItem: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await inventoryService.deactivate(id);
          set((state) => ({
            items: state.items.filter((item) => item.id !== id),
            isLoading: false,
          }));
          toast.success("Item deactivated successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to deactivate item");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to deactivate item:", error);
          throw error;
        }
      },

      // Utility functions
      getItemById: (id) => {
        const { items } = get();
        return items.find((item) => item.id === id);
      },

      clearError: () => set({ error: null }),

      reset: () =>
        set({
          items: [],
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "inventory-store",
    }
  )
);
