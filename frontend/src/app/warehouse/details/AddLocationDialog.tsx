import { useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { MapPin, Plus } from "lucide-react";

const schema = z.object({
  zone: z.string().min(1, "Zone is required"),
  row: z.string().min(1, "Row is required"),
  aisle: z.string().min(1, "Aisle is required"),
  bay: z.string().min(1, "Bay is required"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  onSubmit: (data: FormData) => Promise<void>;
}

export function AddLocationDialog({ onSubmit }: Props) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { zone: "", row: "", aisle: "", bay: "" },
  });

  const handle = async (data: FormData) => {
    await onSubmit(data);
    setOpen(false);
    reset();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Plus className="h-3.5 w-3.5" /> Add Location
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[460px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-4 w-4" /> Add Location
          </DialogTitle>
          <DialogDescription>Define a new zone/row/aisle/bay in this warehouse.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(handle)} className="space-y-4 pt-2">
          <div className="grid grid-cols-2 gap-3">
            {(["zone", "row", "aisle", "bay"] as const).map((f) => (
              <div key={f}>
                <Label htmlFor={`loc-${f}`} className="text-xs capitalize">{f}</Label>
                <Input id={`loc-${f}`} {...register(f)} disabled={isSubmitting} placeholder={`e.g. ${f === "zone" ? "A" : f === "row" ? "R1" : f === "aisle" ? "A1" : "B1"}`} className="mt-1" />
                {errors[f] && <p className="text-red-500 text-xs mt-1">{errors[f]?.message}</p>}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button variant="outline" type="button" onClick={() => { setOpen(false); reset(); }} disabled={isSubmitting}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Adding..." : "Add Location"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
