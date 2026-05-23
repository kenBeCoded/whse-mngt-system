import { useEffect } from "react";
import { supplierColumns } from "./columns";
import { DataTable } from "./data-table";
import { useSupplierStore } from "../../store/supplier-store";
import { useAuth } from "@/hooks/useAuth";

export function SuppliersPage() {
  const {
    suppliers,
    isLoading,
    error,
    fetchSuppliers,
    addSupplier,
    updateSupplier,
    deactivateSupplier,
    clearError,
  } = useSupplierStore();

  const { user } = useAuth();

  // Fetch suppliers on component mount
  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle error display
  useEffect(() => {
    if (error) {
      console.error("Supplier store error:", error);
    }
  }, [error]);

  const handleCreateSupplier = async (data: {
    name: string;
    email: string;
    address?: string;
  }) => {
    try {
      await addSupplier({
        ...data,
        created_by: Number(user?.id) || 0,
      });
    } catch (error) {
      console.error("Failed to create supplier:", error);
    }
  };

  const handleSaveSupplier = async (
    id: number,
    data: {
      name?: string;
      email?: string;
      address?: string;
      updated_by: number;
    }
  ) => {
    try {
      await updateSupplier(id, {
        ...data,
        updated_by: Number(user?.id) || data.updated_by,
      });
    } catch (error) {
      console.error("Failed to update supplier:", error);
    }
  };

  const handleDeactivateSupplier = async (id: number) => {
    try {
      await deactivateSupplier(id);
    } catch (error) {
      console.error("Failed to deactivate supplier:", error);
    }
  };

  // Show loading state
  if (isLoading && suppliers.length === 0) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading suppliers...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">SUPPLIERS</h1>
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

      <DataTable
        columns={supplierColumns}
        data={suppliers}
        onSave={handleSaveSupplier}
        onDeactivate={handleDeactivateSupplier}
        onCreate={handleCreateSupplier}
        isLoading={isLoading}
      />
    </div>
  );
}
