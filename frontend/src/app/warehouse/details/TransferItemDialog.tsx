import { useState, useMemo } from "react";
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
import { Progress } from "@/components/ui/progress";
import type { WarehouseBin } from "@/services/warehouseService";
import { ArrowRight, Package, RefreshCw, CheckCircle2 } from "lucide-react";

interface TransferItemRow {
  id: number;
  item_id: string | number;
  name: string;
  bin_id: number;
  quantity: number;
  [key: string]: any;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  row: TransferItemRow | null;
  bins: WarehouseBin[];
  onSubmit: (data: {
    item_id: number;
    from_bin_id: number;
    to_bin_id: number;
    quantity: number;
  }) => Promise<void>;
}

export function TransferItemDialog({
  open,
  onOpenChange,
  row,
  bins,
  onSubmit,
}: Props) {
  const [sourceBinId, setSourceBinId] = useState<string>("");
  const [destBinId, setDestBinId] = useState<string>("");
  const [quantity, setQuantity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Reset form when dialog opens with new row
  const handleOpenChange = (val: boolean) => {
    if (val && row) {
      setSourceBinId(String(row.bin_id));
      setDestBinId("");
      setQuantity("");
      setSuccess(false);
    }
    onOpenChange(val);
  };

  const sourceBin = useMemo(
    () => bins.find((b) => b.id === parseInt(sourceBinId)),
    [bins, sourceBinId]
  );
  const destBin = useMemo(
    () => bins.find((b) => b.id === parseInt(destBinId)),
    [bins, destBinId]
  );

  const qty = parseInt(quantity) || 0;
  const isSameBin = sourceBinId && destBinId && sourceBinId === destBinId;
  const hasEnoughSpace =
    destBin && qty > 0
      ? destBin.capacity - destBin.current_occupancy >= qty
      : true;
  const isValid =
    sourceBinId &&
    destBinId &&
    qty > 0 &&
    !isSameBin &&
    hasEnoughSpace &&
    qty <= (row?.quantity || 0);

  const handleTransfer = async () => {
    if (!isValid || !row) return;
    setIsSubmitting(true);
    try {
      await onSubmit({
        item_id: typeof row.item_id === "string" ? parseInt(row.item_id) : row.item_id,
        from_bin_id: parseInt(sourceBinId),
        to_bin_id: parseInt(destBinId),
        quantity: qty,
      });
      setSuccess(true);
      setTimeout(() => {
        onOpenChange(false);
        setSuccess(false);
      }, 1500);
    } catch (err) {
      console.error("Transfer failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!row) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-extrabold uppercase tracking-tight">
            <RefreshCw className="h-5 w-5 text-amber-500" /> Transfer Item
          </DialogTitle>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-lg font-extrabold text-foreground mb-1">
              Transfer Complete!
            </p>
            <p className="text-sm text-muted-foreground">
              Items have been moved successfully.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Item reference banner */}
            <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl px-4 py-3">
              <div className="w-9 h-9 bg-white dark:bg-amber-900/50 rounded-lg flex items-center justify-center shadow-sm border border-border flex-shrink-0">
                <Package size={16} className="text-amber-500" />
              </div>
              <div>
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-[0.15em]">
                  Moving Item
                </p>
                <p className="text-sm font-extrabold text-foreground">
                  [{row.item_id}] {row.name}
                </p>
              </div>
              <div className="ml-auto text-right">
                <p className="text-[9px] font-extrabold text-muted-foreground uppercase">
                  Total Qty
                </p>
                <p className="text-sm font-extrabold text-amber-600">
                  {row.quantity} units
                </p>
              </div>
            </div>

            {/* Visual transfer flow */}
            <div className="flex items-start gap-3">
              {/* Source Bin */}
              <div className="flex-1 space-y-2">
                <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                  From Bin
                </Label>
                <Select value={sourceBinId} onValueChange={setSourceBinId}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Source bin --" />
                  </SelectTrigger>
                  <SelectContent>
                    {bins
                      .filter((b) => b.is_active)
                      .map((b) => (
                        <SelectItem key={b.id} value={String(b.id)}>
                          {b.bin_code} ({b.current_occupancy}/{b.capacity})
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {sourceBin && (
                  <div className="px-3 py-2 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase">
                        Occupancy
                      </span>
                      <span className="text-[10px] font-extrabold text-foreground">
                        {sourceBin.current_occupancy}/{sourceBin.capacity}
                      </span>
                    </div>
                    <Progress
                      value={
                        (sourceBin.current_occupancy / sourceBin.capacity) * 100
                      }
                      className="h-1.5 bg-muted"
                    />
                  </div>
                )}
              </div>

              {/* Arrow */}
              <div className="flex-shrink-0 mt-7">
                <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                  <ArrowRight size={18} className="text-primary-foreground" />
                </div>
              </div>

              {/* Destination Bin */}
              <div className="flex-1 space-y-2">
                <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                  To Bin
                </Label>
                <Select value={destBinId} onValueChange={setDestBinId}>
                  <SelectTrigger>
                    <SelectValue placeholder="-- Destination bin --" />
                  </SelectTrigger>
                  <SelectContent>
                    {bins
                      .filter(
                        (b) =>
                          b.is_active && b.id !== parseInt(sourceBinId || "0")
                      )
                      .map((b) => {
                        const available = b.capacity - b.current_occupancy;
                        return (
                          <SelectItem
                            key={b.id}
                            value={String(b.id)}
                            disabled={available <= 0}
                          >
                            {b.bin_code} (Avail: {available})
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
                {destBin && (
                  <div className="px-3 py-2 bg-muted/50 rounded-lg space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-extrabold text-muted-foreground uppercase">
                        Occupancy
                      </span>
                      <span className="text-[10px] font-extrabold text-foreground">
                        {destBin.current_occupancy}/{destBin.capacity}
                      </span>
                    </div>
                    <Progress
                      value={
                        (destBin.current_occupancy / destBin.capacity) * 100
                      }
                      className="h-1.5 bg-muted"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">
                Quantity to Transfer
              </Label>
              <div className="relative">
                <Input
                  type="number"
                  placeholder="Enter quantity..."
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  max={row.quantity}
                  min={1}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-extrabold text-muted-foreground uppercase">
                  / {row.quantity} max
                </span>
              </div>
              {destBin && qty > 0 && (
                <p className="text-[11px] font-semibold">
                  {hasEnoughSpace ? (
                    <span className="text-emerald-600">
                      ✓ Destination has enough space
                    </span>
                  ) : (
                    <span className="text-destructive">
                      ⚠ Not enough space in destination bin
                    </span>
                  )}
                </p>
              )}
            </div>

            {/* Same-bin warning */}
            {isSameBin && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-xs font-semibold text-destructive">
                Source and destination bins cannot be the same.
              </div>
            )}

            <Button
              onClick={handleTransfer}
              disabled={!isValid || isSubmitting}
              className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold uppercase tracking-widest"
              size="lg"
            >
              <RefreshCw size={18} className="mr-2" />
              {isSubmitting ? "Transferring..." : "Confirm Transfer"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
