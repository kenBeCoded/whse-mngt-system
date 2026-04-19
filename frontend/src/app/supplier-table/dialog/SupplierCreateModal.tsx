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

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required"),
  email: z.string().email("Invalid email address"),
  address: z.string().optional(),
});

type SupplierFormData = z.infer<typeof supplierSchema>;

interface SupplierCreateModalProps {
  onCreate: (data: SupplierFormData) => void;
}

export const SupplierCreateModal = ({ onCreate }: SupplierCreateModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupplierFormData>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      email: "",
      address: "",
    },
  });

  const onSubmit = async (data: SupplierFormData) => {
    try {
      await onCreate(data);
      setIsOpen(false);
      reset();
    } catch (error) {
      console.error("Failed to create supplier:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="ml-2">Create Supplier</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>CREATE NEW SUPPLIER</DialogTitle>
          <DialogDescription>
            Enter supplier information to register a new supplier. Click save to
            create the supplier.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4 py-4">
            {/* Supplier Name */}
            <div>
              <Label htmlFor="supplier-name" className="text-sm">
                Supplier Name
              </Label>
              <Input
                id="supplier-name"
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
              <Label htmlFor="supplier-email" className="text-sm">
                Email
              </Label>
              <Input
                id="supplier-email"
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
              <Label htmlFor="supplier-address" className="text-sm">
                Address
              </Label>
              <Input
                id="supplier-address"
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
              {isSubmitting ? "Creating..." : "Create Supplier"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
