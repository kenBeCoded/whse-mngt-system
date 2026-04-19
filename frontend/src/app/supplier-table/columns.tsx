import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { SupplierDetailsModal } from "./dialog/SupplierDetailsModal";
import type { Supplier } from "@/services/supplierService";

// Table meta type for passing callbacks through the table
type TableMeta = {
  onSave?: (
    id: number,
    data: {
      name?: string;
      email?: string;
      address?: string;
      updated_by: number;
    },
  ) => void;
  onDeactivate?: (id: number) => void;
};

export const supplierColumns: ColumnDef<Supplier>[] = [
  {
    id: "ID",
    accessorKey: "id",
    header: "ID",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        #{row.original.id}
      </span>
    ),
  },
  {
    id: "NAME",
    accessorKey: "name",
    header: "Supplier Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "EMAIL",
    accessorKey: "email",
    header: "Email",
  },
  {
    id: "ADDRESS",
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.address || "—"}
      </span>
    ),
  },
  {
    id: "STATUS",
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.is_active ? "default" : "secondary"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </Badge>
    ),
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
    cell: ({ row, table }) => {
      const supplier = row.original;
      const meta = table.options.meta as TableMeta;
      const onSave = meta?.onSave ?? (() => {});
      const onDeactivate = meta?.onDeactivate ?? (() => {});

      return (
        <div className="flex gap-2">
          <SupplierDetailsModal
            supplier={supplier}
            onSave={onSave}
            onDeactivate={onDeactivate}
          />
        </div>
      );
    },
  },
];
