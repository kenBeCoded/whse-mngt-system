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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { POLineItem } from "@/services/purchaseOrderService";

interface ReceiveItemsModalProps {
  lineItems: POLineItem[];
  onReceive: (
    items: Array<{
      po_line_id: number;
      item_id: number;
      quantity_expected: number;
      quantity_received: number;
    }>
  ) => Promise<void>;
}

export function ReceiveItemsModal({
  lineItems,
  onReceive,
}: ReceiveItemsModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receivedQtys, setReceivedQtys] = useState<Record<number, number>>({});

  // Initialize with expected quantities when opening
  const handleOpen = (open: boolean) => {
    if (open) {
      const initial: Record<number, number> = {};
      lineItems.forEach((li) => {
        initial[li.id] = li.quantity_ordered;
      });
      setReceivedQtys(initial);
    }
    setIsOpen(open);
  };

  const handleQtyChange = (lineId: number, value: number) => {
    setReceivedQtys((prev) => ({ ...prev, [lineId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const items = lineItems.map((li) => ({
        po_line_id: li.id,
        item_id: li.item_id,
        quantity_expected: li.quantity_ordered,
        quantity_received: receivedQtys[li.id] ?? li.quantity_ordered,
      }));
      await onReceive(items);
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to receive items:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate all quantities
  const isValid = lineItems.every((li) => {
    const qty = receivedQtys[li.id] ?? 0;
    return qty > 0 && qty <= li.quantity_ordered;
  });

  return (
    <Dialog open={isOpen} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Receive Items</Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>RECEIVE ITEMS</DialogTitle>
          <DialogDescription>
            Enter the quantity received for each item. The received quantity
            must be between 1 and the ordered quantity.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="w-[120px]">Ordered</TableHead>
                  <TableHead className="w-[140px]">Received</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lineItems.map((li) => {
                  const qty = receivedQtys[li.id] ?? 0;
                  const isError = qty <= 0 || qty > li.quantity_ordered;

                  return (
                    <TableRow key={li.id}>
                      <TableCell className="font-medium">
                        {li.item_name}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{li.sku}</span>
                      </TableCell>
                      <TableCell className="font-mono">
                        {li.quantity_ordered}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Input
                            type="number"
                            min={1}
                            max={li.quantity_ordered}
                            value={qty}
                            onChange={(e) =>
                              handleQtyChange(li.id, Number(e.target.value))
                            }
                            disabled={isSubmitting}
                            className={isError ? "border-red-500" : ""}
                          />
                          {isError && (
                            <p className="text-red-500 text-xs mt-1">
                              Must be 1–{li.quantity_ordered}
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? "Receiving..." : "Confirm Receipt"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
