import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";
import type { Warehouse } from "@/services/warehouseService";

// Fix default marker icon issue in bundled environments
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

// Auto-fit map bounds to markers
function FitBounds({ warehouses }: { warehouses: Warehouse[] }) {
  const map = useMap();

  useEffect(() => {
    const validWarehouses = warehouses.filter(
      (w) => w.latitude != null && w.longitude != null
    );

    if (validWarehouses.length === 0) return;

    if (validWarehouses.length === 1) {
      map.setView(
        [Number(validWarehouses[0].latitude), Number(validWarehouses[0].longitude)],
        13
      );
      return;
    }

    const bounds = L.latLngBounds(
      validWarehouses.map((w) => [Number(w.latitude), Number(w.longitude)] as L.LatLngTuple)
    );
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [warehouses, map]);

  return null;
}

interface WarehouseMapViewProps {
  warehouses: Warehouse[];
}

export function WarehouseMapView({ warehouses }: WarehouseMapViewProps) {
  const navigate = useNavigate();

  // Warehouses with valid coordinates
  const mappableWarehouses = warehouses.filter(
    (w) => w.latitude != null && w.longitude != null
  );

  // Default center (Philippines) if no warehouses have coordinates
  const defaultCenter: [number, number] = [14.5995, 120.9842];
  const defaultZoom = 6;

  if (mappableWarehouses.length === 0) {
    return (
      <div className="rounded-md border p-8 text-center">
        <p className="text-muted-foreground text-sm">
          No warehouses with coordinates to display on the map.
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Register a warehouse with latitude and longitude to see it here.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden" style={{ height: "550px" }}>
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds warehouses={mappableWarehouses} />
        {mappableWarehouses.map((warehouse) => (
          <Marker
            key={warehouse.id}
            position={[Number(warehouse.latitude), Number(warehouse.longitude)]}
          >
            <Popup>
              <div className="min-w-[180px]">
                <p className="font-semibold text-sm">{warehouse.name}</p>
                <p className="text-xs text-gray-500 font-mono">
                  {warehouse.code}
                </p>
                <p className="text-xs mt-1">{warehouse.address}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Capacity: {Number(warehouse.total_capacity).toLocaleString()}
                  </span>
                </div>
                <button
                  className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
                  onClick={() =>
                    navigate(`/admin/warehouses/${warehouse.id}`)
                  }
                >
                  View Details →
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
