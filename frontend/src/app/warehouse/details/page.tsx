import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
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
  type WarehouseBin,
} from "@/services/warehouseService";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { AddLocationDialog } from "./AddLocationDialog";
import { EditLocationDialog } from "./EditLocationDialog";
import { EditBinDialog } from "./EditBinDialog";
import { AddBinDialog } from "./AddBinDialog";
import { AssignItemDialog } from "./AssignItemDialog";
import { TransferItemDialog } from "./TransferItemDialog";
import { AllocateItemDialog } from "./AllocateItemDialog";
import {
  MapPin,
  Box,
  Package,
  Truck,
  Database,
  Search,
  Edit2,
  MoreHorizontal,
  Power,
  ToggleRight,
  RefreshCw,
  ArrowRightCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  FileText,
  User,
} from "lucide-react";

type TabId = "locations" | "bins" | "items" | "unallocated";

const TABS: { id: TabId; label: string; icon: any; desc: string }[] = [
  {
    id: "locations",
    label: "1. Locations",
    icon: MapPin,
    desc: "Zone/Row/Aisle",
  },
  { id: "bins", label: "2. Bins", icon: Box, desc: "Capacity & Codes" },
  {
    id: "items",
    label: "3. Assign Items",
    icon: Package,
    desc: "Inventory Levels",
  },
  {
    id: "unallocated",
    label: "4. Unallocated",
    icon: Truck,
    desc: "New Shipments",
  },
];

