import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import MyAttendance from "@/app/attendance/MyAttendance";
import { useAuth } from "../hooks/useAuth";
import { useWarehouseStore } from "../store/warehouse-store";
import { useInventoryStore } from "../store/inventory-store";
import { usePurchaseOrderStore } from "../store/purchase-order-store";
import { useAttendanceStore } from "../store/attendance-store";
import { warehouseService } from "../services/warehouseService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Warehouse as WarehouseIcon,
  Package,
  FileText,
  AlertTriangle,
  Plus,
  Users,
  CheckCircle,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { formatDateToYYYYMMDD, formatTo12HourTime } from "@/utils/formatTime";

interface WarehouseUtilization {
  id: number;
  name: string;
  code: string;
  totalCapacity: number;
  usedCapacity: number;
  utilization: number;
}

interface StockAlertItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  quantity: number;
  status: "Low Stock" | "Out of Stock";
}

function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const { warehouses, fetchWarehouses } = useWarehouseStore();
  const { items, fetchItems } = useInventoryStore();
  const { purchaseOrders, fetchPurchaseOrders } = usePurchaseOrderStore();
  const { fetchRecordByID } = useAttendanceStore();

  const [warehouseData, setWarehouseData] = useState<WarehouseUtilization[]>(
    [],
  );
  const [stockAlerts, setStockAlerts] = useState<StockAlertItem[]>([]);
  const [todayAttendance, setTodayAttendance] = useState<{
    in: string | null;
    out: string | null;
  }>({ in: null, out: null });
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Current Date string
  const currentDateStr = useMemo(
    () => format(new Date(), "EEEE, MMMM dd, yyyy"),
    [],
  );

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      setIsDataLoading(true);
      try {
        // Fetch all store data concurrently
        await Promise.all([
          fetchWarehouses(),
          fetchItems(),
          fetchPurchaseOrders(),
        ]);

        // Fetch today's attendance record for the logged-in user
        const todayStr = formatDateToYYYYMMDD(new Date());
        const attendanceRes = await fetchRecordByID(user.id, todayStr);
        if (attendanceRes && attendanceRes.attendance_record.length > 0) {
          const rec = attendanceRes.attendance_record[0];
          setTodayAttendance({
            in: rec.check_in_time
              ? formatTo12HourTime(rec.check_in_time)
              : null,
            out: rec.check_out_time
              ? formatTo12HourTime(rec.check_out_time)
              : null,
          });
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setIsDataLoading(false);
      }
    };

    loadDashboardData();
  }, [user, fetchWarehouses, fetchItems, fetchPurchaseOrders, fetchRecordByID]);

  // Load detailed warehouse capacity and item location details
  useEffect(() => {
    const fetchDetailedMetrics = async () => {
      if (warehouses.length === 0) return;
      try {
        const whDetails = await Promise.all(
          warehouses.map(async (wh) => {
            const [bins, itemLocs] = await Promise.all([
              warehouseService.getBinsByWarehouse(wh.id),
              warehouseService.getItemLocations(wh.id),
            ]);

            const usedCapacity = bins.reduce(
              (sum, b) => sum + b.current_occupancy,
              0,
            );
            const totalCapacity = wh.total_capacity || 1;
            const utilization = Math.min(
              (usedCapacity / totalCapacity) * 100,
              100,
            );

            return {
              id: wh.id,
              name: wh.name,
              code: wh.code,
              totalCapacity,
              usedCapacity,
              utilization,
              itemLocs,
            };
          }),
        );

        setWarehouseData(whDetails);

        // Aggregate stock level totals across all warehouses to calculate alert levels
        const stockTotals: Record<
          string,
          {
            id: number;
            name: string;
            sku: string;
            category: string;
            quantity: number;
          }
        > = {};

        // 1. Sum up allocated quantities from item locations
        whDetails.forEach((wh) => {
          wh.itemLocs.forEach((loc) => {
            if (!stockTotals[loc.sku]) {
              stockTotals[loc.sku] = {
                id: loc.item_id,
                name: loc.item_name,
                sku: loc.sku,
                category: loc.category || "Uncategorized",
                quantity: 0,
              };
            }
            stockTotals[loc.sku].quantity += loc.quantity;
          });
        });

        // 2. Identify items that are active but have zero stock (Out of Stock)
        const alerts: StockAlertItem[] = [];
        items.forEach((item) => {
          if (!item.is_active) return;
          const totalStock = stockTotals[item.sku]?.quantity || 0;
          if (totalStock === 0) {
            alerts.push({
              id: item.id,
              sku: item.sku,
              name: item.name,
              category: item.category || "Uncategorized",
              quantity: 0,
              status: "Out of Stock",
            });
          } else if (totalStock < 15) {
            alerts.push({
              id: item.id,
              sku: item.sku,
              name: item.name,
              category: item.category || "Uncategorized",
              quantity: totalStock,
              status: "Low Stock",
            });
          }
        });

        // Sort alerts: Out of stock first, then by quantity ascending
        alerts.sort((a, b) => {
          if (a.quantity === b.quantity) return a.name.localeCompare(b.name);
          return a.quantity - b.quantity;
        });

        setStockAlerts(alerts);
      } catch (error) {
        console.error("Error fetching detailed WMS metrics:", error);
      }
    };

    fetchDetailedMetrics();
  }, [warehouses, items]);

  // Computed Dashboard KPIs
  const avgUtilization = useMemo(() => {
    if (warehouseData.length === 0) return 0;
    const sum = warehouseData.reduce((acc, curr) => acc + curr.utilization, 0);
    return Math.round(sum / warehouseData.length);
  }, [warehouseData]);

  const pendingPOCount = useMemo(() => {
    return purchaseOrders.filter((po) => po.status === "pending").length;
  }, [purchaseOrders]);

  const showLoader = authLoading || isDataLoading;

  if (showLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Clock className="w-8 h-8 animate-spin text-primary" />
        <span className="text-muted-foreground font-medium text-sm">
          Loading dashboard insights...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-950 p-6 md:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-bold tracking-[0.2em] text-primary uppercase">
              System Dashboard
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.username || "Guest"}!
            </h1>
            <p className="text-sm text-neutral-300">
              Here is your operations overview for today.
            </p>
          </div>
          <div className="flex flex-col md:items-end gap-2">
            <span className="text-sm font-semibold bg-white/10 px-3 py-1.5 rounded-full border border-white/10 w-fit">
              {currentDateStr}
            </span>
            <Badge
              variant="secondary"
              className="capitalize w-fit border border-neutral-700"
            >
              Role: {user?.role || "Staff"}
            </Badge>
          </div>
        </div>
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      </div>

      {/* KPI Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl">
              <WarehouseIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Avg Space Utilized
              </p>
              <h3 className="text-2xl font-bold">{avgUtilization}%</h3>
              <p className="text-xs text-muted-foreground">
                Across {warehouseData.length} facilities
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${stockAlerts.length > 0 ? "bg-amber-500/10 text-amber-600 dark:text-amber-400" : "bg-green-500/10 text-green-600"}`}
            >
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Low Stock Alerts
              </p>
              <h3 className="text-2xl font-bold">{stockAlerts.length}</h3>
              <p className="text-xs text-muted-foreground">
                Items requiring attention
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Pending Purchase Orders
              </p>
              <h3 className="text-2xl font-bold">{pendingPOCount}</h3>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-5 flex items-center gap-4">
            <div
              className={`p-3 rounded-xl ${todayAttendance.in ? "bg-green-500/10 text-green-600" : "bg-neutral-500/10 text-neutral-600"}`}
            >
              <CheckCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Today's Shift Status
              </p>
              <h3 className="text-sm font-semibold truncate mt-1">
                {todayAttendance.in ? (
                  <span className="text-green-600 font-bold">Checked In</span>
                ) : (
                  <span className="text-muted-foreground">Not Checked In</span>
                )}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {todayAttendance.in
                  ? `Clocked in at ${todayAttendance.in}`
                  : "Punch in to start shift"}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Left area - Operations Watchlist & Space overview (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Warehouse Occupancy Capacity Card */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Warehouse Capacity Overview
                </CardTitle>
                <p className="text-xs text-muted-foreground">
                  Occupied storage volume per active warehouse
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs font-semibold gap-1"
              >
                <Link to="/admin/warehouses">
                  Manage Warehouses <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-6 space-y-5">
              {warehouseData.length === 0 ? (
                <div className="text-center py-6 text-sm text-muted-foreground">
                  No warehouses configured yet.
                </div>
              ) : (
                warehouseData.map((wh) => {
                  const percent = wh.utilization;
                  // Color indicators based on utilization percentage
                  let progressColor = "bg-green-500";
                  if (percent > 85) progressColor = "bg-destructive";
                  else if (percent > 60) progressColor = "bg-amber-500";

                  return (
                    <div key={wh.id} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="space-y-0.5">
                          <span className="font-semibold text-foreground">
                            {wh.name}
                          </span>
                          <span className="text-xs text-muted-foreground block font-mono">
                            Code: {wh.code}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-bold">
                            {percent.toFixed(1)}%
                          </span>
                          <span className="text-xs text-muted-foreground block">
                            {wh.usedCapacity.toLocaleString()} /{" "}
                            {wh.totalCapacity.toLocaleString()} units
                          </span>
                        </div>
                      </div>
                      <div className="h-2.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className={`h-full ${progressColor} rounded-full transition-all duration-500`}
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Low Stock Alerts Card */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">
                  Critical Stock Alert Watchlist
                </CardTitle>
                <p className="text-xs text-muted-foreground font-semibold">
                  Active items below minimum safety levels (&lt; 15 units)
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="text-xs font-semibold gap-1"
              >
                <Link to="/admin/inventory">
                  View Inventory <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {stockAlerts.length === 0 ? (
                <div className="text-center py-10 text-sm text-muted-foreground flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                  <span>
                    All active inventory items are adequately stocked!
                  </span>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="pl-6">SKU</TableHead>
                        <TableHead>Item Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Current Stock</TableHead>
                        <TableHead>Alert Level</TableHead>
                        <TableHead className="pr-6 text-right">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stockAlerts.slice(0, 5).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="pl-6 font-mono font-medium text-xs">
                            {item.sku}
                          </TableCell>
                          <TableCell className="font-semibold text-sm">
                            {item.name}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold"
                            >
                              {item.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-bold text-foreground">
                            {item.quantity} units
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                item.status === "Out of Stock"
                                  ? "destructive"
                                  : "secondary"
                              }
                              className="text-[10px] uppercase font-extrabold"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-8 gap-1 text-xs"
                            >
                              <Link to="/admin/purchase-orders">
                                Reorder <ExternalLink className="w-3 h-3" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  {stockAlerts.length > 5 && (
                    <div className="text-center py-3 border-t">
                      <span className="text-xs text-muted-foreground">
                        Showing 5 of {stockAlerts.length} total alerts.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Column 2: Right Area - My Attendance & Quick Operations Actions (1/3 width) */}
        <div className="space-y-6">
          {/* Retained MY ATTENDANCE Widget */}
          <div className="rounded-xl overflow-hidden shadow-sm">
            <MyAttendance />
          </div>

          {/* Quick Actions Operations Menu */}
          <Card className="shadow-sm">
            <CardHeader className="border-b pb-4">
              <CardTitle className="text-lg font-bold">
                Quick Operations
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                Common operational shortcuts
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11"
                asChild
              >
                <Link to="/admin/purchase-orders">
                  <Plus className="w-4 h-4 text-primary" />
                  <span>Create Purchase Order</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11"
                asChild
              >
                <Link to="/admin/inventory">
                  <Package className="w-4 h-4 text-primary" />
                  <span>Manage Stock Registry</span>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start gap-3 h-11"
                asChild
              >
                <Link to="/admin/warehouses">
                  <WarehouseIcon className="w-4 h-4 text-primary" />
                  <span>Warehouse Monitoring</span>
                </Link>
              </Button>
              {(user?.role === "admin" || user?.role === "manager") && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 h-11"
                  asChild
                >
                  <Link to="/admin/users">
                    <Users className="w-4 h-4 text-primary" />
                    <span>Manage User Accounts</span>
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;
