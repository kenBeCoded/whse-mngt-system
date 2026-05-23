import { PoolClient } from "pg";
import pool from "../config/database.js";
import { UserModel } from "./User.js";
import { formatDateToYYYYMMDD } from "../utils/formatDate.js";

interface AttendanceQueryOptions {
  userId?: number;
  selectedDate?: string;
  includeOT?: boolean;
  includeUserDetails?: boolean;
}

const buildAttendanceQuery = (options: AttendanceQueryOptions) => {
  const params: any[] = [];
  let idx = 1;

  let query = `
    SELECT 
      ar.id,
      ar.attendance_date,
      ar.check_in_time,
      ar.check_out_time,
      ar.is_audited,
      ar.status,
      ar.user_id,
      ar.u_sched_in,
      ar.u_sched_out,
      ar.ot_id,
      ar.created_at,
      ar.updated_at
      ${
        options.includeOT
          ? `,
        os.ot_hours,
        os.added_by AS ot_added_by,
        os.created_at AS ot_created_at`
          : ""
      }
      ${
        options.includeUserDetails
          ? `,
        u.username,
        u.user_account_id,
        u.first_name,
        u.middle_name,
        u.last_name,
        u.gender,
        u.user_profile_image_url,
        u.role,
        ci.image_url AS check_in_image_url,
        co.image_url AS check_out_image_url`
          : ""
      }
    FROM attendance_records ar
  `;

  if (options.includeOT) {
    query += `
      LEFT JOIN ot_sched os ON ar.ot_id = os.id
    `;
  }

  if (options.includeUserDetails) {
    query += `
      LEFT JOIN users u ON ar.user_id = u.id
      LEFT JOIN attendance_images ci ON ar.check_in_image_id = ci.id
      LEFT JOIN attendance_images co ON ar.check_out_image_id = co.id
    `;
  }

  const whereClauses: string[] = [];

  if (options.userId) {
    whereClauses.push(`ar.user_id = $${idx}`);
    params.push(options.userId);
    idx++;
  }

  if (options.selectedDate) {
    whereClauses.push(`ar.attendance_date = $${idx}`);
    params.push(options.selectedDate);
    idx++;
  }

  if (whereClauses.length > 0) {
    query += ` WHERE ${whereClauses.join(" AND ")}`;
  }

  query += ` ORDER BY ar.attendance_date DESC`;

  return { query, params };
};

export class Attendance {
  private static async create_attendance_img(
    data: {
      image_url: string; // url from supabase
      record_type: string; // check_in or check_out
      user_id: number;
      image_capture_date?: string; // from metadata of image
    },
    clientParam?: PoolClient,
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
      const { query, params } = buildAttendanceQuery({
        includeUserDetails: true,
        includeOT: true,
      });

      const result = await pool.query(query, params);
      return result.rows || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  static async get_attendance_records_byID(
    userId: number,
    selectedDate?: string,
  ) {
    try {
      const { query, params } = buildAttendanceQuery({
        userId,
        selectedDate,
        includeUserDetails: true,
        includeOT: true,
      });

      const result = await pool.query(query, params);
      return result.rows || [];
    } catch (error: any) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }
  }

