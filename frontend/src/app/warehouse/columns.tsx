import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import type { Warehouse } from "@/services/warehouseService";

// Wrapper component for the View action (uses hook)
function ViewActionButton({ warehouseId }: { warehouseId: number }) {
  const navigate = useNavigate();
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate(`/admin/warehouses/${warehouseId}`)}
    >
      View
    </Button>
  );
}

export const warehouseColumns: ColumnDef<Warehouse>[] = [
  {
    id: "CODE",
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium">
        {row.original.code}
      </span>
    ),
  },
  {
    id: "NAME",
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <span className="font-medium">{row.original.name}</span>
    ),
  },
  {
    id: "ADDRESS",
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground max-w-[250px] truncate block">
        {row.original.address}
      </span>
    ),
  },
  {
    id: "CAPACITY",
    accessorKey: "total_capacity",
    header: "Total Capacity",
    cell: ({ row }) => (
      <span className="font-mono">
        {Number(row.original.total_capacity).toLocaleString()}
      </span>
    ),
  },
  {
    id: "ACTIVE BINS",
    accessorKey: "active_bins",
    header: "Active Bins",
    cell: ({ row }) => (
      <span className="font-mono">
        {row.original.active_bins ?? "—"}
      </span>
    ),
  },
  {
    id: "STATUS",
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "destructive"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "COORDINATES",
    header: "Coordinates",
    cell: ({ row }) => {
      const { latitude, longitude } = row.original;
      if (!latitude && !longitude) {
        return <span className="text-xs text-muted-foreground">—</span>;
      }
      return (
        <span className="font-mono text-xs">
          {Number(latitude).toFixed(4)}, {Number(longitude).toFixed(4)}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ViewActionButton warehouseId={row.original.id} />,
  },
];
