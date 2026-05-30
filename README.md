# 🏭 WhseMS — Warehouse Management System

> A full-stack, production-ready Warehouse Management System built for real operational workflows — from purchase order creation and supplier tracking, to bin-level inventory allocation, employee attendance monitoring, and live geolocation mapping of warehouse sites.

---

## ✨ Key Features

### 📦 Inventory & Stock Control
- Register inventory items with unique `item_number` and `SKU`
- Track real-time stock per bin and per warehouse location via `inventory_stock`
- Full transaction history logged with auto-generated `TXN-XXXXXX` codes
- Soft-delete (deactivate/reactivate) for items, bins, and warehouses

### 🏢 Warehouse & Bin Management
- Create warehouses with GPS coordinates (latitude & longitude) — visualized via **Leaflet** maps
- Auto-generate warehouse codes (`WH-000001`) on creation
- Hierarchical storage model: **Warehouse → Location (Zone/Row/Aisle/Bay) → Bin**
- Capacity enforcement: bin creation is blocked if it would exceed a warehouse's total capacity
- Bin-to-bin item transfers with full audit logging via `bin_transfer_logs`

### 🛒 Purchase Order Lifecycle
- Full PO lifecycle with enforced state machine transitions:  
  `request → pending → approved → preparing → shipped → received`
- Auto-generated PO numbers (`PO-000001`)
- Line-item subtotal validation against declared `total_amount`
- PO receipt flow: partial or full goods receiving, items enter the system as `unallocated` and must be allocated to bins
- Status change history tracked in `po_status_logs`
- Optional file attachments per PO (PDF, images)

### 👥 User & Role Management
- Role-based access control (`admin`, `employee`)
- bcrypt password hashing (12 rounds)
- JWT-based authentication with separate access & refresh tokens stored in HTTP-only cookies
- Soft-delete for users (`is_deleted` flag)

### 🕐 Attendance & Overtime Tracking
- Image-based check-in / check-out (stored on **Supabase Storage**)
- Attendance auditing with `pass`, `fail`, `pending` statuses
- Overtime scheduling (`ot_sched`) linked to individual attendance records
- Bulk schedule updates across multiple users and date ranges

### 🏪 Supplier Management
- CRUD for suppliers with duplicate email detection
- Soft-deactivate/reactivate suppliers

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, TypeScript, Vite 7 |
| **UI Components** | Radix UI (headless), shadcn/ui |
| **Styling** | Tailwind CSS v4 |
| **State Management** | Zustand |
| **Forms & Validation** | React Hook Form + Zod |
| **Data Tables** | TanStack Table v8 |
| **Maps** | Leaflet + React Leaflet |
| **HTTP Client** | Axios |
| **Backend** | Node.js, Express v5, TypeScript |
| **Database** | PostgreSQL 15 (via `node-postgres`) |
| **Auth** | JWT (access + refresh tokens), bcrypt |
| **File Storage** | Supabase Storage |
| **Security** | Helmet, CORS, express-rate-limit, cookie-parser |
| **Validation** | Joi (server-side) |
| **Testing** | Vitest |
| **Containerization** | Docker + Docker Compose |

---

## 🏗 Architecture & Database Schema

### Application Architecture

```
whse-mngt-system/
├── frontend/                  # React + Vite SPA
│   └── src/
│       ├── pages/             # Route-level page components
│       ├── components/        # Reusable UI components
│       ├── api/               # Axios API client modules
│       ├── store/             # Zustand global state
│       ├── hooks/             # Custom React hooks
│       ├── services/          # Business logic / service layer
│       ├── context/           # React context providers
│       └── utils/             # Utility helpers
│
└── backend/                   # Express REST API
    └── src/
        ├── routes/            # Route definitions
        │   └── sub-routes/    # Modular route files (users, inventory, po, etc.)
        ├── controllers/       # Request handlers
        ├── models/            # Data access layer (raw SQL via pg)
        ├── middleware/        # Auth, logging, error handling
        ├── auth/              # JWT token logic
        ├── validation/        # Joi schemas
        ├── types/             # Shared TypeScript interfaces
        ├── config/            # DB connection pool
        └── utils/             # Shared utilities
```

### Database Schema (Entity Relationship Overview)

