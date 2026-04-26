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
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const warehouseSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required"),
  longitude: z.union([z.string(), z.number()]).optional(),
  latitude: z.union([z.string(), z.number()]).optional(),
  total_capacity: z.union([z.string(), z.number()]).refine(
    (v) => Number(v) > 0,
    "Capacity must be greater than 0"
  ),
});

type WarehouseFormData = z.infer<typeof warehouseSchema>;

interface WarehouseCreateModalProps {
  onCreate: (data: {
    name: string;
    address: string;
    longitude?: number;
    latitude?: number;
    total_capacity: number;
  }) => void;
}

export function WarehouseCreateModal({ onCreate }: WarehouseCreateModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<WarehouseFormData>({
    resolver: zodResolver(warehouseSchema),
    defaultValues: {
      name: "",
      address: "",
      longitude: "",
      latitude: "",
      total_capacity: "",
    },
  });

  const onSubmit = async (data: WarehouseFormData) => {
    const payload = {
      name: data.name,
      address: data.address,
      total_capacity: Number(data.total_capacity),
      ...(data.longitude && data.longitude !== ""
        ? { longitude: Number(data.longitude) }
        : {}),
      ...(data.latitude && data.latitude !== ""
        ? { latitude: Number(data.latitude) }
        : {}),
    };

    onCreate(payload);
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-2">Register Warehouse</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>REGISTER NEW WAREHOUSE</DialogTitle>
          <DialogDescription>
            Fill out the form below to register a new warehouse location.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="wh-name" className="text-sm">
              Warehouse Name
            </Label>
            <Input
              id="wh-name"
              {...register("name")}
              disabled={isSubmitting}
              placeholder="e.g. Central Distribution Hub"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          {/* Address */}
          <div>
            <Label htmlFor="wh-address" className="text-sm">
              Address
            </Label>
            <Input
              id="wh-address"
              {...register("address")}
              disabled={isSubmitting}
              placeholder="Full address"
              className="mt-1"
            />
            {errors.address && (
              <p className="text-red-500 text-xs mt-1">
                {errors.address.message}
              </p>
            )}
          </div>

          {/* Coordinates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="wh-lat" className="text-sm">
                Latitude (optional)
              </Label>
              <Input
                id="wh-lat"
                type="number"
                step="any"
                {...register("latitude")}
                disabled={isSubmitting}
                placeholder="e.g. 14.5995"
                className="mt-1"
              />
              {errors.latitude && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.latitude.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="wh-lng" className="text-sm">
                Longitude (optional)
              </Label>
              <Input
                id="wh-lng"
                type="number"
                step="any"
                {...register("longitude")}
                disabled={isSubmitting}
                placeholder="e.g. 120.9842"
                className="mt-1"
              />
              {errors.longitude && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.longitude.message}
                </p>
              )}
            </div>
          </div>

          {/* Total Capacity */}
          <div>
            <Label htmlFor="wh-capacity" className="text-sm">
              Total Capacity
            </Label>
            <Input
              id="wh-capacity"
              type="number"
              min={1}
              {...register("total_capacity")}
              disabled={isSubmitting}
              placeholder="e.g. 5000"
              className="mt-1"
            />
            {errors.total_capacity && (
              <p className="text-red-500 text-xs mt-1">
                {errors.total_capacity.message}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setIsOpen(false);
                reset();
              }}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Register"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
