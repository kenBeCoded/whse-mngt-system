import pool from "../config/database.js";
import bcrypt from "bcrypt";
import { User } from "../types/index.js";
import { QueryResult } from "pg";

// TODO PRIO : need put all of func try catch

type UserWithoutPassword = Omit<User, "password">;

export class UserModel {
  // create user account
  static async create(username: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 12);
      const query = `
        INSERT INTO users (username, password)
        VALUES ($1, $2)
        RETURNING id, username, created_at, updated_at
    `;

      const result = await pool.query(query, [username, hashedPassword]);

      return result.rows[0];
    } catch (error: any) {
      await pool.query(
        "SELECT setval('users_id_seq', (SELECT COALESCE(MAX(id), 0) FROM users));"
      );
      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        throw new Error("Username already exists");
      }
      throw new Error("Failed to create user");
    }
  }

  // get all users
  static async findAllUsernames(): Promise<UserWithoutPassword[]> {
    const query = "SELECT id, username, created_at, updated_at FROM users";
    const result = await pool.query(query);
    return result.rows || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query = "SELECT * FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const query =
      "SELECT id, username, created_at, updated_at FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateById(
    id: number,
    updates: Partial<User>
  ): Promise<User | null> {
    const fields = Object.keys(updates).filter((key) => key !== "id");
    const values = fields.map((field) => updates[field as keyof User]);

    if (fields.length === 0) return null;

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const query = `
      UPDATE users
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING id, username,  created_at, updated_at
    `;

    const result = await pool.query(query, [id, ...values]);
    return result.rows[0] || null;
  }

  // TODO: set this as update the is_deleted
  static async deleteById(id: number): Promise<void> {
    const query = "DELETE FROM users WHERE id = $1";
    const result: QueryResult<any> | null = await pool.query(query, [id]);
    // return result.rowCount > 0;
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password);
  }
}
