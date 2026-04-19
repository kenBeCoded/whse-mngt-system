import { useEffect } from "react";
import { inventoryColumns } from "./columns";
import { DataTable } from "./data-table";
import { useInventoryStore } from "../../store/inventory-store";
import { useAuth } from "@/hooks/useAuth";
import type { InventoryItem } from "@/services/inventoryService";

export function InventoryPage() {
  const {
    items,
    isLoading,
    error,
    fetchItems,
    addItem,
    updateItem,
    deactivateItem,
    clearError,
  } = useInventoryStore();

  const { user } = useAuth();

  // Fetch items on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error("Inventory store error:", error);
    }
  }, [error]);

  const handleCreateItem = async (data: {
    item_number: string;
    sku: string;
    name: string;
    description?: string;
    category?: string;
    unit_of_measure: string;
    default_unit_price?: number;
  }) => {
    try {
      await addItem({
        ...data,
        created_by: Number(user?.id) || 0,
      });
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const handleSaveItem = async (
    id: number,
    data: Omit<
      InventoryItem,
      "id" | "is_active" | "created_by" | "created_at" | "updated_at"
    >
  ) => {
    try {
      await updateItem(id, data);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDeactivateItem = async (id: number) => {
    try {
      await deactivateItem(id);
    } catch (error) {
      console.error("Failed to deactivate item:", error);
    }
  };

  // Show loading state
  if (isLoading && items.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading inventory items...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      {/* Error display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      <DataTable
        columns={inventoryColumns}
        data={items}
        onSave={handleSaveItem}
        onDeactivate={handleDeactivateItem}
        onCreate={handleCreateItem}
        isLoading={isLoading}
      />
    </div>
  );
}
