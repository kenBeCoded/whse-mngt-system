import pool from "../config/database.js";
import { Warehouse } from "../types/index.js";

export class WarehouseModel {
  // ── POST /api/warehouses ──────────────────────────────────────────────────
  static async create(data: {
    name: string;
    address: string;
    longitude?: number;
    latitude?: number;
    total_capacity: number;
    created_by: number;
  }): Promise<Warehouse> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const result = await client.query(
        `INSERT INTO warehouse (code, name, address, longitude, latitude, total_capacity, is_active, created_by)
         VALUES ('WH-PENDING', $1, $2, $3, $4, $5, true, $6)
         RETURNING id`,
        [
          data.name,
          data.address,
          data.longitude ?? null,
          data.latitude ?? null,
          data.total_capacity,
          data.created_by,
        ]
      );
      const whId: number = result.rows[0].id;

      await client.query(
        `UPDATE warehouse
         SET code = CONCAT('WH-', LPAD($1::text, 6, '0')), updated_at = NOW()
         WHERE id = $1`,
        [whId]
      );

      await client.query("COMMIT");

      const final = await pool.query(
        `SELECT * FROM warehouse WHERE id = $1`,
        [whId]
      );
      return final.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── GET /api/warehouses ───────────────────────────────────────────────────
  static async findAll(): Promise<any[]> {
    const result = await pool.query(
      `SELECT
           w.id, w.code, w.name, w.address, w.is_active, w.total_capacity,
           w.longitude, w.latitude, w.created_at, w.updated_at,
           (SELECT COUNT(*) FROM bins b
            JOIN locations l ON l.id = b.location_id
            WHERE l.warehouse_id = w.id AND b.is_active = true) AS active_bins
       FROM warehouse w
       WHERE w.is_active = true
       ORDER BY w.code`
    );
    return result.rows;
  }

  // ── GET /api/warehouses/:id ───────────────────────────────────────────────
  static async findById(id: number): Promise<any | null> {
    const result = await pool.query(
      `SELECT
           w.id, w.code, w.name, w.address, w.is_active, w.total_capacity,
           w.longitude, w.latitude, w.created_at, w.updated_at,
           (SELECT COUNT(*) FROM bins b
            JOIN locations l ON l.id = b.location_id
            WHERE l.warehouse_id = w.id AND b.is_active = true) AS active_bins
       FROM warehouse w
       WHERE w.id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  // ── PUT /api/warehouses/:id ───────────────────────────────────────────────
  static async updateById(
    id: number,
    data: {
      name: string;
      address: string;
      longitude?: number;
      latitude?: number;
      total_capacity: number;
      updated_by: number;
    }
  ): Promise<Warehouse | null> {
    const result = await pool.query(
      `UPDATE warehouse
       SET name = $1, address = $2, longitude = $3, latitude = $4,
           total_capacity = $5, updated_by = $6, updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        data.name,
        data.address,
        data.longitude ?? null,
        data.latitude ?? null,
        data.total_capacity,
        data.updated_by,
        id,
      ]
    );
    return result.rows[0] ?? null;
  }

  // ── PATCH /api/warehouses/:id/deactivate ──────────────────────────────────
  static async deactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE warehouse SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  // ── PATCH /api/warehouses/:id/reactivate ──────────────────────────────────
  static async reactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE warehouse SET is_active = true, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  // ── GET /api/warehouses/:warehouseId/unallocated ──────────────────────────
  static async getUnallocated(warehouseId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT
           il.id,
           il.item_id,
           ii.name AS item_name,
           ii.sku,
           il.quantity,
           il.allocation_status,
           pr.received_at,
           w.name AS warehouse_name,
           po.po_number AS po_reference,
           s.name AS supplier
       FROM item_locations il
       JOIN inventory_items ii    ON il.item_id         = ii.id
       JOIN po_receipt_lines prl  ON il.receipt_line_id = prl.id
       JOIN po_receipts pr        ON prl.receipt_id     = pr.id
       JOIN warehouse w           ON pr.warehouse_id    = w.id
       JOIN purchase_order po     ON pr.po_id           = po.id
       JOIN suppliers s           ON po.supplier_id     = s.id
       WHERE il.allocation_status = 'unallocated'
         AND pr.warehouse_id = $1`,
      [warehouseId]
    );
    return result.rows;
  }
}
