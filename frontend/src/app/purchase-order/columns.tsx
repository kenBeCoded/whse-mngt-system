import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { PurchaseOrder, POStatus } from "@/services/purchaseOrderService";

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

// Wrapper component for the View action button (needs useNavigate hook)
function ViewActionButton({ poId }: { poId: number }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(`/admin/purchase-orders/${poId}`)}
    >
      View
    </Button>
  );
}

export const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = [
  {
    id: "PO NUMBER",
    accessorKey: "po_number",
    header: "PO Number",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        {row.original.po_number}
      </span>
    ),
  },
  {
    id: "SUPPLIER",
    accessorKey: "supplier_id",
    header: "Supplier ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.original.supplier_id}
      </span>
    ),
  },
  {
    id: "WAREHOUSE",
    accessorKey: "warehouse_id",
    header: "Warehouse ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.original.warehouse_id}
      </span>
    ),
  },
  {
    id: "STATUS",
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={STATUS_VARIANT[status]}>
          {STATUS_LABEL[status]}
        </Badge>
      );
    },
  },
  {
    id: "TOTAL",
    accessorKey: "total_amount",
    header: "Total Amount",
    cell: ({ row }) => (
      <span className="font-mono">
        ₱{Number(row.original.total_amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </span>
    ),
  },
  {
    id: "CREATED AT",
    accessorKey: "created_at",
    header: "Created At",
    accessorFn: (row) => new Date(row.created_at).toLocaleString(),
  },
  {
    id: "LAST UPDATE",
    accessorKey: "updated_at",
    header: "Last Updated",
    accessorFn: (row) => new Date(row.updated_at).toLocaleString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ViewActionButton poId={row.original.id} />,
  },
];
