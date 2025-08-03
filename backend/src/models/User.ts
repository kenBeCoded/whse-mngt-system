import pool from "../config/database.js";
import bcrypt from "bcrypt";
import { User } from "../types/index.js";

// TODO PRIO : need put all of func try catch

type UserWithoutPassword = Omit<User, "password_hash">;

export class UserModel {
  // create user account
  static async create(
    userData: Omit<
      User,
      "id" | "created_at" | "updated_at" | "password_hash"
    > & {
      password: string;
      role?: string;
    }
  ): Promise<User> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // ensure the sequence is set correctly
      await client.query(
        "SELECT setval('users_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);"
      );

      await client.query(
        "SELECT setval('user_account_id_seq', COALESCE((SELECT MAX(id) FROM users), 0) + 1, false);"
      );

      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const query = `
        INSERT INTO users (username, password_hash, email, first_name, middle_name, last_name, gender, user_profile_image_url, role)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING username, email, first_name, middle_name, last_name, gender, user_profile_image_url
      `;

      const result = await client.query(query, [
        userData.username,
        hashedPassword,
        userData.email,
        userData.first_name,
        userData.middle_name,
        userData.last_name,
        userData.gender,
        userData.user_profile_image_url,
        userData.role ? userData.role : "employee",
      ]);

      await client.query("COMMIT");
      return result.rows[0];
    } catch (error: any) {
      await client.query("ROLLBACK");

      if (error.code === "23505") {
        // PostgreSQL unique constraint violation
        throw new Error("Username or email already exists");
      }
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    } finally {
      client.release();
    }
  }

  // get all users
  static async findAllUsernames(): Promise<UserWithoutPassword[]> {
    const query =
      "SELECT username, user_account_id, email, first_name, middle_name, last_name, gender, user_profile_image_url, role, updated_at FROM users WHERE is_deleted = FALSE";
    const result = await pool.query(query);
    return result.rows || null;
  }

  static async findByUsername(username: string): Promise<User | null> {
    const query =
      "SELECT user_account_id, username, password_hash, email, first_name, middle_name, last_name, gender, user_profile_image_url, created_at, updated_at FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0] || null;
  }

  static async findById(id: number): Promise<User | null> {
    const query =
      "SELECT user_account_id, username, email, first_name, middle_name, last_name, gender, user_profile_image_url, created_at, updated_at FROM users WHERE id = $1";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async getIdByUsername(username: string): Promise<number | null> {
    const query = "SELECT id FROM users WHERE username = $1";
    const result = await pool.query(query, [username]);
    return result.rows[0]?.id || null;
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
    const query =
      "UPDATE users SET is_deleted = TRUE WHERE id = $1 RETURNING id";
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async validatePassword(
    user: User,
    password: string
  ): Promise<boolean> {
    return bcrypt.compare(password, user.password_hash);
  }
}
