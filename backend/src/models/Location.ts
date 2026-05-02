import pool from "../config/database.js";
import { Location } from "../types/index.js";

export class LocationModel {
  // ── POST /api/warehouses/:warehouseId/locations ───────────────────────────
  static async create(data: {
    warehouse_id: number;
    zone: string;
    row: string;
    aisle: string;
    bay: string;
    created_by: number;
  }): Promise<Location> {
    const result = await pool.query(
      `INSERT INTO locations (warehouse_id, zone, row, aisle, bay, is_active, created_by)
       VALUES ($1, $2, $3, $4, $5, true, $6)
       RETURNING *`,
      [data.warehouse_id, data.zone, data.row, data.aisle, data.bay, data.created_by]
    );
    return result.rows[0];
  }

  // ── GET /api/warehouses/:warehouseId/locations ────────────────────────────
  static async findAllByWarehouse(warehouseId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT
           l.id, l.zone, l.row, l.aisle, l.bay, l.is_active,
           l.warehouse_id, l.created_at, l.updated_at,
           (SELECT COUNT(*) FROM bins b WHERE b.location_id = l.id AND b.is_active = true) AS bin_count,
           uc.first_name || ' ' || uc.last_name AS created_by,
           uu.first_name || ' ' || uu.last_name AS updated_by
       FROM locations l
       JOIN users uc ON uc.id = l.created_by
       LEFT JOIN users uu ON uu.id = l.updated_by
       WHERE l.warehouse_id = $1
       ORDER BY l.zone, l.row, l.aisle, l.bay`,
      [warehouseId]
    );
    return result.rows;
  }

  // ── PUT /api/warehouses/:warehouseId/locations/:id ────────────────────────
  static async updateById(
    id: number,
    data: {
      zone: string;
      row: string;
      aisle: string;
      bay: string;
      updated_by: number;
    }
  ): Promise<Location | null> {
    const result = await pool.query(
      `UPDATE locations
       SET zone = $1, row = $2, aisle = $3, bay = $4, updated_by = $5, updated_at = NOW()
       WHERE id = $6
       RETURNING *`,
      [data.zone, data.row, data.aisle, data.bay, data.updated_by, id]
    );
    return result.rows[0] ?? null;
  }

  // ── PATCH deactivate ──────────────────────────────────────────────────────
  static async deactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE locations SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }

  // ── PATCH reactivate ──────────────────────────────────────────────────────
  static async reactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE locations SET is_active = true, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }
}
