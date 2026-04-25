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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { POStatus } from "@/services/purchaseOrderService";

// Valid transitions (excluding "received" — handled by ReceiveItemsModal)
const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  request: ["pending", "cancelled"],
  pending: ["approved", "cancelled"],
  approved: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: [], // "received" handled separately via receive endpoint
  received: [],
  cancelled: [],
};

const STATUS_LABEL: Record<POStatus, string> = {
  request: "Requested",
  pending: "Pending",
  approved: "Approved",
  preparing: "Preparing",
  shipped: "Shipped",
  received: "Received",
  cancelled: "Cancelled",
};

interface StatusUpdateModalProps {
  currentStatus: POStatus;
  onUpdate: (toStatus: POStatus, remarks: string) => Promise<void>;
}

export function StatusUpdateModal({
  currentStatus,
  onUpdate,
}: StatusUpdateModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<POStatus | null>(null);
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleSubmit = async () => {
    if (!selectedStatus) return;
    setIsSubmitting(true);
    try {
      await onUpdate(selectedStatus, remarks);
      setIsOpen(false);
      setSelectedStatus(null);
      setRemarks("");
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (allowedTransitions.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Update Status
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[95vw] max-w-[425px] sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>UPDATE PO STATUS</DialogTitle>
          <DialogDescription>
            Current status:{" "}
            <span className="font-semibold">
              {STATUS_LABEL[currentStatus]}
            </span>
            . Select the next status for this purchase order.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Status options */}
          <div>
            <Label className="text-sm">New Status</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {allowedTransitions.map((status) => (
                <Button
                  key={status}
                  type="button"
                  variant={
                    selectedStatus === status
                      ? status === "cancelled"
                        ? "destructive"
                        : "default"
                      : "outline"
                  }
                  size="sm"
                  onClick={() => setSelectedStatus(status)}
                  disabled={isSubmitting}
                >
                  {STATUS_LABEL[status]}
                </Button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label htmlFor="status-remarks" className="text-sm">
              Remarks (optional)
            </Label>
            <Input
              id="status-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isSubmitting}
              placeholder="Enter any remarks..."
              className="mt-1"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => {
              setIsOpen(false);
              setSelectedStatus(null);
              setRemarks("");
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedStatus || isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
