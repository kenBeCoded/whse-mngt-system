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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { InventoryItem } from "@/services/inventoryService";
import { useAuth } from "@/hooks/useAuth";

const inventorySchema = z.object({
  item_number: z.string().min(1, "Item number is required"),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Item name is required"),
  description: z.string().optional(),
  category: z.string().optional(),
  unit_of_measure: z.string().min(1, "Unit of measure is required"),
  default_unit_price: z.union([z.string(), z.number()]).optional(),
});

type InventoryFormData = z.infer<typeof inventorySchema>;

interface InventoryDetailsModalProps {
  item: InventoryItem;
  onSave: (
    id: number,
    data: Omit<
      InventoryItem,
      "id" | "is_active" | "created_by" | "created_at" | "updated_at"
    >
  ) => void;
  onDeactivate: (id: number) => void;
}

export const InventoryDetailsModal = ({
  item,
  onSave,
  onDeactivate,
}: InventoryDetailsModalProps) => {
  const { user } = useAuth();
  const isEmployee = user?.role?.toLowerCase() === "employee";
  const [isOpen, setIsOpen] = useState(false);
  const [isDeactivateConfirm, setIsDeactivateConfirm] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      item_number: item.item_number,
      sku: item.sku,
      name: item.name,
      description: item.description || "",
      category: item.category || "",
      unit_of_measure: item.unit_of_measure,
      default_unit_price: item.default_unit_price ?? undefined,
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const parsedPrice =
        data.default_unit_price === "" || data.default_unit_price === undefined
          ? undefined
          : Number(data.default_unit_price);
      
      await onSave(item.id, {
        ...data,
        default_unit_price: parsedPrice,
      } as any);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to update item:", error);
    }
  };

  const handleDeactivate = async () => {
    try {
      await onDeactivate(item.id);
      setIsOpen(false);
      setIsDeactivateConfirm(false);
    } catch (error) {
      console.error("Failed to deactivate item:", error);
    }
  };

  const uomValue = watch("unit_of_measure");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          Details
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>ITEM DETAILS</DialogTitle>
          <DialogDescription>
            View and edit item information. Make changes and click save to
            update the item details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Item Number & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="detail-item-number" className="text-sm">
                  Item Number
                </Label>
                <Input
                  id="detail-item-number"
                  {...register("item_number")}
                  disabled={isSubmitting}
                  placeholder="Enter item number"
                  className="mt-1"
                />
                {errors.item_number && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.item_number.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="detail-item-sku" className="text-sm">
                  SKU
                </Label>
                <Input
                  id="detail-item-sku"
                  {...register("sku")}
                  disabled={isSubmitting}
                  placeholder="Enter SKU"
                  className="mt-1"
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.sku.message}
                  </p>
                )}
              </div>
            </div>

            {/* Item Name */}
            <div>
              <Label htmlFor="detail-item-name" className="text-sm">
                Item Name
              </Label>
              <Input
                id="detail-item-name"
                {...register("name")}
                disabled={isSubmitting}
                placeholder="Enter item name"
                className="mt-1"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="detail-item-description" className="text-sm">
                Description
              </Label>
              <Input
                id="detail-item-description"
                {...register("description")}
                disabled={isSubmitting}
                placeholder="Enter description (optional)"
                className="mt-1"
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Category & UoM */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="detail-item-category" className="text-sm">
                  Category
                </Label>
                <Input
                  id="detail-item-category"
                  {...register("category")}
                  disabled={isSubmitting}
                  placeholder="Enter category (optional)"
                  className="mt-1"
                />
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.category.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="detail-item-uom" className="text-sm">
                  Unit of Measure
                </Label>
                <Select
                  value={uomValue}
                  onValueChange={(value) => setValue("unit_of_measure", value)}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="w-full mt-1">
                    <SelectValue placeholder="Select UoM" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                    <SelectItem value="kg">Kilogram (kg)</SelectItem>
                    <SelectItem value="lbs">Pounds (lbs)</SelectItem>
                    <SelectItem value="box">Box</SelectItem>
                    <SelectItem value="pack">Pack</SelectItem>
                    <SelectItem value="roll">Roll</SelectItem>
                    <SelectItem value="set">Set</SelectItem>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="ltr">Liter (ltr)</SelectItem>
                    <SelectItem value="mtr">Meter (mtr)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.unit_of_measure && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.unit_of_measure.message}
                  </p>
                )}
              </div>
            </div>

            {/* Default Unit Price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="detail-item-price" className="text-sm">
                  Default Unit Price
                </Label>
                <Input
                  id="detail-item-price"
                  type="number"
                  step="0.01"
                  {...register("default_unit_price")}
                  disabled={isSubmitting}
                  placeholder="0.00 (optional)"
                  className="mt-1"
                />
                {errors.default_unit_price && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.default_unit_price.message}
                  </p>
                )}
              </div>
            </div>

            {/* Read-only dates */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="detail-item-created-at" className="text-sm">
                  Created At
                </Label>
                <Input
                  id="detail-item-created-at"
                  value={new Date(item.created_at).toLocaleString()}
                  readOnly
                  className="bg-muted mt-1"
                />
              </div>
              <div>
                <Label htmlFor="detail-item-updated-at" className="text-sm">
                  Updated At
                </Label>
                <Input
                  id="detail-item-updated-at"
                  value={new Date(item.updated_at).toLocaleString()}
                  readOnly
                  className="bg-muted mt-1"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {!isEmployee && (
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
                    Deactivate Item
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
          )}
        </form>
      </DialogContent>
    </Dialog>
  );
};
