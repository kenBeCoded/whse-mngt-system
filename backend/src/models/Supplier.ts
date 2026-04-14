import pool from "../config/database.js";
import { Supplier } from "../types/index.js";

export class SupplierModel {
  // ── POST /api/suppliers ──────────────────────────────────────────────────
  static async create(
    data: Pick<Supplier, "name" | "email" | "created_by"> & {
      address?: string;
    },
  ): Promise<Supplier> {
    const client = await pool.connect();
    try {
      const dupCheck = await client.query(
        `SELECT id FROM suppliers WHERE email = $1`,
        [data.email],
      );
      if (dupCheck.rowCount && dupCheck.rowCount > 0) {
        const err: any = new Error("Supplier email already exists");
        err.statusCode = 409;
        throw err;
      }

      const result = await client.query(
        `INSERT INTO suppliers (name, email, address, created_by)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [data.name, data.email, data.address ?? null, data.created_by],
      );
      return result.rows[0];
    } finally {
      client.release();
    }
  }

  // ── GET /api/suppliers ───────────────────────────────────────────────────
  static async findAll(): Promise<Supplier[]> {
    const result = await pool.query(
      `SELECT * FROM suppliers WHERE is_active = true ORDER BY name`,
    );
    return result.rows;
  }

  // ── GET /api/suppliers/:id ───────────────────────────────────────────────
  static async findById(id: number): Promise<Supplier | null> {
    const result = await pool.query(`SELECT * FROM suppliers WHERE id = $1`, [
      id,
    ]);
    return result.rows[0] ?? null;
  }

  // ── PUT /api/suppliers/:id ───────────────────────────────────────────────
  static async updateById(
    id: number,
    data: {
      name?: string;
      email?: string;
      address?: string;
      updated_by: number;
    },
  ): Promise<Supplier | null> {
    // 1. Fetch existing supplier
    const { rows } = await pool.query(`SELECT * FROM suppliers WHERE id = $1`, [
      id,
    ]);

    const existing = rows[0];
    if (!existing) return null;

    // 2. Define updatable fields
    const updatableFields: (keyof typeof data)[] = ["name", "email", "address"];

    const fields: string[] = [];
    const values: any[] = [];
    let index = 1;

    // 3. Dynamically compare fields
    for (const field of updatableFields) {
      const newValue = data[field];

      if (newValue !== undefined && newValue !== existing[field]) {
        fields.push(`${field} = $${index}`);
        values.push(newValue);
        index++;
      }
    }

    // 4. If no changes, return existing
    if (fields.length === 0) {
      return existing;
    }

    // 5. Always update metadata
    fields.push(`updated_by = $${index}`);
    values.push(data.updated_by);
    index++;

    fields.push(`updated_at = NOW()`);

    // 6. Add WHERE condition
    values.push(id);
    const query = `
    UPDATE suppliers
    SET ${fields.join(", ")}
    WHERE id = $${index}
    RETURNING *
  `;

    const result = await pool.query(query, values);
    return result.rows[0] ?? null;
  }

  // ── PATCH /api/suppliers/:id/deactivate ──────────────────────────────────
  static async deactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE suppliers SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id],
    );
  }
  // ── PATCH /api/suppliers/:id/reactivate ──────────────────────────────────
  static async reactivate(id: number): Promise<void> {
    await pool.query(
      `UPDATE suppliers SET is_active = false, updated_at = NOW() WHERE id = $1`,
      [id],
    );
  }
}
