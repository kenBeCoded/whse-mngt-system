import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { WarehouseBin } from "@/services/warehouseService";
import {
  inventoryService,
  type InventoryItem,
} from "@/services/inventoryService";
import { PackagePlus } from "lucide-react";

const schema = z.object({
  bin_id: z.number({ error: "Bin is required" }).min(1),
  item_id: z.number({ error: "Item is required" }).min(1),
  quantity: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Quantity must be > 0"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  bins: WarehouseBin[];
  onSubmit: (data: {
    bin_id: number;
    item_id: number;
    quantity: number;
  }) => Promise<void>;
}

export function AssignItemDialog({ bins, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    if (open) {
      inventoryService.getAll().then(setItems).catch(console.error);
    }
  }, [open]);

  const {
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    register,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      bin_id: undefined,
      item_id: undefined,
      quantity: "" as any,
    },
  });

  const handle = async (data: FormData) => {
    try {
      await onSubmit({
        bin_id: data.bin_id,
        item_id: data.item_id,
        quantity: Number(data.quantity),
      });
      setOpen(false);
      reset();
    } catch (err) {
      // Keep open and let parent handle toast
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <PackagePlus className="h-3.5 w-3.5" /> Assign Item
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackagePlus className="h-4 w-4" /> Assign Item to Bin
          </DialogTitle>
          <DialogDescription>
            Manually assign an inventory item to a bin.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs">Bin</Label>
            <Controller
              name="bin_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select bin" />
                  </SelectTrigger>
                  <SelectContent>
                    {bins
                      .filter((b) => b.is_active)
                      .map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.bin_code} (avail:{" "}
                          {b.capacity - b.current_occupancy})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.bin_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.bin_id.message}
              </p>
            )}
          </div>
          <div>
            <Label className="text-xs">Inventory Item</Label>
            <Controller
              name="item_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select item" />
                  </SelectTrigger>
                  <SelectContent>
                    {items.map((it) => (
                      <SelectItem key={it.id} value={String(it.id)}>
                        {it.name} ({it.sku})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.item_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.item_id.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="assign-qty" className="text-xs">
              Quantity
            </Label>
            <Input
              id="assign-qty"
              type="number"
              min={1}
              {...register("quantity")}
              disabled={isSubmitting}
              placeholder="e.g. 10"
              className="mt-1"
            />
            {errors.quantity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Assigning..." : "Assign Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
