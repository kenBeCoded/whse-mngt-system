# Frontend Implementation Plan: WHSE MNGT v2.0

## 1. Overview
The goal is to implement the frontend for the Warehouse Management System v2.0 based on the provided UI design requirements. The frontend is built using Vite, React 19, TypeScript, Tailwind CSS v4, Zustand, and Shadcn UI (Radix Primitives). 

## 2. Global Layout and Navigation
- **Sidebar Navigation**: Implement a global sidebar with routing links referencing key modules:
  - Inventory Items
  - Suppliers
  - Purchase Orders
  - Warehouse Monitoring
- **Breadcrumbs & Search**: Global or page-level headers comprising breadcrumbs, a search bar, and user profile/settings.

## 3. Modules Breakdown

### 3.1 Inventory Management
- **Item List/Table View**: 
  - Columns: Image/icon, SKU, Item Details (Name), Category, Stock Qty, Status (Active/Inactive), Actions (... dropdown).
  - Filters: Global Search, Category Dropdown, Status Dropdown.
  - Pagination/Totals: Show "TOTAL RESULT" at the bottom.
- **Create Item Dialog (`CREATE`)**: Accessible via a "CREATE ITEM" button. Contains form fields (managed by react-hook-form + zod).
- **Update Item Dialog (`UPDATE`)**: Opened via the actions menu. Pre-populated form fields to edit the details.

### 3.2 Suppliers Management
- **Suppliers Table**: List of suppliers.
- **Supplier Dialog (`CREATE`)**: Form to add new suppliers.
- **Supplier Dialog (`UPDATE`)**: Form to edit existing suppliers.

### 3.3 Purchase Order (PO) Management
- **Purchase Order Form**: A template-based form for creating a new PO.
- **PO Table with Status Tracking**:
  - Requires a tabbed or filterable interface for statuses: `REQUESTED`, `PENDING`, `PREPARING`, `SHIPPED`, `FOR RECEIVING`, `RECEIVED`, `CANCELLED`.
  - Data table reflecting the details of orders per selected status tab.

### 3.4 Warehouse Management & Monitoring
- **Warehouse Monitoring Dashboard**:
  - Toggle between **MAP** view and **TABLE** view.
  - **Register New Warehouse Dialog**: Form to add new warehouses.
- **Warehouse Management Actions**:
  - `TRANSFER`: Transfer inventory between locations.
  - `UPDATE`: Update warehouse details. (Note: design indicates item name field might be disabled during update; delete functionality is optional but needs a disabled state or consideration).
- **Warehouse Details & Bin Inventory**:
  - Detailed drill-down view showing specific bin inventories of a selected warehouse.

## 4. Technology Stack & Component Tools
- **Data Fetching/API**: Use `axios` to integrate with the backend API.
- **State Management**: Use `zustand` for global state (e.g., UI states, user session, selected tabs).
- **Forms & Validation**: `react-hook-form` + `@hookform/resolvers/zod` + `zod` for all dialogs (Create/Update).
- **UI Components (Shadcn)**: Use existing tools like `@radix-ui/react-dialog`, `@tanstack/react-table` (for all tables), `@radix-ui/react-select`, `@radix-ui/react-dropdown-menu`, etc.

## 5. Development Phases

**Phase 1: Foundation & Layout**
- Construct the base App layout (Sidebar, Header, Breadcrumbs).
- Setup routing in `react-router-dom` for the main pages (`/inventory`, `/suppliers`, `/purchase-orders`, `/warehouses`).

**Phase 2: Inventory & Suppliers**
- Build the data-table component for Inventory and Suppliers.
- Implement reusable Dialog forms.
- Integrate CRUD APIs for both.

**Phase 3: Purchase Orders**
- Build the tabbed UI for status tracking.
- Implement the PO creation form schema and UI.
- Connect to endpoint.

**Phase 4: Warehouse & Advanced Views**
- Implement Map/Table toggle for Warehouses.
- Build the "Details & Bin Inventory" page.

## 6. Pending Questions / Information Needed
1. Do you have a preferred interactive Map library for the "MAP" view (e.g., `react-leaflet`, `google-maps-react`)?
2. Are all backend endpoints ready to be integrated, or will we mock data initially for these screens?
