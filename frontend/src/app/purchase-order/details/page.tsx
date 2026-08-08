import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usePurchaseOrderStore } from "../../../store/purchase-order-store";
import { useAuth } from "@/hooks/useAuth";
import { StatusUpdateModal } from "../dialog/StatusUpdateModal";
import { ReceiveItemsModal } from "../dialog/ReceiveItemsModal";
import type { POStatus } from "@/services/purchaseOrderService";

// ─── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<
  POStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  request: "outline",
  pending: "secondary",
  approved: "default",
  preparing: "secondary",
  shipped: "default",
  received: "default",
  cancelled: "destructive",
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

// ─── Component ─────────────────────────────────────────────────────────────────

export function PurchaseOrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    currentPO,
    statusHistory,
    isDetailLoading,
    error,
    fetchPODetail,
    fetchStatusHistory,
    updatePOStatus,
    receivePO,
    clearDetail,
    clearError,
  } = usePurchaseOrderStore();

  const poId = Number(id);

  useEffect(() => {
    if (poId) {
      fetchPODetail(poId);
      fetchStatusHistory(poId);
    }
    return () => clearDetail();
  }, [poId, fetchPODetail, fetchStatusHistory, clearDetail]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleStatusUpdate = async (
    toStatus: POStatus,
    remarks: string
  ) => {
    await updatePOStatus(poId, {
      to_status: toStatus,
      changed_by: Number(user?.id) || 0,
      remarks: remarks || undefined,
    });
  };

  const handleReceive = async (
    items: Array<{
      po_line_id: number;
      item_id: number;
      quantity_expected: number;
      quantity_received: number;
    }>
  ) => {
    await receivePO(poId, {
      received_by: Number(user?.id) || 0,
      items,
    });
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (isDetailLoading && !currentPO) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading purchase order details...</div>
        </div>
      </div>
    );
  }

  if (!currentPO) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Purchase order not found.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/admin/purchase-orders")}
          >
            ← Back to Purchase Orders
          </Button>
        </div>
      </div>
    );
  }

  const { po, lines } = currentPO;

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={clearError}
              className="text-red-600 hover:text-red-800 font-medium"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Header Card ───────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-3">
                <span className="font-mono">{po.po_number}</span>
                <Badge variant={STATUS_VARIANT[po.status]}>
                  {STATUS_LABEL[po.status]}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Purchase Order Details
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Status update button (hidden for employee role or terminal states) */}
              {user?.role?.toLowerCase() !== "employee" && (
                <StatusUpdateModal
                  currentStatus={po.status}
                  onUpdate={handleStatusUpdate}
                />
              )}
              {/* Receive button (only when shipped) */}
              {po.status === "shipped" && (
                <ReceiveItemsModal
                  lineItems={lines}
                  onReceive={handleReceive}
                />
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin/purchase-orders")}
              >
                ← Back
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Supplier Name</p>
              <p className="font-medium">{po.supplier_name || `#${po.supplier_id}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Warehouse Name</p>
              <p className="font-medium">{po.warehouse_name || `#${po.warehouse_id}`}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Amount</p>
              <p className="font-mono font-medium">
                ₱
                {Number(po.total_amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Created At</p>
              <p className="font-medium">
                {new Date(po.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Line Items Card ───────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Line Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Qty Ordered</TableHead>
                  <TableHead className="text-right">Qty Received</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Subtotal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lines.map((line) => (
                  <TableRow key={line.id}>
                    <TableCell className="font-medium">
                      {line.item_name}
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-xs">{line.sku}</span>
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.quantity_ordered}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      {line.quantity_received ?? "—"}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₱{Number(line.unit_price).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-mono">
                      ₱{Number(line.subtotal).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
                {lines.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground h-16"
                    >
                      No line items found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Status History Card ───────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Status History</CardTitle>
        </CardHeader>
        <CardContent>
          {statusHistory.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No status history available.
            </p>
          ) : (
            <div className="space-y-3">
              {[...statusHistory]
                .sort((a, b) => new Date(b.changed_at).getTime() - new Date(a.changed_at).getTime())
                .map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-3 border-l-2 border-muted pl-4 py-1"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 text-sm">
                      {entry.from_status && (
                        <>
                          <Badge variant="outline" className="text-xs">
                            {STATUS_LABEL[entry.from_status]}
                          </Badge>
                          <span className="text-muted-foreground">→</span>
                        </>
                      )}
                      <Badge
                        variant={STATUS_VARIANT[entry.to_status]}
                        className="text-xs"
                      >
                        {STATUS_LABEL[entry.to_status]}
                      </Badge>
                    </div>
                    {entry.remarks && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {entry.remarks}
                      </p>
                    )}
                  </div>
                  <div className="text-right text-xs text-muted-foreground whitespace-nowrap">
                    <p>{entry.changed_by}</p>
                    <p>{new Date(entry.changed_at).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
