// ─── Role-Based Access Configuration ─────────────────────────────────────────
//
// Define which roles can access each route.
//
// Route patterns support:
//   - Exact match:  "POST /api/users/create-user"
//   - Wildcard:     "GET /api/inventory/items/*"   (matches any sub-path)
//   - Param style:  "GET /api/warehouses/:id"      (matches any single segment)
//
// Roles: "admin", "manager", "employee"
//
// If a route is NOT listed here, it is denied by default (unless it's a public
// route handled by the auth middleware's allow-list).
// ─────────────────────────────────────────────────────────────────────────────

export type Role = "admin" | "manager" | "employee";

export interface RoutePermission {
  method: string; // HTTP method: GET, POST, PUT, PATCH, DELETE, or "*"
  path: string; // Route pattern (relative to /api)
  roles: Role[]; // Roles allowed to access this route
}

const ALL_ROLES: Role[] = ["admin", "manager", "employee"];
const ADMIN_ONLY: Role[] = ["admin"];
const ADMIN_MANAGER: Role[] = ["admin", "manager"];

export const roleAccessConfig: RoutePermission[] = [
  // ── Auth (profile requires authentication but all roles can access) ──────
  { method: "GET", path: "/auth/profile", roles: ALL_ROLES },
  { method: "POST", path: "/auth/logout", roles: ALL_ROLES },

  // ── Users ────────────────────────────────────────────────────────────────
  { method: "POST", path: "/users/create-user", roles: ADMIN_MANAGER },
  { method: "GET", path: "/users/get-all-users", roles: ADMIN_MANAGER },
  { method: "POST", path: "/users/get-user-by-username", roles: ADMIN_MANAGER },
  { method: "PATCH", path: "/users/update-user", roles: ADMIN_ONLY },
  { method: "PATCH", path: "/users/update-profile", roles: ALL_ROLES },
  { method: "PATCH", path: "/users/update-password", roles: ALL_ROLES },
  { method: "DELETE", path: "/users/delete-user", roles: ADMIN_ONLY },
  { method: "DELETE", path: "/users/delete-multiple-users", roles: ADMIN_ONLY },

  // ── Attendance ───────────────────────────────────────────────────────────
  {
    method: "POST",
    path: "/attendance/create-attendance-record",
    roles: ALL_ROLES,
  },
  {
    method: "PATCH",
    path: "/attendance/audit-attendance-update",
    roles: ADMIN_MANAGER,
  },
  {
    method: "POST",
    path: "/attendance/get-attendance-record",
    roles: ALL_ROLES,
  },

  // ── Inventory ────────────────────────────────────────────────────────────
  { method: "POST", path: "/inventory/items", roles: ADMIN_MANAGER },
  { method: "GET", path: "/inventory/items", roles: ALL_ROLES },
  { method: "GET", path: "/inventory/items/:id", roles: ALL_ROLES },
  { method: "PUT", path: "/inventory/items/:id", roles: ADMIN_MANAGER },
  {
    method: "PATCH",
    path: "/inventory/items/:id/deactivate",
    roles: ADMIN_ONLY,
  },

  // ── Suppliers ────────────────────────────────────────────────────────────
  { method: "POST", path: "/suppliers", roles: ADMIN_MANAGER },
  { method: "GET", path: "/suppliers", roles: ALL_ROLES },
  { method: "GET", path: "/suppliers/:id", roles: ALL_ROLES },
  { method: "PUT", path: "/suppliers/:id", roles: ADMIN_MANAGER },
  { method: "PATCH", path: "/suppliers/:id/deactivate", roles: ADMIN_ONLY },
  { method: "PATCH", path: "/suppliers/:id/reactivate", roles: ADMIN_ONLY },

  // ── Purchase Orders ─────────────────────────────────────────────────────
  { method: "POST", path: "/purchase-orders", roles: ADMIN_MANAGER },
  { method: "GET", path: "/purchase-orders", roles: ALL_ROLES },
  { method: "GET", path: "/purchase-orders/:id", roles: ALL_ROLES },
  {
    method: "GET",
    path: "/purchase-orders/:id/status-history",
    roles: ALL_ROLES,
  },
  {
    method: "PATCH",
    path: "/purchase-orders/:id/status",
    roles: ADMIN_MANAGER,
  },
  {
    method: "POST",
    path: "/purchase-orders/:id/receive",
    roles: ADMIN_MANAGER,
  },
  {
    method: "POST",
    path: "/purchase-orders/:id/allocate",
    roles: ADMIN_MANAGER,
  },

  // ── Warehouses ───────────────────────────────────────────────────────────
  { method: "POST", path: "/warehouses", roles: ADMIN_ONLY },
  { method: "GET", path: "/warehouses", roles: ALL_ROLES },
  { method: "GET", path: "/warehouses/:id", roles: ALL_ROLES },
  { method: "PUT", path: "/warehouses/:id", roles: ADMIN_MANAGER },
  { method: "PATCH", path: "/warehouses/:id/deactivate", roles: ADMIN_ONLY },
  { method: "PATCH", path: "/warehouses/:id/reactivate", roles: ADMIN_ONLY },
  {
    method: "GET",
    path: "/warehouses/:warehouseId/unallocated",
    roles: ALL_ROLES,
  },
  {
    method: "GET",
    path: "/warehouses/:warehouseId/item-locations",
    roles: ALL_ROLES,
  },

  // ── Locations (nested under warehouses) ──────────────────────────────────
  {
    method: "POST",
    path: "/warehouses/:warehouseId/locations",
    roles: ADMIN_MANAGER,
  },
  {
    method: "GET",
    path: "/warehouses/:warehouseId/locations",
    roles: ALL_ROLES,
  },
  {
    method: "PUT",
    path: "/warehouses/:warehouseId/locations/:id",
    roles: ADMIN_MANAGER,
  },
  {
    method: "PATCH",
    path: "/warehouses/:warehouseId/locations/:id/deactivate",
    roles: ADMIN_ONLY,
  },
  {
    method: "PATCH",
    path: "/warehouses/:warehouseId/locations/:id/reactivate",
    roles: ADMIN_ONLY,
  },

  // ── Bins (nested under locations) ────────────────────────────────────────
  {
    method: "GET",
    path: "/locations/bins/warehouse/:warehouseId",
    roles: ALL_ROLES,
  },
  { method: "POST", path: "/locations/:locationId/bins", roles: ADMIN_MANAGER },
  { method: "GET", path: "/locations/:locationId/bins", roles: ALL_ROLES },
  {
    method: "PUT",
    path: "/locations/:locationId/bins/:id",
    roles: ADMIN_MANAGER,
  },
  {
    method: "PATCH",
    path: "/locations/:locationId/bins/:id/deactivate",
    roles: ADMIN_ONLY,
  },
  {
    method: "PATCH",
    path: "/locations/:locationId/bins/:id/reactivate",
    roles: ADMIN_ONLY,
  },

  // ── Bin assign & transfer (nested under warehouses) ──────────────────────
  {
    method: "POST",
    path: "/warehouses/bins/:binId/assign",
    roles: ADMIN_MANAGER,
  },
  { method: "POST", path: "/warehouses/bins/transfer", roles: ADMIN_MANAGER },
];

// ─── Matcher Utility ─────────────────────────────────────────────────────────

/**
 * Check if `actualPath` matches the `pattern`.
 * Pattern segments like `:param` or `*` match any single path segment.
 */
function pathMatches(pattern: string, actualPath: string): boolean {
  const patternParts = pattern.split("/").filter(Boolean);
  const actualParts = actualPath.split("/").filter(Boolean);

  if (patternParts.length !== actualParts.length) return false;

  return patternParts.every((part, i) => {
    if (part.startsWith(":") || part === "*") return true;
    return part === actualParts[i];
  });
}

/**
 * Find the matching permission entry for a given method + path.
 * Returns the allowed roles, or `null` if no rule is defined.
 */
export function getAllowedRoles(method: string, path: string): Role[] | null {
  // Strip leading /api prefix so we match against config paths
  const normalizedPath = path.replace(/^\/api/, "");

  for (const rule of roleAccessConfig) {
    const methodMatch =
      rule.method === "*" || rule.method === method.toUpperCase();
    if (methodMatch && pathMatches(rule.path, normalizedPath)) {
      return rule.roles;
    }
  }
  return null;
}
