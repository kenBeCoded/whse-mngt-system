import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import type { WarehouseBin } from "@/services/warehouseService";
import { ArrowRightCircle, FileText, User } from "lucide-react";

interface UnallocatedRow {
  id?: number;
  item_id: string | number;
  item_name?: string;
  name?: string;
  sku?: string;
  category?: string;
  quantity: number;
  po_reference?: string;
  supplier?: string;
  received_at?: string;
  received_date?: string;
  source?: string;
  allocation_status?: string;
  [key: string]: any;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: UnallocatedRow | null;
  bins: WarehouseBin[];
  onSubmit: (data: {
    item_id: number;
    bin_id: number;
    quantity: number;
    source_location_id?: number;
  }) => Promise<void>;
}

export function AllocateItemDialog({
  open,
  onOpenChange,
  row,
  bins,
  onSubmit,
}: Props) {
  const [binId, setBinId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenChange = (val: boolean) => {
    if (val && row) {
      setBinId("");
      setQuantity(String(row.quantity || ""));
    }
    onOpenChange(val);
  };

  const handleAllocate = async () => {
    if (!row || !binId || !quantity) return;
    setIsSubmitting(true);
    try {
      const itemId =
        typeof row.item_id === "string" ? parseInt(row.item_id) : row.item_id;
      await onSubmit({
        item_id: itemId,
        bin_id: parseInt(binId),
        quantity: parseInt(quantity),
        source_location_id: row.id,
      });
      onOpenChange(false);
    } catch (err) {
      console.error("Allocation failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!row) return null;

  const displayName = row.item_name || row.name || "Unknown Item";
  const displaySku = row.sku || row.item_id;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight">
            <ArrowRightCircle className="h-5 w-5 text-emerald-500" />
            Allocate Received Item
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Item detail banner */}
          <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="text-[9px] font-extrabold text-primary/60 uppercase tracking-widest">
                  Item Details
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  [{displaySku}] {displayName}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-extrabold text-primary/60 uppercase tracking-widest">
                  Total Qty
                </p>
                <p className="text-sm font-extrabold text-primary">
                  {row.quantity} units
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-primary/10">
              <div>
                <label className="text-[9px] font-extrabold text-muted-foreground uppercase block mb-0.5">
                  PO Reference
                </label>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                  <FileText size={12} className="text-primary/60" />
                  {row.po_reference || "N/A"}
                </div>
              </div>
              <div>
                <label className="text-[9px] font-extrabold text-muted-foreground uppercase block mb-0.5">
                  Supplier
                </label>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                  <User size={12} className="text-primary/60" />
                  {row.supplier || "N/A"}
                </div>
              </div>
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            <div>
              <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Assign to Bin
              </Label>
              <Select value={binId} onValueChange={setBinId}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="-- Select available bin --" />
                </SelectTrigger>
                <SelectContent>
                  {bins
                    .filter((b) => b.is_active)
                    .map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.bin_code} (Cap: {b.capacity}, Avail:{" "}
                        {b.capacity - b.current_occupancy})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Quantity to Move
              </Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min={1}
                max={row.quantity}
                className="mt-1.5"
              />
            </div>
          </div>

          <Button
            onClick={handleAllocate}
            disabled={!binId || !quantity || isSubmitting}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold uppercase tracking-widest"
            size="lg"
          >
            {isSubmitting ? (
              "Allocating..."
            ) : (
              <>
                Complete Allocation{" "}
                <ArrowRightCircle size={18} className="ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
