import { PoolClient } from "pg";
import pool from "../config/database.js";
import { UserModel } from "./User.js";
import { formatDateToYYYYMMDD } from "../utils/formatDate.js";

export class Attendance {
  private static async create_attendance_img(
    data: {
      image_url: string; // url from supabase
      record_type: string; // check_in or check_out
      user_id: number;
      image_capture_date?: string; // from metadata of image
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

  static async get_attendance_records() {
    try {
      const insertQuery = `
      SELECT
          ar.id,
          ar.attendance_date,
          ar.check_in_time,
          ar.check_out_time,
          ar.is_audited,
          ar.status,
          u.username,
          u.user_account_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.gender,
          u.user_profile_image_url,
          u.role,
          ci.image_url AS check_in_image_url,
          co.image_url AS check_out_image_url
      FROM
          attendance_records ar
          LEFT JOIN users u ON ar.user_id = u.id
          LEFT JOIN attendance_images ci ON ar.check_in_image_id = ci.id
          LEFT JOIN attendance_images co ON ar.check_out_image_id = co.id;
      `;

      const result = await pool.query(insertQuery);

      return result.rows || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  static async get_attendance_records_byID(id: number) {
    try {
      const insertQuery = `
      SELECT ar.id,
          ar.attendance_date,
          ar.check_in_time,
          ar.check_out_time,
          ar.is_audited,
          ar.status,
          u.username,
          u.user_account_id,
          u.first_name,
          u.middle_name,
          u.last_name,
          u.gender,
          u.user_profile_image_url,
          u.role,
          ci.image_url AS check_in_image_url,
          co.image_url AS check_out_image_url
      FROM attendance_records ar
          LEFT JOIN users u ON ar.user_id = u.id
          LEFT JOIN attendance_images ci ON ar.check_in_image_id = ci.id
          LEFT JOIN attendance_images co ON ar.check_out_image_id = co.id
      WHERE ar.user_id = $1;
      `;

      const result = await pool.query(insertQuery, [id]);
      return result.rows || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  static async create_attendance_records(data: {
    username: string;
    image_url: string; // url from supabase
    record_type: string; // check_in or check_out
    update_code: number;
    selected_date: string;
    image_capture_date?: string; // from metadata of image
  }) {
    /**
     * Create or update attendance records based on update_code.
     * update_code: 0 = create (check-in submitted)
     * 1 = check-in update
     * 2 = check-out update
     */
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const user = await UserModel.findByUsername(data.username);
      if (!user) {
        await client.query("ROLLBACK");
        return { message: "user not found" };
      }

      // Variable to hold the newly created image row
      let imageRow: any;
      let attendanceRecord;

      // Derive the attendance_date (DATE) from image_capture_date if provided, else use current date
      const attendanceDateObj = data.image_capture_date
        ? new Date(data.image_capture_date)
        : new Date();
      const attendance_date = attendanceDateObj.toLocaleString().split("T")[0];

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
            status,
            u_sched_in,
            u_sched_out
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
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
          user.u_sched_in,
          user.u_sched_out,
        ];
        const res = await client.query(insertQ, vals);
        return res.rows[0];
      };

      const targetDate = formatDateToYYYYMMDD(new Date(data.selected_date));

      // First check if record exists
      const checkQuery = `
            SELECT id FROM attendance_records
            WHERE user_id = $1 AND attendance_date = $2;
          `;
      const { rowCount: checkRowCount } = await client.query(checkQuery, [
        user.id,
        targetDate,
      ]);

      // Use a switch statement for update_code logic
      switch (data.update_code) {
        case 0:
          // create (check-in submitted)
          // Create Image Record
          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client
          );

          attendanceRecord = await createRecord({
            check_in_image_id: imageRow.id,
            check_in_time: imageTimestamp,
            status: "pending",
          });
          break;

        case 1:
          // check-in update
          if (checkRowCount === 0) {
            // No existing record found, rollback and throw error
            await client.query("ROLLBACK");
            throw new Error(
              `No attendance record found for user ${user.id} on ${targetDate}. Cannot check out without checking in first.`
            );
          }

          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client
          );

          const updateQ1 = `
            UPDATE attendance_records
            SET check_in_image_id = $1,
                check_in_time = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3 AND attendance_date = $4
            RETURNING *;
          `;
          const res1 = await client.query(updateQ1, [
            imageRow.id,
            imageTimestamp,
            user.id,
            targetDate,
          ]);

          if (res1.rowCount === 0) {
            // No existing record -> create one
            attendanceRecord = await createRecord({
              check_in_image_id: imageRow.id,
              check_in_time: imageTimestamp,
              status: "pending",
            });
          } else {
            attendanceRecord = res1.rows[0];
          }
          break;

        case 2:
          if (checkRowCount === 0) {
            // No existing record found, rollback and throw error
            await client.query("ROLLBACK");
            throw new Error(
              `No attendance record found for user ${user.id} on ${targetDate}. Cannot check out without checking in first.`
            );
          }

          // Record exists, create image
          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client
          );

          const updateQ2 = `
            UPDATE attendance_records
            SET check_out_image_id = $1,
                check_out_time = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3 AND attendance_date = $4
            RETURNING *;
          `;
          const res2 = await client.query(updateQ2, [
            imageRow.id,
            imageTimestamp,
            user.id,
            targetDate,
          ]);

          attendanceRecord = res2.rows[0];
          break;

        default:
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

  static async audit_attendance_update(data: {
    update_code: number;
    attendance_date: string;
    id: number;
    u_sched_in: string;
    u_sched_out: string;
    idArr: number[];
    ot_hours: number;
  }): Promise<any> {
    /**
     * update code:
     * 0 - update status to pass
     * 1 - update status to fail
     * 2 - revert status to pending (delete images and reset check-in/out data)
     * 3 - update attendance record schedule
     * 4 - update overtime (multiple or single)
     */

    const disallowedCodes = [0, 1, 2, 3, 4];

    if (!disallowedCodes.includes(data.update_code)) {
      throw new Error(
        `Missing or unsupported update code: ${data.update_code}`
      );
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let result;

      switch (data.update_code) {
        // update status to pass
        case 0:
          if (!data.id || !data.attendance_date) {
            return {
              success: false,
              message: "attendance date and id are required",
            };
          }

          // Update status to 'pass' and set is_audited to true
          const updateQuery0 = `
          UPDATE attendance_records
          SET is_audited = $1,
              status = $2
          WHERE id = $3 AND attendance_date = $4
          RETURNING *;
        `;
          result = await client.query(updateQuery0, [
            true,
            "pass",
            data.id,
            data.attendance_date,
          ]);
          break;

        // update status to fail
        case 1:
          if (!data.id || !data.attendance_date) {
            return {
              success: false,
              message: "attendance date and id are required",
            };
          }

          // Update status to 'fail' and set is_audited to true
          const updateQuery1 = `
          UPDATE attendance_records
          SET is_audited = $1,
              status = $2
          WHERE id = $3 AND attendance_date = $4
          RETURNING *;
        `;
          result = await client.query(updateQuery1, [
            true,
            "fail",
            data.id,
            data.attendance_date,
          ]);
          break;

        // revert status to pending (delete images and reset check-in/out data)
        case 2:
          if (!data.id || !data.attendance_date) {
            return {
              success: false,
              message: "attendance date and id are required",
            };
          }

          // First, get the image IDs to delete
          const getImagesQuery = `
          SELECT check_in_image_id, check_out_image_id
          FROM attendance_records
          WHERE id = $1 AND attendance_date = $2;
        `;
          const recordResult = await client.query(getImagesQuery, [
            data.id,
            data.attendance_date,
          ]);

          if (recordResult.rows.length === 0) {
            throw new Error(`No attendance record found for id: ${data.id}`);
          }

          const { check_in_image_id, check_out_image_id } =
            recordResult.rows[0];

          // Update attendance record: revert to pending and null out check-in/out fields
          const updateQuery2 = `
          UPDATE attendance_records
          SET is_audited = $1,
              status = $2,
              check_in_image_id = NULL,
              check_in_time = NULL,
              check_out_image_id = NULL,
              check_out_time = NULL,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3 AND attendance_date = $4
          RETURNING *;
        `;
          result = await client.query(updateQuery2, [
            false,
            "pending",
            data.id,
            data.attendance_date,
          ]);

          // Delete images from attendance_images table if they exist
          if (check_in_image_id) {
            await client.query(`DELETE FROM attendance_images WHERE id = $1`, [
              check_in_image_id,
            ]);
          }

          if (check_out_image_id) {
            await client.query(`DELETE FROM attendance_images WHERE id = $1`, [
              check_out_image_id,
            ]);
          }

          break;

        // update attendance record schedule
        case 3:
          if (
            !data.u_sched_in ||
            !data.u_sched_out ||
            !data.id ||
            !data.attendance_date
          ) {
            return {
              success: false,
              message:
                "schedule in & out, attendance date, and id are required",
            };
          }

          const updateSchedQuery = `
          UPDATE attendance_records
          SET u_sched_in = $1,
              u_sched_out = $2
          WHERE id = $3 AND attendance_date = $4
          RETURNING *;
        `;

          result = await client.query(updateSchedQuery, [
            data.u_sched_in,
            data.u_sched_out,
            data.id,
            data.attendance_date,
          ]);

          break;

        // update overtime single or multiple dates selected
        case 4:
          if (!data.ot_hours || !data.idArr) {
            return {
              success: false,
              message: "overtime hours and id are required",
            };
          }

          const updateOtQuery = `
          UPDATE ot_sched
          SET ot_hours = $1
          WHERE id = ANY($2::int[])
          `;

          result = await client.query(updateOtQuery, [
            data.ot_hours,
            data.idArr,
          ]);

          break;

        default:
          throw new Error(`Unsupported update_code: ${data.update_code}`);
      }

      await client.query("COMMIT");
      return result.rows[0] || null;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("audit_attendance_update failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }

  static async reset_attendance_record(data: { id: number }) {
    try {
      const insertQuery = `
      UPDATE ATTENDANCE_RECORDS
      SET
        CHECK_IN_IMAGE_ID = NULL,
        CHECK_IN_TIME = NULL,
        CHECK_OUT_IMAGE_ID = NULL,
        CHECK_OUT_TIME = NULL,
        IS_AUDITED = FALSE,
        STATUS = 'pending'
      WHERE
        ID = $1
      RETURNING
        *
      `;

      const { rowCount, rows } = await pool.query(insertQuery, [data.id]);

      if (rowCount === 0) {
        throw new Error(`No attendance record found to update!`);
      }

      return rows[0] || null;
    } catch (error) {
      console.error("reset_attendance_record:", error);
      throw error;
    }
  }
}
