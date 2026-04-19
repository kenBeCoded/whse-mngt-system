import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { InventoryDetailsModal } from "./dialog/InventoryDetailsModal";
import type { InventoryItem } from "@/services/inventoryService";

// Table meta type for passing callbacks through the table
type TableMeta = {
  onSave?: (
    id: number,
    data: Omit<
      InventoryItem,
      "id" | "is_active" | "created_by" | "created_at" | "updated_at"
    >,
  ) => void;
  onDeactivate?: (id: number) => void;
};

export const inventoryColumns: ColumnDef<InventoryItem>[] = [
  {
    id: "ITEM NO",
    accessorKey: "item_number",
    header: "Item No.",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.item_number}</span>
    ),
  },
  {
    id: "SKU",
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs">{row.original.sku}</span>
    ),
  },
  {
    id: "NAME",
    accessorKey: "name",
    header: "Item Name",
    cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
  },
  {
    id: "CATEGORY",
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-muted-foreground">
        {row.original.category || "—"}
      </span>
    ),
  },
  {
    id: "UOM",
    accessorKey: "unit_of_measure",
    header: "UoM",
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.unit_of_measure}</Badge>
    ),
  },
  {
    id: "UNIT PRICE",
    accessorKey: "default_unit_price",
    header: "Unit Price",
    cell: ({ row }) => {
      const price = row.original.default_unit_price;
      return (
        <span className="font-mono">
          {price != null ? `₱${Number(price).toFixed(2)}` : "—"}
        </span>
      );
    },
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
      const item = row.original;
      const meta = table.options.meta as TableMeta;
      const onSave = meta?.onSave ?? (() => {});
      const onDeactivate = meta?.onDeactivate ?? (() => {});

      return (
        <div className="flex gap-2">
          <InventoryDetailsModal
            item={item}
            onSave={onSave}
            onDeactivate={onDeactivate}
          />
        </div>
      );
    },
  },
];
