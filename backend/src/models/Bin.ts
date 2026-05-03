import pool from "../config/database.js";
import { Bin } from "../types/index.js";

export class BinModel {
  // ── POST /api/locations/:locationId/bins ──────────────────────────────────
  static async create(data: {
    location_id: number;
    bin_code: string;
    capacity: number;
    created_by: number;
  }): Promise<Bin> {
    const client = await pool.connect();
    try {
      // Uniqueness check
      const dup = await client.query(
        `SELECT id FROM bins WHERE bin_code = $1`,
        [data.bin_code],
      );
      if (dup.rowCount && dup.rowCount > 0) {
        const err: any = new Error(
          `bin_code '${data.bin_code}' already exists`,
        );
        err.statusCode = 409;
        throw err;
      }

      // Warehouse capacity check — sum of active bin capacities must not exceed warehouse total_capacity
      const capacityCheck = await client.query(
        `SELECT w.total_capacity,
                COALESCE((
                  SELECT SUM(b.capacity)
                  FROM bins b
                  JOIN locations l2 ON l2.id = b.location_id
                  WHERE l2.warehouse_id = w.id AND b.is_active = true
                ), 0) AS used_capacity
         FROM locations l
         JOIN warehouse w ON w.id = l.warehouse_id
         WHERE l.id = $1`,
        [data.location_id],
      );

      if (capacityCheck.rows.length > 0) {
        const totalCapacity = Number(capacityCheck.rows[0].total_capacity);
        const usedCapacity = Number(capacityCheck.rows[0].used_capacity);

        if (usedCapacity + data.capacity > totalCapacity) {
          const err: any = new Error(
            `Cannot accommodate more bins, warehouse has reached maximum capacity (used: ${usedCapacity}, new bin: ${data.capacity}, total: ${totalCapacity})`,
          );
          err.statusCode = 400;
          throw err;
        }
      }

      const result = await client.query(
        `INSERT INTO bins (location_id, bin_code, capacity, current_occupancy, is_active, created_by)
         VALUES ($1, $2, $3, 0, true, $4)
         RETURNING *`,
        [data.location_id, data.bin_code, data.capacity, data.created_by],
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ── GET /api/locations/:locationId/bins ───────────────────────────────────
  static async findAllByLocation(locationId: number): Promise<Bin[]> {
    const result = await pool.query(
      `SELECT * FROM bins WHERE location_id = $1 AND is_active = true ORDER BY bin_code`,
      [locationId],
    );
    return result.rows;
  }

  // ── GET /api/locations/bins/warehouse/:warehouseId ────────────────────────
  static async findAllByWarehouse(warehouseId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT b.*, l.zone, l.row, l.aisle, l.bay
       FROM bins b
       JOIN locations l ON l.id = b.location_id
       WHERE l.warehouse_id = $1
       ORDER BY b.bin_code`,
      [warehouseId],
    );
    return result.rows;
  }

  // ── PUT /api/locations/:locationId/bins/:id ───────────────────────────────
  static async updateById(
    id: number,
    data: { bin_code: string; capacity: number; updated_by: number },
  ): Promise<Bin | null> {
    const result = await pool.query(
      `UPDATE bins
       SET bin_code = $1, capacity = $2, updated_by = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
      [data.bin_code, data.capacity, data.updated_by, id],
    );
    return result.rows[0] ?? null;
  }

  // ── PATCH deactivate (with stock guard) ───────────────────────────────────
  static async deactivate(id: number, updatedBy: number): Promise<void> {
    const stockCheck = await pool.query(
      `SELECT COALESCE(SUM(quantity), 0) AS stock
       FROM item_locations
       WHERE bin_id = $1 AND allocation_status = 'allocated'`,
      [id],
    );
    if (Number(stockCheck.rows[0].stock) > 0) {
      const err: any = new Error("Cannot deactivate bin with active stock.");
      err.statusCode = 400;
      throw err;
    }

    await pool.query(
      `UPDATE bins SET is_active = false, updated_by = $1, updated_at = NOW() WHERE id = $2`,
      [updatedBy, id],
    );
  }

  // ── PATCH reactivate ──────────────────────────────────────────────────────
  static async reactivate(id: number, updatedBy: number): Promise<void> {
    await pool.query(
      `UPDATE bins SET is_active = true, updated_by = $1, updated_at = NOW() WHERE id = $2`,
      [updatedBy, id],
    );
  }

  // ── GET /api/warehouses/:warehouseId/item-locations ─────────────────────────
  static async findItemLocationsByWarehouse(
    warehouseId: number,
  ): Promise<any[]> {
    const result = await pool.query(
      `SELECT
         il.id,
         il.item_id,
         ii.sku,
         ii.name AS item_name,
         ii.category,
         il.quantity,
         il.bin_id,
         b.bin_code,
         il.allocation_status AS status,
         COALESCE(b.bin_code, 'Unallocated') AS current_bin
       FROM item_locations il
       INNER JOIN inventory_items ii ON il.item_id = ii.id
       LEFT JOIN bins b ON il.bin_id = b.id
       LEFT JOIN locations l ON b.location_id = l.id
       WHERE l.warehouse_id = $1
         AND ii.is_active = true
         AND il.allocation_status = 'allocated'
         AND il.quantity > 0  
       ORDER BY ii.sku, current_bin`,
      [warehouseId],
    );
    return result.rows;
  }

  // ── POST /api/warehouses/bins/:binId/assign (manual assignment) ───────────
  static async assignItem(
    binId: number,
    data: { item_id: number; quantity: number; assigned_by: number },
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Pre-flight: item active?
      const itemCheck = await client.query(
        `SELECT id FROM inventory_items WHERE id = $1 AND is_active = true`,
        [data.item_id],
      );
      if (!itemCheck.rows[0]) {
        const err: any = new Error("Item not found or inactive");
        err.statusCode = 400;
        throw err;
      }

      // Pre-flight: bin has space?
      const binCheck = await client.query(
        `SELECT (capacity - current_occupancy) AS available_space
         FROM bins WHERE id = $1 AND is_active = true`,
        [binId],
      );
      if (!binCheck.rows[0]) {
        const err: any = new Error("Bin not found or inactive");
        err.statusCode = 400;
        throw err;
      }
      if (Number(binCheck.rows[0].available_space) < data.quantity) {
        const err: any = new Error(
          `Bin has insufficient space (available: ${binCheck.rows[0].available_space})`,
        );
        err.statusCode = 400;
        throw err;
      }

      await client.query(
        `INSERT INTO item_locations (item_id, bin_id, quantity, allocation_status, source, receipt_line_id, allocated_by, allocated_at, created_by)
         VALUES ($1, $2, $3, 'allocated', 'manual', NULL, $4, NOW(), $4)
         ON CONFLICT (item_id, bin_id)
         DO UPDATE SET quantity = item_locations.quantity + EXCLUDED.quantity, updated_at = NOW()`,
        [data.item_id, binId, data.quantity, data.assigned_by],
      );

      await client.query(
        `UPDATE bins SET current_occupancy = current_occupancy + $1, updated_at = NOW() WHERE id = $2`,
        [data.quantity, binId],
      );

      await client.query(
        `INSERT INTO inventory_stock (item_id, warehouse_location_id, quantity)
         SELECT $1, b.location_id, $2 FROM bins b WHERE b.id = $3
         ON CONFLICT (item_id, warehouse_location_id)
         DO UPDATE SET quantity = inventory_stock.quantity + $2, updated_at = NOW()`,
        [data.item_id, data.quantity, binId],
      );

      const seqResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_seq FROM inventory_transactions`,
      );
      const txnNumber = `TXN-${String(seqResult.rows[0].next_seq).padStart(6, "0")}`;

      await client.query(
        `INSERT INTO inventory_transactions (transaction_number, item_id, type, quantity, reason, reference_id, employee_id)
         VALUES ($1, $2, 'in', $3, 'Manual assignment', NULL, $4)`,
        [txnNumber, data.item_id, data.quantity, data.assigned_by],
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── POST /api/warehouses/bins/transfer (bin-to-bin) ──────────────────────
  static async transferItem(data: {
    item_id: number;
    from_bin_id: number;
    to_bin_id: number;
    quantity: number;
    transferred_by: number;
    reason?: string;
  }): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Pre-flight: source stock
      const srcStock = await client.query(
        `SELECT COALESCE(SUM(quantity), 0) AS current_stock
         FROM item_locations
         WHERE item_id = $1 AND bin_id = $2 AND allocation_status = 'allocated'`,
        [data.item_id, data.from_bin_id],
      );
      if (Number(srcStock.rows[0].current_stock) < data.quantity) {
        const err: any = new Error("Insufficient stock in source bin");
        err.statusCode = 400;
        throw err;
      }

      // Pre-flight: destination space
      const dstBin = await client.query(
        `SELECT (capacity - current_occupancy) AS available_space
         FROM bins WHERE id = $1 AND is_active = true`,
        [data.to_bin_id],
      );
      if (!dstBin.rows[0]) {
        const err: any = new Error("Destination bin not found or inactive");
        err.statusCode = 400;
        throw err;
      }
      if (Number(dstBin.rows[0].available_space) < data.quantity) {
        const err: any = new Error("Destination bin has insufficient space");
        err.statusCode = 400;
        throw err;
      }

      // Deduct from source
      await client.query(
        `UPDATE item_locations
         SET quantity = quantity - $1, updated_at = NOW()
         WHERE item_id = $2 AND bin_id = $3 AND allocation_status = 'allocated'`,
        [data.quantity, data.item_id, data.from_bin_id],
      );

      // Add to / upsert into destination
      await client.query(
        `INSERT INTO item_locations (item_id, bin_id, quantity, allocation_status, source, receipt_line_id, allocated_by, allocated_at, created_by)
         VALUES ($1, $2, $3, 'allocated', 'manual', NULL, $4, NOW(), $4)
         ON CONFLICT (item_id, bin_id)
         DO UPDATE SET quantity = item_locations.quantity + $3, updated_at = NOW()`,
        [data.item_id, data.to_bin_id, data.quantity, data.transferred_by],
      );

      // Update bin occupancy
      await client.query(
        `UPDATE bins SET current_occupancy = current_occupancy - $1, updated_at = NOW() WHERE id = $2`,
        [data.quantity, data.from_bin_id],
      );
      await client.query(
        `UPDATE bins SET current_occupancy = current_occupancy + $1, updated_at = NOW() WHERE id = $2`,
        [data.quantity, data.to_bin_id],
      );

      // Update inventory_stock for source location
      await client.query(
        `UPDATE inventory_stock
         SET quantity = quantity - $1, updated_at = NOW()
         WHERE item_id = $2
           AND warehouse_location_id = (SELECT location_id FROM bins WHERE id = $3)`,
        [data.quantity, data.item_id, data.from_bin_id],
      );

      // Upsert inventory_stock for destination location
      await client.query(
        `INSERT INTO inventory_stock (item_id, warehouse_location_id, quantity)
         SELECT $1, b.location_id, $2 FROM bins b WHERE b.id = $3
         ON CONFLICT (item_id, warehouse_location_id)
         DO UPDATE SET quantity = inventory_stock.quantity + $2, updated_at = NOW()`,
        [data.item_id, data.quantity, data.to_bin_id],
      );

      // Log transfer
      await client.query(
        `INSERT INTO bin_transfer_logs (item_id, from_bin_id, to_bin_id, quantity, reason, transferred_by)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [
          data.item_id,
          data.from_bin_id,
          data.to_bin_id,
          data.quantity,
          data.reason ?? null,
          data.transferred_by,
        ],
      );

      const seqResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_seq FROM inventory_transactions`,
      );
      const txnNumber = `TXN-${String(seqResult.rows[0].next_seq).padStart(6, "0")}`;

      await client.query(
        `INSERT INTO inventory_transactions (transaction_number, item_id, type, quantity, reason, reference_id, employee_id)
         VALUES ($1, $2, 'transfer', $3, $4, NULL, $5)`,
        [
          txnNumber,
          data.item_id,
          data.quantity,
          data.reason ?? "Bin-to-bin transfer",
          data.transferred_by,
        ],
      );

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
