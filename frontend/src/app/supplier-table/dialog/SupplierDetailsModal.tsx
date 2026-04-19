import { useState } from "react";
import { useForm } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Supplier } from "@/services/supplierService";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierDetailsModalProps {
  supplier: Supplier;
  onSave: (
    id: number,
    data: {
      name?: string;
      email?: string;
      address?: string;
      updated_by: number;
    }
  ) => void;
  onDeactivate: (id: number) => void;
}

export const SupplierDetailsModal = ({
  supplier,
  onSave,
  onDeactivate,
}: SupplierDetailsModalProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeactivateConfirm, setIsDeactivateConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: supplier.name,
      email: supplier.email,
      address: supplier.address || "",
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      await onSave(supplier.id, {
        ...data,
        updated_by: supplier.created_by, // TODO: replace with current user id
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update supplier:", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await onDeactivate(supplier.id);
      setIsOpen(false);
      setIsDeactivateConfirm(false);
    } catch (error) {
      console.error("Failed to deactivate supplier:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SUPPLIER DETAILS</DialogTitle>
          <DialogDescription>
            View and edit supplier information. Make changes and click save to
            update the supplier details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Supplier ID (read-only) */}
            <div>
              <Label htmlFor="supplier-detail-id" className="text-sm">
                Supplier ID
              </Label>
              <Input
                id="supplier-detail-id"
                value={`#${supplier.id}`}
                readOnly
                className="bg-muted mt-1"
              />
            </div>

            {/* Supplier Name */}
            <div>
              <Label htmlFor="supplier-detail-name" className="text-sm">
                Supplier Name
              </Label>
              <Input
                id="supplier-detail-name"
                {...register("name")}
                disabled={isSubmitting}
                placeholder="Enter supplier name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="supplier-detail-email" className="text-sm">
                Email
              </Label>
              <Input
                id="supplier-detail-email"
                type="email"
                {...register("email")}
                disabled={isSubmitting}
                placeholder="Enter email address"
                className="mt-1"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="supplier-detail-address" className="text-sm">
                Address
              </Label>
              <Input
                id="supplier-detail-address"
                {...register("address")}
                disabled={isSubmitting}
                placeholder="Enter address (optional)"
                className="mt-1"
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Read-only dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="supplier-created-at" className="text-sm">
                  Created At
                </Label>
                <Input
                  id="supplier-created-at"
                  value={new Date(supplier.created_at).toLocaleString()}
                  readOnly
                  className="bg-muted mt-1"
                />
              </div>
              <div>
                <Label htmlFor="supplier-updated-at" className="text-sm">
                  Updated At
                </Label>
                <Input
                  id="supplier-updated-at"
                  value={new Date(supplier.updated_at).toLocaleString()}
                  readOnly
                  className="bg-muted mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-4 border-t">
            <div>
              {!isDeactivateConfirm ? (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDeactivateConfirm(true)}
                  className="text-red-600 border-red-600 hover:bg-red-50"
                  disabled={isSubmitting}
                >
                  Deactivate Supplier
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    type="button"
                    onClick={handleDeactivate}
                    disabled={isSubmitting}
                  >
                    Confirm
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => setIsDeactivateConfirm(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>

            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                type="submit"
                disabled={isSubmitting}
                className="flex-1 sm:flex-none"
              >
                {isSubmitting ? "Saving..." : "Save changes"}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
