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

interface InventoryCreateModalProps {
  onCreate: (data: Omit<InventoryFormData, "default_unit_price"> & { default_unit_price?: number }) => void;
}

export const InventoryCreateModal = ({
  onCreate,
}: InventoryCreateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<InventoryFormData>({
    resolver: zodResolver(inventorySchema),
    defaultValues: {
      item_number: "",
      sku: "",
      name: "",
      description: "",
      category: "",
      unit_of_measure: "",
      default_unit_price: undefined,
    },
  });

  const onSubmit = async (data: InventoryFormData) => {
    try {
      const parsedPrice =
        data.default_unit_price === "" || data.default_unit_price === undefined
          ? undefined
          : Number(data.default_unit_price);
      
      await onCreate({
        ...data,
        default_unit_price: parsedPrice,
      });
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create item:", error);
    }
  };

  const uomValue = watch("unit_of_measure");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-2">Create Item</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CREATE NEW ITEM</DialogTitle>
          <DialogDescription>
            Enter item information to add a new inventory item. Click save to
            create the item.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Item Number & SKU */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="item-number" className="text-sm">
                  Item Number
                </Label>
                <Input
                  id="item-number"
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
                <Label htmlFor="item-sku" className="text-sm">
                  SKU
                </Label>
                <Input
                  id="item-sku"
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
              <Label htmlFor="item-name" className="text-sm">
                Item Name
              </Label>
              <Input
                id="item-name"
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
              <Label htmlFor="item-description" className="text-sm">
                Description
              </Label>
              <Input
                id="item-description"
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
                <Label htmlFor="item-category" className="text-sm">
                  Category
                </Label>
                <Input
                  id="item-category"
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
                <Label htmlFor="item-uom" className="text-sm">
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
                <Label htmlFor="item-price" className="text-sm">
                  Default Unit Price
                </Label>
                <Input
                  id="item-price"
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
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto"
            >
              {isSubmitting ? "Creating..." : "Create Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