```
┌─────────────┐       ┌─────────────────────┐       ┌──────────────┐
│   users     │       │   purchase_order     │       │  suppliers   │
│─────────────│       │─────────────────────│       │──────────────│
│ id (PK)     │       │ id (PK)             │       │ id (PK)      │
│ user_account_id     │ po_number           │       │ name         │
│ username    │◄──┐   │ supplier_id (FK)────┼──────►│ email        │
│ password_hash│  │   │ warehouse_id (FK)   │       │ address      │
│ email       │  │   │ status              │       │ is_active    │
│ first_name  │  │   │ total_amount        │       └──────────────┘
│ last_name   │  │   │ attachment_url      │
│ role        │  │   └─────────────────────┘
│ u_sched_in  │  │              │
│ u_sched_out │  │              │ 1:N
└─────────────┘  │              ▼
       │          │   ┌─────────────────────┐
       │ 1:N      │   │   po_line_orders    │
       ▼          │   │─────────────────────│
┌─────────────────┐   │ item_id (FK)────────┼───┐
│attendance_records│  │ quantity_ordered    │   │
│─────────────────│  │ unit_price          │   │
│ user_id (FK)    │  │ quantity_received   │   │
│ attendance_date │  └─────────────────────┘   │
│ check_in_time   │                             │
│ check_out_time  │  ┌──────────────────┐       │
│ status          │  │ inventory_items  │◄──────┘
│ ot_id (FK)      │  │──────────────────│
└─────────────────┘  │ id (PK)          │
                     │ item_number      │
                     │ sku              │
                     │ name             │
                     │ category         │
                     │ unit_of_measure  │
                     └──────────────────┘
                              │
                              │ tracked in
                              ▼
┌───────────┐    ┌────────────────┐    ┌──────────────────┐
│ warehouse │    │   locations    │    │      bins        │
│───────────│    │────────────────│    │──────────────────│
│ id (PK)   │───►│ warehouse_id   │───►│ location_id (FK) │
│ code      │    │ zone           │    │ bin_code         │
│ name      │    │ row            │    │ capacity         │
│ address   │    │ aisle          │    │ current_occupancy│
│ longitude │    │ bay            │    │ is_active        │
│ latitude  │    └────────────────┘    └──────────────────┘
│ total_cap │                                   │
└───────────┘                                   │
                                                ▼
                                   ┌────────────────────────┐
                                   │    item_locations      │
                                   │────────────────────────│
                                   │ item_id (FK)           │
                                   │ bin_id (FK, nullable)  │
                                   │ quantity               │
                                   │ allocation_status      │
                                   │  (unallocated/allocated│
                                   │ receipt_line_id (FK)   │
                                   └────────────────────────┘
```

**Key Supporting Tables:**
| Table | Purpose |
|---|---|
| `po_receipts` | Header record for goods received against a PO |
| `po_receipt_lines` | Line-level receipt quantities (expected vs. received) |
| `po_status_logs` | Full audit trail of every PO status transition |
| `po_attachment` | File attachments (PDF / images) linked to POs |
| `inventory_stock` | Aggregated stock per item per warehouse location |
| `inventory_transactions` | Ledger of all stock movement events (`in`, `transfer`) |
| `bin_transfer_logs` | Audit log for bin-to-bin transfers |
| `attendance_images` | Supabase image URLs for check-in/check-out photos |
| `ot_sched` | Overtime schedules linked to attendance records |

---

## 🚀 Getting Started (Local Setup)

### Prerequisites
- **Node.js** v18+
- **npm** v9+
- **PostgreSQL** 15+ (running locally or via Docker)
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/whse-mngt-system.git
cd whse-mngt-system
```

### 2. Set Up the Backend

```bash
cd backend

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env
# (Edit .env with your database URL and secrets — see Environment Variables below)

# Run in development mode (tsx watch)
npm run dev
```

The API server will start at `http://localhost:8000`.

### 3. Set Up the Frontend

```bash
cd ../frontend

# Install dependencies
npm install

# Copy the environment template and fill in your values
cp .env.example .env
# (Edit .env — see Environment Variables below)

# Start the Vite dev server
npm run dev
```

The frontend will be available at `http://localhost:5173`.

### 4. (Optional) Run with Docker

A `docker-compose.yml` is provided in the `backend/` directory to spin up both the API and a PostgreSQL 15 instance:

```bash
cd backend
docker-compose up --build
```

The API will be available at `http://localhost:3000` (mapped from container port `8000`).

---

## 🔐 Environment Variables Guide

### Backend (`backend/.env`)

| Variable | Description | Example |
|---|---|---|
| `NODE_ENV` | Runtime environment | `development` or `production` |
| `PORT` | Port the Express server listens on | `8000` |
| `FRONTEND_URL` | Allowed CORS origin (your frontend URL) | `http://localhost:5173` |
| `JWT_SECRET` | Master JWT secret (legacy / general use) | `your_strong_secret_here` |
| `ACCESS_TOKEN_SECRET` | Secret used to sign short-lived access tokens | `your_access_secret_here` |
| `REFRESH_TOKEN_SECRET` | Secret used to sign long-lived refresh tokens | `your_refresh_secret_here` |
| `USERS_DB` | PostgreSQL connection string | `postgres://user:password@localhost:5432/dbname` |

> ⚠️ **Security:** Never commit real secrets to version control. Use strong, randomly generated values for all JWT secrets in production. The connection string in `.env` is for local development only.

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Base URL of the backend REST API | `http://localhost:8000` |
| `VITE_NODE_ENV` | App environment | `development` or `production` |
| `VITE_SUPABASE_URL` | Your Supabase project URL (for file storage) | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANONKEY` | Supabase anonymous/public API key | `eyJhbGci...` |

> ℹ️ **Supabase** is used exclusively for image storage (attendance check-in/check-out photos). All other data is stored in your PostgreSQL database.

---

## 📜 Available Scripts

### Backend

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot-reload (`tsx watch`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled production build |
| `npm test` | Run tests with Vitest (watch mode) |
| `npm run test:run` | Run tests once (CI mode) |
| `npm run coverage` | Generate test coverage report |

### Frontend

| Script | Description |
|---|---|
| `npm run dev` | Start Vite development server |
| `npm run build` | Build the production bundle |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |