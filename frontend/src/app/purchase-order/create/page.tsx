import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { supplierService, type Supplier } from "@/services/supplierService";
import {
  inventoryService,
  type InventoryItem,
} from "@/services/inventoryService";
import {
  warehouseService,
  type Warehouse,
} from "@/services/warehouseService";

// ─── Schema ────────────────────────────────────────────────────────────────────

const lineItemSchema = z.object({
  item_id: z.number().min(1, "Select an item"),
  item_name: z.string().optional(),
  quantity_ordered: z.number().min(1, "Qty must be ≥ 1"),
  unit_price: z.number().min(0, "Price must be ≥ 0"),
});

const poFormSchema = z.object({
  supplier_id: z.number().min(1, "Select a supplier"),
  warehouse_id: z.number().min(1, "Select a target warehouse"),
  line_items: z.array(lineItemSchema).min(1, "Add at least one line item"),
});

type POFormData = z.infer<typeof poFormSchema>;

// ─── Component ─────────────────────────────────────────────────────────────────

export function PurchaseOrderFormPage() {
  const navigate = useNavigate();
  const { createPurchaseOrder } = usePurchaseOrderStore();
  const { user } = useAuth();

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loadingRefs, setLoadingRefs] = useState(true);

  // Load reference data
  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [s, i, w] = await Promise.all([
          supplierService.getAll(),
          inventoryService.getAll(),
          warehouseService.getAll(),
        ]);
        setSuppliers(s);
        setItems(i);
        // Only show active warehouses
        setWarehouses(w.filter((wh) => wh.is_active));
      } catch (error) {
        console.error("Failed to load reference data:", error);
      } finally {
        setLoadingRefs(false);
      }
    };
    loadRefs();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<POFormData>({
    resolver: zodResolver(poFormSchema),
    defaultValues: {
      supplier_id: 0,
      warehouse_id: 0,
      line_items: [{ item_id: 0, item_name: "", quantity_ordered: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "line_items",
  });

  const watchLineItems = watch("line_items");

  const totalAmount = watchLineItems.reduce(
    (sum, item) => sum + (item.quantity_ordered || 0) * (item.unit_price || 0),
    0
  );

  const onSubmit = async (data: POFormData) => {
    try {
      const payload = {
        supplier_id: data.supplier_id,
        warehouse_id: data.warehouse_id,
        total_amount: totalAmount,
        created_by: Number(user?.id) || 0,
        line_items: data.line_items.map((li) => ({
          item_id: li.item_id,
          quantity_ordered: li.quantity_ordered,
          unit_price: li.unit_price,
        })),
      };
      const newPO = await createPurchaseOrder(payload);
      // Redirect to the new PO's detail page
      navigate(`/admin/purchase-orders/${newPO.id}`);
    } catch (error) {
      console.error("Failed to create PO:", error);
    }
  };

  if (loadingRefs) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>NEW PURCHASE ORDER REQUEST</CardTitle>
          <CardDescription>
            Fill out the form to create a new purchase order. Select a supplier,
            warehouse, and add line items.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-6">
              {/* ── Header fields ─────────────────────────────────────────── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Supplier */}
                <div>
                  <Label htmlFor="po-supplier" className="text-sm">
                    Supplier
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("supplier_id", Number(value))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((s) => (
                        <SelectItem key={s.id} value={String(s.id)}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.supplier_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.supplier_id.message}
                    </p>
                  )}
                </div>

                {/* Target Warehouse Allocation */}
                <div>
                  <Label htmlFor="po-warehouse" className="text-sm">
                    Target Warehouse Allocation
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      setValue("warehouse_id", Number(value))
                    }
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="w-full mt-1">
                      <SelectValue placeholder="Select a warehouse" />
                    </SelectTrigger>
                    <SelectContent>
                      {warehouses.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.warehouse_id && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.warehouse_id.message}
                    </p>
                  )}
                </div>
              </div>

              {/* ── Line Items ────────────────────────────────────────────── */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-sm font-medium">Line Items</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        item_id: 0,
                        item_name: "",
                        quantity_ordered: 1,
                        unit_price: 0,
                      })
                    }
                    disabled={isSubmitting}
                  >
                    + Add Item
                  </Button>
                </div>

                {errors.line_items?.root && (
                  <p className="text-red-500 text-xs mb-2">
                    {errors.line_items.root.message}
                  </p>
                )}

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Item</TableHead>
                        <TableHead className="w-[100px]">Qty</TableHead>
                        <TableHead className="w-[130px]">Unit Price</TableHead>
                        <TableHead className="w-[130px]">Subtotal</TableHead>
                        <TableHead className="w-[60px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const qty = watchLineItems?.[index]?.quantity_ordered || 0;
                        const price = watchLineItems?.[index]?.unit_price || 0;
                        const subtotal = qty * price;

                        return (
                          <TableRow key={field.id}>
                            <TableCell>
                              <Select
                                onValueChange={(value) => {
                                  const itemId = Number(value);
                                  const item = items.find(
                                    (i) => i.id === itemId
                                  );
                                  setValue(
                                    `line_items.${index}.item_id`,
                                    itemId
                                  );
                                  setValue(
                                    `line_items.${index}.item_name`,
                                    item?.name || ""
                                  );
                                  if (item?.default_unit_price) {
                                    setValue(
                                      `line_items.${index}.unit_price`,
                                      Number(item.default_unit_price)
                                    );
                                  }
                                }}
                                disabled={isSubmitting}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select item" />
                                </SelectTrigger>
                                <SelectContent>
                                  {items.map((item) => (
                                    <SelectItem
                                      key={item.id}
                                      value={String(item.id)}
                                    >
                                      {item.sku} — {item.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {errors.line_items?.[index]?.item_id && (
                                <p className="text-red-500 text-xs mt-1">
                                  {errors.line_items[index].item_id?.message}
                                </p>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                min={1}
                                {...register(
                                  `line_items.${index}.quantity_ordered`,
                                  { valueAsNumber: true }
                                )}
                                disabled={isSubmitting}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                step="0.01"
                                min={0}
                                {...register(
                                  `line_items.${index}.unit_price`,
                                  { valueAsNumber: true }
                                )}
                                disabled={isSubmitting}
                                className="w-full"
                              />
                            </TableCell>
                            <TableCell>
                              <span className="font-mono text-sm">
                                ₱{subtotal.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}
                              </span>
                            </TableCell>
                            <TableCell>
                              {fields.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => remove(index)}
                                  disabled={isSubmitting}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  ✕
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Total */}
                <div className="flex justify-end mt-4 pr-2">
                  <div className="text-right">
                    <span className="text-sm text-muted-foreground mr-4">
                      Total Amount:
                    </span>
                    <span className="text-lg font-semibold font-mono">
                      ₱{totalAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              {/* ── Action buttons ────────────────────────────────────────── */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => navigate("/admin/purchase-orders")}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Submit Request"}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
