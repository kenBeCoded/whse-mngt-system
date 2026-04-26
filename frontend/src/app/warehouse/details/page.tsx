import { useEffect, useState } from "react";
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
import {
  warehouseService,
  type Warehouse,
  type WarehouseLocation,
} from "@/services/warehouseService";

export function WarehouseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const warehouseId = Number(id);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [unallocated, setUnallocated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [wh, locs, unalloc] = await Promise.all([
          warehouseService.getById(warehouseId),
          warehouseService.getLocations(warehouseId),
          warehouseService.getUnallocated(warehouseId),
        ]);
        setWarehouse(wh);
        setLocations(locs);
        setUnallocated(unalloc);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load warehouse details";
        setError(errorMessage);
        console.error("Error loading warehouse details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (warehouseId) {
      loadData();
    }
  }, [warehouseId]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading warehouse details...</div>
        </div>
      </div>
    );
  }

  if (!warehouse) {
    return (
      <div className="container mx-auto py-10">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Warehouse not found.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/admin/warehouses")}
          >
            ← Back to Warehouses
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 max-w-5xl space-y-6">
      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <div className="flex justify-between items-center">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => setError(null)}
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
                <span>{warehouse.name}</span>
                <Badge
                  variant={warehouse.is_active ? "default" : "destructive"}
                >
                  {warehouse.is_active ? "Active" : "Inactive"}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1 font-mono text-xs">
                {warehouse.code}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/admin/warehouses")}
            >
              ← Back
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Address</p>
              <p className="font-medium">{warehouse.address}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Total Capacity</p>
              <p className="font-mono font-medium">
                {Number(warehouse.total_capacity).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Active Bins</p>
              <p className="font-mono font-medium">
                {warehouse.active_bins ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Coordinates</p>
              <p className="font-mono font-medium text-xs">
                {warehouse.latitude && warehouse.longitude
                  ? `${Number(warehouse.latitude).toFixed(4)}, ${Number(warehouse.longitude).toFixed(4)}`
                  : "—"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Locations Card ────────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Locations</CardTitle>
          <CardDescription>
            Zones, rows, aisles, and bays defined under this warehouse.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Zone</TableHead>
                  <TableHead>Row</TableHead>
                  <TableHead>Aisle</TableHead>
                  <TableHead>Bay</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-mono text-xs">
                        #{loc.id}
                      </TableCell>
                      <TableCell className="font-medium">{loc.zone}</TableCell>
                      <TableCell>{loc.row}</TableCell>
                      <TableCell>{loc.aisle}</TableCell>
                      <TableCell>{loc.bay}</TableCell>
                      <TableCell>
                        <Badge
                          variant={loc.is_active ? "default" : "destructive"}
                          className="text-xs"
                        >
                          {loc.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center text-muted-foreground h-16"
                    >
                      No locations found for this warehouse.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* ── Unallocated Assets Card ───────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unallocated Assets</CardTitle>
          <CardDescription>
            Items received at this warehouse that have not yet been assigned to a bin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item Name</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead className="text-right">Quantity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Received At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {unallocated.length > 0 ? (
                  unallocated.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">
                        {item.item_name}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-xs">{item.sku}</span>
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {item.quantity}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {item.allocation_status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {item.received_at
                          ? new Date(item.received_at).toLocaleString()
                          : "—"}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center text-muted-foreground h-16"
                    >
                      No unallocated assets.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
