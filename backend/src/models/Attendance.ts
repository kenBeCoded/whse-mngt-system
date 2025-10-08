import { PoolClient } from "pg";
import pool from "../config/database.js";
import { UserModel } from "./User.js";

export class Attendance {
  /**
   * Insert an attendance image. If a client is provided, the insert will use
   * that client and will NOT manage transactions or release the client.
   * If no client is provided, this method will create its own client and
   * perform a transaction around the insert.
   */
  private static async create_attendance_img(
    data: {
      image_url: string;
      record_type: string;
      user_id: number;
      image_capture_date?: string;
    },
    clientParam?: PoolClient
  ) {
    const insertQuery = `
      INSERT INTO attendance_images (image_url, record_type, image_capture_date, user_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *;
    `;
    const values = [
      data.image_url,
      data.record_type,
      data.image_capture_date ?? null,
      data.user_id,
    ];

    if (clientParam) {
      const result = await clientParam.query(insertQuery, values);
      return result.rows[0];
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const result = await client.query(insertQuery, values);
      await client.query("COMMIT");
      return result.rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Attendance image creation failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Create or update attendance records based on update_code.
   * update_code: 0 = create (check-in submitted)
   *              1 = check-in update
   *              2 = check-out update
   */
  static async create_attendance_records(data: {
    username: string;
    image_url: string;
    record_type: string;
    image_capture_date?: string;
    update_code: number;
  }) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const user = await UserModel.findByUsername(data.username);
      if (!user) {
        await client.query("ROLLBACK");
        return { message: "user not found" };
      }

      // return console.log("user",user)

      // Insert attendance image within this transaction and get the image row
      const imageRow = await this.create_attendance_img(
        {
          image_url: data.image_url,
          record_type: data.record_type,
          user_id: user.id,
          image_capture_date: data.image_capture_date,
        },
        client
      );

      // Derive the attendance_date (DATE) from image_capture_date if provided, else use current date
      const attendanceDateObj = data.image_capture_date
        ? new Date(data.image_capture_date)
        : new Date();
      const attendance_date = attendanceDateObj.toISOString().split("T")[0];

      // Use the provided image_capture_date as timestamp for check times, else CURRENT_TIMESTAMP
      const imageTimestamp = data.image_capture_date
        ? new Date(data.image_capture_date)
        : new Date();

      // Helper: create a new attendance record (used for fallback)
      const createRecord = async (fields: {
        check_in_image_id?: number | null;
        check_in_time?: Date | null;
        check_out_image_id?: number | null;
        check_out_time?: Date | null;
        status?: string | null;
      }) => {
        const insertQ = `
          INSERT INTO attendance_records (
            user_id,
            attendance_date,
            check_in_image_id,
            check_in_time,
            check_out_image_id,
            check_out_time,
            status
          ) VALUES ($1,$2,$3,$4,$5,$6,$7)
          RETURNING *;
        `;
        const vals = [
          user.id,
          attendance_date,
          fields.check_in_image_id ?? null,
          fields.check_in_time ?? null,
          fields.check_out_image_id ?? null,
          fields.check_out_time ?? null,
          fields.status ?? null,
        ];
        const res = await client.query(insertQ, vals);
        return res.rows[0];
      };

      let attendanceRecord;

      if (data.update_code === 0) {
        // Create a new attendance record for check-in
        attendanceRecord = await createRecord({
          check_in_image_id: imageRow.id,
          check_in_time: imageTimestamp,
          status: "pending",
        });
      } else if (data.update_code === 1) {
        // Update check-in fields on existing record
        const updateQ = `
          UPDATE attendance_records
          SET check_in_image_id = $1,
              check_in_time = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $3 AND attendance_date = $4
          RETURNING *;
        `;
        const res = await client.query(updateQ, [
          imageRow.id,
          imageTimestamp,
          user.id,
          attendance_date,
        ]);
        if (res.rowCount === 0) {
          // No existing record -> create one
          attendanceRecord = await createRecord({
            check_in_image_id: imageRow.id,
            check_in_time: imageTimestamp,
            status: "pending",
          });
        } else {
          attendanceRecord = res.rows[0];
        }
      } else if (data.update_code === 2) {
        // Update check-out fields on existing record
        const updateQ = `
          UPDATE attendance_records
          SET check_out_image_id = $1,
              check_out_time = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE user_id = $3 AND attendance_date = $4
          RETURNING *;
        `;
        const res = await client.query(updateQ, [
          imageRow.id,
          imageTimestamp,
          user.id,
          attendance_date,
        ]);
        if (res.rowCount === 0) {
          // No existing record -> create one with check_out fields
          attendanceRecord = await createRecord({
            check_out_image_id: imageRow.id,
            check_out_time: imageTimestamp,
            status: "pending",
          });
        } else {
          attendanceRecord = res.rows[0];
        }
      } else {
        await client.query("ROLLBACK");
        throw new Error(`Unsupported update_code: ${data.update_code}`);
      }

      await client.query("COMMIT");
      return { image: imageRow, attendance: attendanceRecord };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("create_attendance_records failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
