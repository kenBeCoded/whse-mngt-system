import { create } from "zustand";
import { devtools } from "zustand/middleware";
import {
  purchaseOrderService,
  type PurchaseOrder,
  type PODetail,
  type POStatusLogEntry,
  type CreatePOPayload,
  type UpdateStatusPayload,
  type ReceivePOPayload,
} from "../services/purchaseOrderService";
import { toast } from "sonner";
import { formatCustomDate1 } from "../utils/formatTime";

interface PurchaseOrderState {
  // List state
  purchaseOrders: PurchaseOrder[];
  isLoading: boolean;
  error: string | null;

  // Detail state
  currentPO: PODetail | null;
  statusHistory: POStatusLogEntry[];
  isDetailLoading: boolean;

  // List actions
  fetchPurchaseOrders: () => Promise<void>;
  createPurchaseOrder: (data: CreatePOPayload) => Promise<PurchaseOrder>;

  // Detail actions
  fetchPODetail: (id: number) => Promise<void>;
  fetchStatusHistory: (id: number) => Promise<void>;
  updatePOStatus: (
    id: number,
    data: UpdateStatusPayload
  ) => Promise<void>;
  receivePO: (
    id: number,
    data: ReceivePOPayload
  ) => Promise<{ receipt_id: number; status: string }>;

  // Utility
  clearError: () => void;
  clearDetail: () => void;
  reset: () => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
  devtools(
    (set) => ({
      // Initial state
      purchaseOrders: [],
      isLoading: false,
      error: null,
      currentPO: null,
      statusHistory: [],
      isDetailLoading: false,

      // ── List actions ─────────────────────────────────────────────────────

      fetchPurchaseOrders: async () => {
        set({ isLoading: true, error: null });
        try {
          const data = await purchaseOrderService.getAll();
          set({ purchaseOrders: data, isLoading: false });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch purchase orders");
          set({ error: errorMessage, isLoading: false });
          console.error("Error fetching POs:", error);
        }
      },

      createPurchaseOrder: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const newPO = await purchaseOrderService.create(data);
          set((state) => ({
            purchaseOrders: [newPO, ...state.purchaseOrders],
            isLoading: false,
          }));
          toast.success("Purchase order created successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
          return newPO;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to create purchase order");
          set({ error: errorMessage, isLoading: false });
          toast.error(errorMessage);
          console.error("Failed to create PO:", error);
          throw error;
        }
      },

      // ── Detail actions ───────────────────────────────────────────────────

      fetchPODetail: async (id) => {
        set({ isDetailLoading: true, error: null });
        try {
          const detail = await purchaseOrderService.getById(id);
          set({ currentPO: detail, isDetailLoading: false });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to fetch PO details");
          set({ error: errorMessage, isDetailLoading: false });
          console.error("Error fetching PO detail:", error);
        }
      },

      fetchStatusHistory: async (id) => {
        try {
          const history = await purchaseOrderService.getStatusHistory(id);
          set({ statusHistory: history });
        } catch (error) {
          console.error("Error fetching status history:", error);
        }
      },

      updatePOStatus: async (id, data) => {
        set({ isDetailLoading: true, error: null });
        try {
          const updated = await purchaseOrderService.updateStatus(id, data);
          // Refresh the detail to get latest data
          const detail = await purchaseOrderService.getById(id);
          const history = await purchaseOrderService.getStatusHistory(id);
          set({
            currentPO: detail,
            statusHistory: history,
            isDetailLoading: false,
          });
          // Also update in list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) =>
              po.id === id ? { ...po, status: updated.status } : po
            ),
          }));
          toast.success(`PO status updated to "${data.to_status}"`, {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to update PO status");
          set({ error: errorMessage, isDetailLoading: false });
          toast.error(errorMessage);
          console.error("Failed to update PO status:", error);
          throw error;
        }
      },

      receivePO: async (id, data) => {
        set({ isDetailLoading: true, error: null });
        try {
          const result = await purchaseOrderService.receive(id, data);
          // Refresh detail
          const detail = await purchaseOrderService.getById(id);
          const history = await purchaseOrderService.getStatusHistory(id);
          set({
            currentPO: detail,
            statusHistory: history,
            isDetailLoading: false,
          });
          // Update in list
          set((state) => ({
            purchaseOrders: state.purchaseOrders.map((po) =>
              po.id === id ? { ...po, status: "received" as const } : po
            ),
          }));
          toast.success("Items received successfully", {
            description: formatCustomDate1(new Date()),
            descriptionClassName: "!text-secondary-foreground",
          });
          return result;
        } catch (error: any) {
          const errorMessage =
            error?.response?.data?.error?.message ||
            error?.response?.data?.message ||
            (error instanceof Error
              ? error.message
              : "Failed to receive items");
          set({ error: errorMessage, isDetailLoading: false });
          toast.error(errorMessage);
          console.error("Failed to receive PO:", error);
          throw error;
        }
      },

      // ── Utility ──────────────────────────────────────────────────────────

      clearError: () => set({ error: null }),
      clearDetail: () =>
        set({ currentPO: null, statusHistory: [], isDetailLoading: false }),
      reset: () =>
        set({
          purchaseOrders: [],
          isLoading: false,
          error: null,
          currentPO: null,
          statusHistory: [],
          isDetailLoading: false,
        }),
    }),
    { name: "purchase-order-store" }
  )
);
