import pool from "../config/database.js";
import { InventoryItem } from "../types/index.js";

export class InventoryModel {
  // ── POST /api/inventory/items ────────────────────────────────────────────
  static async create(
    data: Omit<InventoryItem, "id" | "is_active" | "created_at" | "updated_at">
  ): Promise<InventoryItem> {
    const client = await pool.connect();
    try {
      // Duplicate check
      const dupCheck = await client.query(
        `SELECT id FROM inventory_items WHERE item_number = $1 OR sku = $2`,
        [data.item_number, data.sku]
      );
      if (dupCheck.rowCount && dupCheck.rowCount > 0) {
        const err: any = new Error("item_number or sku already exists");
        err.statusCode = 409;
        throw err;
      }

      const result = await client.query(
        `INSERT INTO inventory_items (
            item_number, sku, name, description,
            category, unit_of_measure, default_unit_price, created_by
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          data.item_number,
          data.sku,
          data.name,
          data.description ?? null,
          data.category ?? null,
          data.unit_of_measure,
          data.default_unit_price ?? null,
          data.created_by,
        ]
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ── GET /api/inventory/items ─────────────────────────────────────────────
  static async findAll(): Promise<InventoryItem[]> {
    const result = await pool.query(
      `SELECT * FROM inventory_items WHERE is_active = true ORDER BY item_number`
    );
    return result.rows;
  }

  // ── GET /api/inventory/items/:id ─────────────────────────────────────────
  static async findById(id: number): Promise<InventoryItem | null> {
    const result = await pool.query(
      `SELECT * FROM inventory_items WHERE id = $1`,
      [id]
    );
    return result.rows[0] ?? null;
  }

  // ── PUT /api/inventory/items/:id ─────────────────────────────────────────
  static async updateById(
    id: number,
    data: Omit<InventoryItem, "id" | "is_active" | "created_by" | "created_at" | "updated_at">
  ): Promise<InventoryItem | null> {
    const result = await pool.query(
      `UPDATE inventory_items
       SET
           item_number        = $1,
           sku                = $2,
           name               = $3,
           description        = $4,
           category           = $5,
           unit_of_measure    = $6,
           default_unit_price = $7,
           updated_at         = NOW()
       WHERE id = $8
       RETURNING *`,
      [
        data.item_number,
        data.sku,
        data.name,
        data.description ?? null,
        data.category ?? null,
        data.unit_of_measure,
        data.default_unit_price ?? null,
        id,
      ]
    );
    return result.rows[0] ?? null;
  }

  // ── PATCH /api/inventory/items/:id/deactivate ────────────────────────────
  static async deactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE inventory_items SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id]
    );
  }
}
