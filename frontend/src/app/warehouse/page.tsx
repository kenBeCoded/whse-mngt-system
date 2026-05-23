import { useEffect, useState } from "react";
import { warehouseColumns } from "./columns";
import { DataTable } from "./data-table";
import { WarehouseMapView } from "./WarehouseMapView";
import { useWarehouseStore } from "../../store/warehouse-store";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type ViewMode = "table" | "map";

export function WarehousesPage() {
  const {
    warehouses,
    isLoading,
    error,
    fetchWarehouses,
    addWarehouse,
    clearError,
  } = useWarehouseStore();

  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<ViewMode>("table");

  useEffect(() => {
    fetchWarehouses();
  }, [fetchWarehouses]);

  useEffect(() => {
    if (error) {
      console.error("Warehouse store error:", error);
    }
  }, [error]);

  const handleCreateWarehouse = async (data: {
    name: string;
    address: string;
    longitude?: number;
    latitude?: number;
    total_capacity: number;
  }) => {
    try {
      await addWarehouse({
        ...data,
        created_by: Number(user?.id) || 0,
      });
    } catch (error) {
      console.error("Failed to create warehouse:", error);
    }
  };

  if (isLoading && warehouses.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading warehouses...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">WAREHOUSES</h1>
      </div>

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

      {/* View Toggle */}
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm font-medium text-muted-foreground mr-2">
          View:
        </span>
        <Button
          variant={viewMode === "table" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("table")}
        >
          Table
        </Button>
        <Button
          variant={viewMode === "map" ? "default" : "outline"}
          size="sm"
          onClick={() => setViewMode("map")}
        >
          Map
        </Button>
      </div>

      {/* Conditional View */}
      {viewMode === "table" ? (
        <DataTable
          columns={warehouseColumns}
          data={warehouses}
          isLoading={isLoading}
          onCreate={handleCreateWarehouse}
        />
      ) : (
        <WarehouseMapView warehouses={warehouses} />
      )}
    </div>
  );
}
