import { useState } from "react";
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
import type { WarehouseLocation } from "@/services/warehouseService";
import { Box, Plus } from "lucide-react";

const schema = z.object({
  location_id: z.number({ error: "Location is required" }).min(1),
  bin_code: z.string().min(1, "Bin code is required"),
  capacity: z
    .union([z.string(), z.number()])
    .refine((v) => Number(v) > 0, "Capacity must be > 0"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  locations: WarehouseLocation[];
  onSubmit: (data: {
    location_id: number;
    bin_code: string;
    capacity: number;
  }) => Promise<void>;
}

export function AddBinDialog({ locations, onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      location_id: undefined,
      bin_code: "",
      capacity: "" as any,
    },
  });

  const handle = async (data: FormData) => {
    await onSubmit({
      location_id: data.location_id,
      bin_code: data.bin_code,
      capacity: Number(data.capacity),
    });
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Bin
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Box className="h-4 w-4" /> Add Bin
          </DialogTitle>
          <DialogDescription>
            Create a new storage bin under a location.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="space-y-4 pt-2">
          <div>
            <Label className="text-xs">Location</Label>
            <Controller
              name="location_id"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={(v) => field.onChange(Number(v))}
                  value={field.value ? String(field.value) : ""}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations
                      .filter((l) => l.is_active)
                      .map((l) => (
                        <SelectItem key={l.id} value={String(l.id)}>
                          {l.zone}-{l.row}-{l.aisle}-{l.bay}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.location_id && (
              <p className="text-red-500 text-xs mt-1">
                {errors.location_id.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="bin-code" className="text-xs">
              Bin Code
            </Label>
            <Input
              id="bin-code"
              {...register("bin_code")}
              disabled={isSubmitting}
              placeholder="e.g. BIN-001"
              className="mt-1"
            />
            {errors.bin_code && (
              <p className="text-red-500 text-xs mt-1">
                {errors.bin_code.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="bin-cap" className="text-xs">
              Capacity
            </Label>
            <Input
              id="bin-cap"
              type="number"
              min={1}
              {...register("capacity")}
              disabled={isSubmitting}
              placeholder="e.g. 100"
              className="mt-1"
            />
            {errors.capacity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.capacity.message}
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
              {isSubmitting ? "Adding..." : "Add Bin"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