  static async get_attendance_records_with_ot(userId: number) {
    try {
      const { query, params } = buildAttendanceQuery({
        userId,
        includeOT: true,
        includeUserDetails: true,
      });

      const result = await pool.query(query, params);
      // console.log("result", result);
      // console.log("query", query);
      // console.log("params", params);
      return result.rows || [];
    } catch (error: any) {
      throw new Error(
        `Failed to fetch attendance records with overtime: ${error.message}`,
      );
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
     * update_code:
     * 0 = create/update check-in (will update if record exists, create if not)
     * 1 = check-in update
     * 2 = check-out update
     */
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const user = await UserModel.findByUsername(data.username);
      if (!user) {
        await client.query("ROLLBACK");
        throw new Error("User not found");
      }

      if (!user.u_sched_in || !user.u_sched_out) {
        await client.query("ROLLBACK");
        throw new Error(
          "The schedule is incomplete or has not been set properly.",
        );
      }

      // Variable to hold the newly created image row
      let imageRow: any;
      let attendanceRecord;

      // Derive the attendance_date (DATE) from selected_date
      const attendanceDateObj = data.selected_date
        ? new Date(data.selected_date)
        : new Date();
      const attendance_date = attendanceDateObj.toISOString().split("T")[0];

      // Use the provided image_capture_date as timestamp for check times
      const imageTimestamp = data.image_capture_date
        ? new Date(data.image_capture_date)
        : new Date();

      const targetDate = formatDateToYYYYMMDD(new Date(data.selected_date));

      // Check if record exists for this user and date
      const checkQuery = `
      SELECT id, check_in_image_id, check_out_image_id 
      FROM attendance_records
      WHERE user_id = $1 AND attendance_date = $2;
    `;
      const checkResult = await client.query(checkQuery, [user.id, targetDate]);
      const existingRecord = checkResult.rows[0];

      // Use a switch statement for update_code logic
      switch (data.update_code) {
        case 0:
          // create/update check-in
          // Create Image Record
          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client,
          );

          if (existingRecord) {
            // Update existing record
            const updateQ = `
            UPDATE attendance_records
            SET check_in_image_id = $1,
                check_in_time = $2,
                status = COALESCE(status, 'pending'),
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = $3 AND attendance_date = $4
            RETURNING *;
          `;
            const updateResult = await client.query(updateQ, [
              imageRow.id,
              imageTimestamp,
              user.id,
              targetDate,
            ]);
            attendanceRecord = updateResult.rows[0];
          } else {
            // Create new record
            const insertQ = `
            INSERT INTO attendance_records (
              user_id,
              attendance_date,
              check_in_image_id,
              check_in_time,
              status,
              u_sched_in,
              u_sched_out
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
          `;
            const insertResult = await client.query(insertQ, [
              user.id,
              attendance_date,
              imageRow.id,
              imageTimestamp,
              "pending",
              user.u_sched_in,
              user.u_sched_out,
            ]);
            attendanceRecord = insertResult.rows[0];
          }
          break;

        case 1:
          // check-in update - record must exist
          if (!existingRecord) {
            await client.query("ROLLBACK");
            throw new Error(
              `No attendance record found for user ${user.id} on ${targetDate}. Cannot update check-in.`,
            );
          }

          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client,
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
          attendanceRecord = res1.rows[0];
          break;

        case 2:
          // check-out update - record must exist
          if (!existingRecord) {
            await client.query("ROLLBACK");
            throw new Error(
              `No attendance record found for user ${user.id} on ${targetDate}. Cannot check out without checking in first.`,
            );
          }

          // Create image
          imageRow = await this.create_attendance_img(
            {
              image_url: data.image_url,
              record_type: data.record_type.toLowerCase(),
              user_id: user.id,
              image_capture_date: data.image_capture_date,
            },
            client,
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
    id?: number; // attendance_records id
    update_code: number;
    attendance_date?: string;
    dateFrom?: string;
    dateTo?: string;
    u_sched_in?: string;
    u_sched_out?: string;
    ot_idArr?: number[];
    ot_hours?: number;
    user_id?: string;
    usersIds?: number[];
    check_in_time?: string;
    check_out_time?: string;
  }): Promise<any> {
    /**
     * update code:
     * 0 - update status to pass
     * 1 - update status to fail
     * 2 - revert status to pending (delete images and reset check-in/out data)
     * 3 - update/modify attendance record schedule
     * 4 - update overtime (multiple or single)
     * 5 - update/modify attendance record check in & out and overtime
     */

    console.log("data",data)

    const allowedCodes = [0, 1, 2, 3, 4, 5];

    if (!allowedCodes.includes(data.update_code)) {
      throw new Error(
        `Missing or unsupported update code: ${data.update_code}`,
      );
    }

    // Validate required fields based on update_code
    switch (data.update_code) {
      case 0:
      case 1:
      case 2:
        if (!data.id || !data.attendance_date) {
          throw new Error("attendance_date and id are required");
        }
        break;
      case 3:
        if (
          !data.u_sched_in ||
          !data.u_sched_out ||
          !data.usersIds ||
          data.usersIds.length === 0 ||
          !data.dateFrom ||
          !data.dateTo
        ) {
          throw new Error(
            "u_sched_in, u_sched_out, usersIds, dateFrom, and dateTo are required for bulk schedule updates",
          );
        }
        break;
      case 4:
        if (!data.ot_hours || !data.ot_idArr || data.ot_idArr.length === 0) {
          throw new Error("ot_hours and ot_idArr are required");
        }
        break;
      case 5:
        if (
          !data.check_in_time ||
          !data.check_out_time ||
          !data.user_id ||
          !data.id ||
          !data.attendance_date
        ) {
          throw new Error(
            "check_in_time, check_out_time, user_id, id, and attendance_date are required",
          );
        }
        break;
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      let result;

      switch (data.update_code) {
        // update status to pass
        case 0:
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

          if (check_in_image_id) {
            await client.query(
              `UPDATE attendance_images SET is_deleted = true WHERE id = $1`,
              [check_in_image_id],
            );
          }

          if (check_out_image_id) {
            await client.query(
              `UPDATE attendance_images SET is_deleted = true WHERE id = $1`,
              [check_out_image_id],
            );
          }

          break;

        // update/modify attendance record schedule
        case 3:
          const updateSchedQuery = `
            UPDATE attendance_records
            SET 
                u_sched_in = $1,
                u_sched_out = $2
            WHERE 
                user_id = ANY($3)
                AND attendance_date::DATE BETWEEN $4::DATE AND $5::DATE
            RETURNING *;
          `;

          result = await client.query(updateSchedQuery, [
            data.u_sched_in,
            data.u_sched_out,
            data.usersIds, // Passed as an array of IDs
            data.dateFrom,
            data.dateTo,
          ]);
          break;

        // update overtime single or multiple dates selected
        case 4:
          const updateOtQuery = `
          UPDATE ot_sched
          SET ot_hours = $1
          WHERE id = ANY($2::int[])
          RETURNING *;
        `;

          result = await client.query(updateOtQuery, [
            data.ot_hours,
            data.ot_idArr,
          ]);

          break;

        // update/modify attendance record check in & out and overtime
        case 5:
          const user_id = parseInt(data.user_id!);
          const user = await UserModel.findById(user_id);
          if (!user) {
            throw new Error("User not found");
          }

          const updateAttendanceQuery = `
            UPDATE attendance_records
            SET check_in_time = $1,
                check_out_time = $2,
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $3 AND attendance_date = $4
            RETURNING *;
          `;
          const attendanceResult = await client.query(updateAttendanceQuery, [
            data.check_in_time,
            data.check_out_time,
            data.id,
            data.attendance_date,
          ]);

          if (attendanceResult.rows.length === 0) {
            throw new Error(`No attendance record found for id: ${data.id}`);
          }

          // Set result to attendance update
          result = attendanceResult;

          if (data.ot_hours) {
            const ot_id = attendanceResult.rows[0].ot_id;

            if (ot_id) {
              const updateOtQuery = `
                UPDATE ot_sched
                SET ot_hours = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *;
              `;
              await client.query(updateOtQuery, [data.ot_hours, ot_id]);
            } else {
              const insertOtQuery = `
                INSERT INTO ot_sched (added_by, ot_hours)
                VALUES ($1, $2)
                RETURNING *;
              `;
              const otResult = await client.query(insertOtQuery, [
                user_id,
                data.ot_hours,
              ]);

              const linkOtQuery = `
                UPDATE attendance_records
                SET ot_id = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
                RETURNING *;
              `;
              await client.query(linkOtQuery, [otResult.rows[0].id, data.id]);
            }
          }
          break;

        default:
          throw new Error(`Unsupported update_code: ${data.update_code}`);
      }

      await client.query("COMMIT");
      // Note: result.rows will return the array of all updated records for bulk operations

      if (result?.rows && result.rows.length > 0) {
        if (data.update_code === 3 || result.rows.length > 1) {
          return result.rows;
        }
        return result.rows[0];
      }
      return null;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("audit_attendance_update failed:", error);
      throw error;
    } finally {
      client.release();
    }
  }
}
