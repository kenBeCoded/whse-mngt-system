import { useEffect } from "react";
import { purchaseOrderColumns } from "./columns";
import { DataTable } from "./data-table";
import { usePurchaseOrderStore } from "../../store/purchase-order-store";

export function PurchaseOrdersPage() {
  const { purchaseOrders, isLoading, error, fetchPurchaseOrders, clearError } =
    usePurchaseOrderStore();

  useEffect(() => {
    fetchPurchaseOrders();
  }, [fetchPurchaseOrders]);

  useEffect(() => {
    if (error) {
      console.error("PO store error:", error);
    }
  }, [error]);

  if (isLoading && purchaseOrders.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading purchase orders...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">PURCHASE ORDERS</h1>
      </div>

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
        columns={purchaseOrderColumns}
        data={purchaseOrders}
        isLoading={isLoading}
      />
    </div>
  );
}
