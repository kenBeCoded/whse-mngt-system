import { useEffect } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Edit2 } from "lucide-react";
import type { WarehouseBin } from "@/services/warehouseService";

const schema = z.object({
  bin_code: z.string().min(1, "Bin code is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bin: WarehouseBin | null;
  onSubmit: (binId: number, locationId: number, data: FormData) => Promise<void>;
}

export function EditBinDialog({ open, onOpenChange, bin, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { bin_code: "", capacity: 0 },
  });

  // Populate form when the bin changes
  useEffect(() => {
    if (bin) {
      reset({
        bin_code: bin.bin_code,
        capacity: bin.capacity,
      });
    }
  }, [bin, reset]);

  const handle = async (data: FormData) => {
    if (!bin) return;
    await onSubmit(bin.id, bin.location_id, data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" /> Edit Bin
          </DialogTitle>
          <DialogDescription>Update the bin code and capacity.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="edit-bin-code" className="text-xs">Bin Code</Label>
            <Input id="edit-bin-code" {...register("bin_code")} disabled={isSubmitting} className="mt-1" />
            {errors.bin_code && <p className="text-red-500 text-xs mt-1">{errors.bin_code.message}</p>}
          </div>
          <div>
            <Label htmlFor="edit-bin-capacity" className="text-xs">Capacity</Label>
            <Input
              id="edit-bin-capacity"
              type="number"
              {...register("capacity", { valueAsNumber: true })}
              disabled={isSubmitting}
              className="mt-1"
            />
            {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity.message}</p>}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => { onOpenChange(false); reset(); }} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Saving..." : "Save Changes"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