export function WarehouseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const isEmployee = user?.role?.toLowerCase() === "employee";
  const warehouseId = Number(id);

  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [locations, setLocations] = useState<WarehouseLocation[]>([]);
  const [bins, setBins] = useState<WarehouseBin[]>([]);
  const [itemLocations, setItemLocations] = useState<any[]>([]);
  const [unallocated, setUnallocated] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<TabId>("locations");
  const [searchQuery, setSearchQuery] = useState("");

  // Edit location dialog state
  const [editLocationOpen, setEditLocationOpen] = useState(false);
  const [editLocationRow, setEditLocationRow] =
    useState<WarehouseLocation | null>(null);

  // Edit bin dialog state
  const [editBinOpen, setEditBinOpen] = useState(false);
  const [editBinRow, setEditBinRow] = useState<WarehouseBin | null>(null);

  // Transfer dialog state
  const [transferOpen, setTransferOpen] = useState(false);
  const [transferRow, setTransferRow] = useState<any>(null);

  // Allocate dialog state
  const [allocateOpen, setAllocateOpen] = useState(false);
  const [allocateRow, setAllocateRow] = useState<any>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [wh, locs, binsData, unalloc, itemLocs] = await Promise.all([
        warehouseService.getById(warehouseId),
        warehouseService.getLocations(warehouseId),
        warehouseService.getBinsByWarehouse(warehouseId),
        warehouseService.getUnallocated(warehouseId),
        warehouseService.getItemLocations(warehouseId),
      ]);
      setWarehouse(wh);
      setLocations(locs);
      setBins(binsData);
      setUnallocated(unalloc);
      setItemLocations(itemLocs);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Failed to load warehouse details";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (warehouseId) loadData();
  }, [warehouseId]);

  // Computed values
  const usedCapacity = useMemo(
    () => bins.reduce((sum, b) => sum + b.current_occupancy, 0),
    [bins],
  );
  const totalCapacity = warehouse?.total_capacity || 1;
  const utilizationPercent = ((usedCapacity / totalCapacity) * 100).toFixed(1);

  const getLocationPath = (locId: number) => {
    const loc = locations.find((l) => l.id === locId);
    return loc
      ? `${loc.zone} > ${loc.row} > ${loc.aisle} > ${loc.bay}`
      : "Unknown";
  };

  const filteredData = useMemo(() => {
    const q = searchQuery.toLowerCase();
    let base: any[] = [];
    if (activeTab === "locations") base = locations;
    else if (activeTab === "bins") base = bins;
    else if (activeTab === "items") base = itemLocations;
    else if (activeTab === "unallocated") base = unallocated;

    if (!q) return base;
    return base.filter((item) => {
      const str = [
        item.zone,
        item.row,
        item.aisle,
        item.bay,
        item.bin_code,
        item.item_name,
        item.sku,
        item.category,
        item.current_bin,
        item.po_reference,
        item.supplier,
        item.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return str.includes(q);
    });
  }, [activeTab, searchQuery, locations, bins, itemLocations, unallocated]);

  // Handlers
  const userId = user?.id ? Number(user.id) : 1;

  const handleAddLocation = async (data: {
    zone: string;
    row: string;
    aisle: string;
    bay: string;
  }) => {
    await warehouseService.createLocation(warehouseId, {
      ...data,
      created_by: userId,
    });
    toast.success("Location created successfully");
    loadData();
  };

  const handleEditLocation = async (
    locationId: number,
    data: { zone: string; row: string; aisle: string; bay: string },
  ) => {
    try {
      await warehouseService.updateLocation(warehouseId, locationId, {
        ...data,
        updated_by: userId,
      });
      toast.success("Location updated successfully");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update location";
      toast.error(msg);
    }
  };

  const handleDeactivateLocation = async (locationId: number) => {
    try {
      await warehouseService.deactivateLocation(warehouseId, locationId);
      toast.success("Location deactivated");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to deactivate location";
      toast.error(msg);
    }
  };

  const handleReactivateLocation = async (locationId: number) => {
    try {
      await warehouseService.reactivateLocation(warehouseId, locationId);
      toast.success("Location reactivated");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reactivate location";
      toast.error(msg);
    }
  };

  const openEditLocation = (row: WarehouseLocation) => {
    setEditLocationRow(row);
    setEditLocationOpen(true);
  };

  const handleAddBin = async (data: {
    location_id: number;
    bin_code: string;
    capacity: number;
  }) => {
    try {
      await warehouseService.createBin(data.location_id, {
        bin_code: data.bin_code,
        capacity: data.capacity,
        created_by: userId,
      });
      toast.success("Bin created successfully");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create bin";
      toast.error(msg);
      throw err;
    }
  };

  const openEditBin = (bin: WarehouseBin) => {
    setEditBinRow(bin);
    setEditBinOpen(true);
  };

  const handleEditBin = async (
    binId: number,
    locationId: number,
    data: { bin_code: string; capacity: number },
  ) => {
    try {
      await warehouseService.updateBin(locationId, binId, {
        ...data,
        updated_by: userId,
      });
      toast.success("Bin updated successfully");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update bin";
      toast.error(msg);
    }
  };

  const handleDeactivateBin = async (bin: WarehouseBin) => {
    try {
      await warehouseService.deactivateBin(bin.location_id, bin.id, userId);
      toast.success("Bin deactivated");
      loadData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Cannot deactivate bin with active stock.",
      );
    }
  };

  const handleReactivateBin = async (bin: WarehouseBin) => {
    try {
      await warehouseService.reactivateBin(bin.location_id, bin.id, userId);
      toast.success("Bin reactivated");
      loadData();
    } catch (err: any) {
      toast.error(
        err?.response?.data?.error?.message ||
          err?.response?.data?.message ||
          "Failed to reactivate bin",
      );
    }
  };

  const handleAssignItem = async (data: {
    bin_id: number;
    item_id: number;
    quantity: number;
  }) => {
    try {
      await warehouseService.assignItem(data.bin_id, {
        item_id: data.item_id,
        quantity: data.quantity,
        assigned_by: userId,
      });
      toast.success("Item assigned to bin");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to assign item";
      toast.error(msg);
      throw err;
    }
  };

  const handleTransfer = async (data: {
    item_id: number;
    from_bin_id: number;
    to_bin_id: number;
    quantity: number;
    reason?: string;
  }) => {
    try {
      await warehouseService.transferItem({
        ...data,
        transferred_by: userId,
      });
      toast.success("Item transferred successfully");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to transfer item";
      toast.error(msg);
      throw err;
    }
  };

  const handleAllocate = async (data: {
    item_id: number;
    bin_id: number;
    quantity: number;
    source_location_id?: number;
  }) => {
    try {
      await warehouseService.assignItem(data.bin_id, {
        item_id: data.item_id,
        quantity: data.quantity,
        assigned_by: userId,
        source_location_id: data.source_location_id,
      });
      toast.success("Item allocated to bin");
      loadData();
    } catch (err: any) {
      const msg =
        err?.response?.data?.error?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to allocate item";
      toast.error(msg);
      throw err;
    }
  };

  const openTransfer = (row: any) => {
    setTransferRow(row);
    setTransferOpen(true);
  };

  const openAllocate = (row: any) => {
    setAllocateRow(row);
    setAllocateOpen(true);
  };

  // Loading / Not Found
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-muted-foreground">
          Loading warehouse details...
        </div>
      </div>
    );
  }
  if (!warehouse) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">Warehouse not found.</p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => navigate("/admin/warehouses")}
        >
          ← Back to Warehouses
        </Button>
      </div>
    );
  }

  return (
    <div className="pb-20 space-y-6">
      {/* Error banner */}
      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg flex justify-between items-center">
          <p className="text-destructive text-sm">{error}</p>
          <button
            onClick={() => setError(null)}
            className="text-destructive hover:text-destructive/80 font-medium"
          >
            ✕
          </button>
        </div>
      )}

      {/* ─── BACK BUTTON ─── */}
      <Button
        variant="ghost"
        size="sm"
        className="w-fit gap-2 text-muted-foreground hover:text-foreground font-semibold"
        onClick={() => navigate("/admin/warehouses")}
      >
        <ArrowLeft size={16} />
        Back to Warehouses
      </Button>

      {/* ─── HEADER SECTION ─── */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Warehouse Info Card */}
        <Card className="flex-grow">
          <CardContent className="p-6 md:p-8 flex items-center gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-foreground rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
              <Database className="text-background" size={36} />
            </div>
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground truncate">
                  {warehouse.name}
                </h1>
                <Badge
                  variant={warehouse.is_active ? "default" : "destructive"}
                >
                  {warehouse.is_active ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-primary text-sm mb-4">
                <MapPin size={14} />
                <span className="truncate">{warehouse.address}</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 border-t pt-4">
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest mb-1">
                    Facility Code
                  </div>
                  <div className="text-primary font-bold font-mono">
                    {warehouse.code}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest mb-1">
                    Coordinates
                  </div>
                  <div className="text-foreground/70 font-bold font-mono text-sm">
                    {warehouse.latitude && warehouse.longitude
                      ? `${Number(warehouse.latitude).toFixed(4)}, ${Number(warehouse.longitude).toFixed(4)}`
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-extrabold uppercase text-muted-foreground tracking-widest mb-1">
                    Active Bins
                  </div>
                  <div className="text-foreground/70 font-bold">
                    {warehouse.active_bins ?? bins.length}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Space Utilization Card */}
        <Card className="w-full md:w-80 bg-primary text-primary-foreground overflow-hidden relative">
          <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full relative z-10">
            <div>
              <div className="text-[10px] font-extrabold uppercase tracking-[0.2em] opacity-70 mb-2">
                Space Utilization
              </div>
              <div className="text-5xl font-extrabold mb-1">
                {utilizationPercent}%
              </div>
              <div className="text-xs font-medium opacity-80">
                Using {usedCapacity.toLocaleString()} of{" "}
                {totalCapacity.toLocaleString()} units
              </div>
            </div>
            <div className="mt-6">
              <div className="h-2 w-full bg-primary-foreground/20 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-foreground rounded-full transition-all duration-500"
                  style={{ width: `${utilizationPercent}%` }}
                />
              </div>
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Box size={100} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── TAB NAVIGATION ─── */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchQuery("");
              }}
              className={`min-w-[180px] flex-1 p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-left
                ${
                  isActive
                    ? "bg-card border-primary text-primary shadow-lg"
                    : "bg-card border-transparent text-muted-foreground hover:border-border"
                }`}
            >
              <div
                className={`p-2.5 rounded-xl ${isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                <Icon size={20} />
              </div>
              <div>
                <div className="text-xs font-extrabold uppercase tracking-widest">
                  {tab.label}
                </div>
                <div
                  className={`text-[11px] font-semibold ${isActive ? "text-muted-foreground" : "text-muted-foreground/60"}`}
                >
                  {tab.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ─── DATA TABLE CARD ─── */}
      <Card className="overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 border-b">
          <div className="flex items-center gap-3">
            <div className="flex border rounded-md overflow-hidden">
              <Input
                type="text"
                placeholder={`Search ${activeTab}...`}
                className="border-0 w-48 focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-extrabold uppercase tracking-widest text-[11px]"
            >
              <Search size={14} className="mr-1" /> Search
            </Button>
          </div>

          <div>
            {!isEmployee && activeTab === "locations" && (
              <AddLocationDialog onSubmit={handleAddLocation} />
            )}
            {!isEmployee && activeTab === "bins" && (
              <AddBinDialog locations={locations} onSubmit={handleAddBin} />
            )}
            {!isEmployee && activeTab === "items" && (
              <AssignItemDialog bins={bins} onSubmit={handleAssignItem} />
            )}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                {activeTab === "locations" && (
                  <>
                    <TableHead>Zone</TableHead>
                    <TableHead>Row</TableHead>
                    <TableHead>Aisle</TableHead>
                    <TableHead>Bay</TableHead>
                    <TableHead>Status</TableHead>
                    {!isEmployee && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </>
                )}
                {activeTab === "bins" && (
                  <>
                    <TableHead>Bin Code</TableHead>
                    <TableHead>Physical Path</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead>Utilization</TableHead>
                    <TableHead>Status</TableHead>
                    {!isEmployee && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </>
                )}
                {activeTab === "items" && (
                  <>
                    <TableHead>SKU</TableHead>
                    <TableHead>Item Details</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Current Bin</TableHead>
                    <TableHead>Stock Qty</TableHead>
                    <TableHead>Status</TableHead>
                    {!isEmployee && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </>
                )}
                {activeTab === "unallocated" && (
                  <>
                    <TableHead>Item / SKU</TableHead>
                    <TableHead>Reference Details</TableHead>
                    <TableHead>Received</TableHead>
                    <TableHead>Quantity</TableHead>
                    {!isEmployee && (
                      <TableHead className="text-right">Actions</TableHead>
                    )}
                  </>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length > 0 ? (
                filteredData.map((row, idx) => (
                  <TableRow key={row.id || idx} className="group">
                    {/* LOCATIONS TAB */}
                    {activeTab === "locations" && (
                      <>
                        <TableCell className="font-bold text-primary">
                          {row.zone}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {row.row}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {row.aisle}
                        </TableCell>
                        <TableCell className="text-sm font-medium">
                          {row.bay}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={row.is_active ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {row.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {!isEmployee && (
                          <TableCell className="text-right">
                            <div className="relative flex items-center justify-end">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Edit location"
                                  onClick={() => openEditLocation(row)}
                                >
                                  <Edit2 size={15} />
                                </Button>
                                {row.is_active ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                    title="Deactivate location"
                                    onClick={() =>
                                      handleDeactivateLocation(row.id)
                                    }
                                  >
                                    <Power size={15} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                    title="Activate location"
                                    onClick={() =>
                                      handleReactivateLocation(row.id)
                                    }
                                  >
                                    <ToggleRight size={15} />
                                  </Button>
                                )}
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                                <MoreHorizontal
                                  size={16}
                                  className="text-muted-foreground/40"
                                />
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </>
                    )}
                    {/* BINS TAB */}
                    {activeTab === "bins" && (
                      <>
                        <TableCell className="font-mono font-bold">
                          {row.bin_code}
                        </TableCell>
                        <TableCell className="text-[11px] font-semibold text-muted-foreground">
                          {row.zone
                            ? `${row.zone} > ${row.row} > ${row.aisle} > ${row.bay}`
                            : getLocationPath(row.location_id)}
                        </TableCell>
                        <TableCell className="font-bold">
                          {row.capacity}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Progress
                              value={
                                (row.current_occupancy / row.capacity) * 100
                              }
                              className="w-24 h-2"
                            />
                            <span className="text-[10px] font-bold text-muted-foreground">
                              {row.current_occupancy} units
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={row.is_active ? "default" : "destructive"}
                            className="text-xs"
                          >
                            {row.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </TableCell>
                        {!isEmployee && (
                          <TableCell className="text-right">
                            <div className="relative flex items-center justify-end">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8"
                                  title="Edit bin"
                                  onClick={() => openEditBin(row)}
                                >
                                  <Edit2 size={15} />
                                </Button>
                                {row.is_active ? (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
                                    title="Deactivate bin"
                                    onClick={() => handleDeactivateBin(row)}
                                  >
                                    <Power size={15} />
                                  </Button>
                                ) : (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
                                    title="Activate bin"
                                    onClick={() => handleReactivateBin(row)}
                                  >
                                    <ToggleRight size={15} />
                                  </Button>
                                )}
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                                <MoreHorizontal
                                  size={16}
                                  className="text-muted-foreground/40"
                                />
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </>
                    )}
                    {/* ITEMS TAB */}
                    {activeTab === "items" && (
                      <>
                        <TableCell className="font-bold text-sm font-mono">
                          {row.sku}
                        </TableCell>
                        <TableCell className="text-sm font-semibold">
                          {row.item_name}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="secondary"
                            className="text-[10px] font-extrabold"
                          >
                            {row.category || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="text-[10px] font-mono font-extrabold text-primary"
                          >
                            {row.current_bin || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-extrabold text-primary">
                          {row.quantity}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              row.status === "allocated"
                                ? "default"
                                : "destructive"
                            }
                            className="text-[10px] capitalize"
                          >
                            {row.status || "—"}
                          </Badge>
                        </TableCell>
                        {!isEmployee && (
                          <TableCell className="text-right">
                            <div className="relative flex items-center justify-end">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-[10px] font-extrabold uppercase bg-amber-500/10 text-amber-600 hover:bg-amber-500/20"
                                  onClick={() => openTransfer(row)}
                                >
                                  <RefreshCw size={12} className="mr-1" />{" "}
                                  Transfer
                                </Button>
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                                <MoreHorizontal
                                  size={16}
                                  className="text-muted-foreground/40"
                                />
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </>
                    )}
                    {/* UNALLOCATED TAB */}
                    {activeTab === "unallocated" && (
                      <>
                        <TableCell>
                          <div className="text-sm font-extrabold">
                            {row.item_name || row.name}
                          </div>
                          <div className="text-[10px] font-extrabold text-primary tracking-tight uppercase">
                            {row.sku || row.item_id}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            {row.po_reference && (
                              <span className="text-[10px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-md self-start flex items-center gap-1">
                                <FileText size={10} /> {row.po_reference}
                              </span>
                            )}
                            {row.supplier && (
                              <span className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                                <User size={10} /> {row.supplier}
                              </span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs font-semibold">
                            {row.received_at
                              ? new Date(row.received_at).toLocaleDateString()
                              : row.received_date || "—"}
                          </div>
                          {row.source && (
                            <div className="text-[9px] font-extrabold text-muted-foreground uppercase tracking-widest">
                              {row.source}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="text-sm font-extrabold text-amber-600">
                            {row.quantity} Units
                          </div>
                        </TableCell>
                        {!isEmployee && (
                          <TableCell className="text-right">
                            <div className="relative flex items-center justify-end">
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  className="h-7 px-3 text-[10px] font-extrabold uppercase tracking-widest"
                                  onClick={() => openAllocate(row)}
                                >
                                  Allocate{" "}
                                  <ArrowRightCircle size={14} className="ml-1" />
                                </Button>
                              </div>
                              <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-100 group-hover:opacity-0 transition-opacity flex items-center justify-center pointer-events-none">
                                <MoreHorizontal
                                  size={16}
                                  className="text-muted-foreground/40"
                                />
                              </div>
                            </div>
                          </TableCell>
                        )}
                      </>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-muted-foreground h-32"
                  >
                    No {activeTab} found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex items-center justify-between">
          <div className="px-3 py-1.5 border text-[11px] font-extrabold uppercase tracking-wider text-muted-foreground bg-muted rounded-md">
            Total Result: {filteredData.length}
          </div>
          <div className="flex items-center gap-4 text-[11px] font-extrabold uppercase tracking-widest text-muted-foreground">
            <button className="hover:text-foreground flex items-center gap-1">
              <ChevronLeft size={16} /> Previous
            </button>
            <span className="w-8 h-8 flex items-center justify-center bg-primary/10 text-primary rounded">
              1
            </span>
            <button className="hover:text-foreground flex items-center gap-1">
              Next <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </Card>

      {/* ─── DIALOGS ─── */}
      <EditLocationDialog
        open={editLocationOpen}
        onOpenChange={setEditLocationOpen}
        location={editLocationRow}
        onSubmit={handleEditLocation}
      />
      <EditBinDialog
        open={editBinOpen}
        onOpenChange={setEditBinOpen}
        bin={editBinRow}
        onSubmit={handleEditBin}
      />
      <TransferItemDialog
        open={transferOpen}
        onOpenChange={setTransferOpen}
        row={transferRow}
        bins={bins}
        itemLocations={itemLocations}
        onSubmit={handleTransfer}
      />
      <AllocateItemDialog
        open={allocateOpen}
        onOpenChange={setAllocateOpen}
        row={allocateRow}
        bins={bins}
        onSubmit={handleAllocate}
      />
    </div>
  );
}
