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
import type { WarehouseLocation } from "@/services/warehouseService";

const schema = z.object({
  zone: z.string().min(1, "Zone is required"),
  row: z.string().min(1, "Row is required"),
  aisle: z.string().min(1, "Aisle is required"),
  bay: z.string().min(1, "Bay is required"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: WarehouseLocation | null;
  onSubmit: (locationId: number, data: FormData) => Promise<void>;
}

export function EditLocationDialog({ open, onOpenChange, location, onSubmit }: Props) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { zone: "", row: "", aisle: "", bay: "" },
  });

  // Populate form when the location changes
  useEffect(() => {
    if (location) {
      reset({
        zone: location.zone,
        row: location.row,
        aisle: location.aisle,
        bay: location.bay,
      });
    }
  }, [location, reset]);

  const handle = async (data: FormData) => {
    if (!location) return;
    await onSubmit(location.id, data);
    onOpenChange(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" /> Edit Location
          </DialogTitle>
          <DialogDescription>Update the zone, row, aisle, and bay for this location.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {(["zone", "row", "aisle", "bay"] as const).map((f) => (
              <div key={f}>
                <Label htmlFor={`edit-loc-${f}`} className="text-xs capitalize">{f}</Label>
                <Input id={`edit-loc-${f}`} {...register(f)} disabled={isSubmitting} className="mt-1" />
                {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]?.message}</p>}
              </div>
            ))}
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
