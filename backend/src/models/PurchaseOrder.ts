import pool from "../config/database.js";
import { PurchaseOrder, POLineItem, POStatus } from "../types/index.js";

// Valid status transition map
const STATUS_TRANSITIONS: Record<POStatus, POStatus[]> = {
  request: ["pending", "cancelled"],
  pending: ["approved", "cancelled"],
  approved: ["preparing", "cancelled"],
  preparing: ["shipped", "cancelled"],
  shipped: ["received", "cancelled"],
  received: [],
  cancelled: [],
};

export class PurchaseOrderModel {
  // ── POST /api/purchase-orders ─────────────────────────────────────────────
  static async create(data: {
    supplier_id: number;
    warehouse_id: number;
    total_amount: number;
    created_by: number;
    line_items: POLineItem[];
    attachment_url?: string; // optional — PDF, image, etc.
    attachment_file_type?: string; // optional — e.g. pdf, jpg, png
  }): Promise<PurchaseOrder> {
    // ── 0. Validate total_amount against line_items subtotals ─────────────────
    const calculatedTotal = data.line_items.reduce(
      (sum, item) => sum + item.quantity_ordered * item.unit_price,
      0,
    );

    if (Math.abs(calculatedTotal - data.total_amount) > 0.01) {
      const err: any = new Error(
        `Total amount (${data.total_amount}) does not match the sum of line items subtotals (${calculatedTotal})`,
      );
      err.statusCode = 400;
      throw err;
    }

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Insert PO header with placeholder po_number
      const poResult = await client.query(
        `INSERT INTO purchase_order (po_number, supplier_id, warehouse_id, status, total_amount, created_by)
         VALUES ('PO-PENDING', $1, $2, 'request', $3, $4)
         RETURNING id`,
        [
          data.supplier_id,
          data.warehouse_id,
          data.total_amount,
          data.created_by,
        ],
      );
      const poId: number = poResult.rows[0].id;

      // 2. Update po_number using the inserted id
      await client.query(
        `UPDATE purchase_order
         SET po_number = CONCAT('PO-', LPAD($1::text, 6, '0')), updated_at = NOW()
         WHERE id = $1`,
        [poId],
      );

      // 3. Log initial status
      await client.query(
        `INSERT INTO po_status_logs (po_id, from_status, to_status, changed_by, remarks)
         VALUES ($1, NULL, 'request', $2, 'PO created')`,
        [poId, data.created_by],
      );

      // 4. Insert line items
      for (const line of data.line_items) {
        await client.query(
          `INSERT INTO po_line_orders (po_id, item_id, quantity_ordered, unit_price, subtotal)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            poId,
            line.item_id,
            line.quantity_ordered,
            line.unit_price,
            line.quantity_ordered * line.unit_price,
          ],
        );
      }

      // 5. Insert attachment record (only when a URL is provided)
      if (data.attachment_url && data.attachment_url.trim() !== "") {
        await client.query(
          `INSERT INTO po_attachment (po_id, file_url, file_type, uploaded_by)
           VALUES ($1, $2, $3, $4)`,
          [
            poId,
            data.attachment_url.trim(),
            data.attachment_file_type?.trim() || "unknown",
            data.created_by,
          ],
        );
      }

      await client.query("COMMIT");

      const final = await pool.query(
        `SELECT * FROM purchase_order WHERE id = $1`,
        [poId],
      );
      return final.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── GET /api/purchase-orders ──────────────────────────────────────────────
  static async findAll(): Promise<PurchaseOrder[]> {
    const result = await pool.query(
      `SELECT * FROM purchase_order ORDER BY created_at DESC`,
    );
    return result.rows;
  }

  // ── GET /api/purchase-orders/:id ─────────────────────────────────────────
  static async findById(
    id: number,
  ): Promise<{ po: PurchaseOrder; lines: any[] } | null> {
    const poResult = await pool.query(
      `SELECT * FROM purchase_order WHERE id = $1`,
      [id],
    );
    if (!poResult.rows[0]) return null;

    const linesResult = await pool.query(
      `SELECT pol.*, ii.name AS item_name, ii.sku
       FROM po_line_orders pol
       JOIN inventory_items ii ON ii.id = pol.item_id
       WHERE pol.po_id = $1`,
      [id],
    );
    return { po: poResult.rows[0], lines: linesResult.rows };
  }

  // ── GET /api/purchase-orders/:id/status-history ───────────────────────────
  static async getStatusHistory(poId: number): Promise<any[]> {
    const result = await pool.query(
      `SELECT
           psl.id,
           psl.from_status,
           psl.to_status,
           u.first_name || ' ' || u.last_name AS changed_by,
           psl.remarks,
           psl.changed_at
       FROM po_status_logs psl
       JOIN users u ON u.id = psl.changed_by
       WHERE psl.po_id = $1
       ORDER BY psl.changed_at ASC`,
      [poId],
    );
    return result.rows;
  }

  // ── PATCH /api/purchase-orders/:id/status ────────────────────────────────
  static async transitionStatus(
    id: number,
    data: { to_status: POStatus; changed_by: number; remarks?: string },
  ): Promise<PurchaseOrder> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const current = await client.query(
        `SELECT status FROM purchase_order WHERE id = $1 FOR UPDATE`,
        [id],
      );
      if (!current.rows[0]) {
        const err: any = new Error("Purchase order not found");
        err.statusCode = 404;
        throw err;
      }

      const currentStatus: POStatus = current.rows[0].status;
      const allowed = STATUS_TRANSITIONS[currentStatus] ?? [];

      if (data.to_status === "received") {
        const err: any = new Error(
          "Cannot manually transition to 'received' status. PO must be received through the receiving process.",
        );
        err.statusCode = 400;
        throw err;
      }

      if (!allowed.includes(data.to_status)) {
        const err: any = new Error(
          `Invalid status transition from '${currentStatus}' to '${data.to_status}'`,
        );
        err.statusCode = 400;
        throw err;
      }

      await client.query(
        `UPDATE purchase_order
         SET status = $1, updated_by = $2, updated_at = NOW()
         WHERE id = $3`,
        [data.to_status, data.changed_by, id],
      );

      await client.query(
        `INSERT INTO po_status_logs (po_id, from_status, to_status, changed_by, remarks)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          id,
          currentStatus,
          data.to_status,
          data.changed_by,
          data.remarks ?? null,
        ],
      );

      await client.query("COMMIT");

      const updated = await pool.query(
        `SELECT * FROM purchase_order WHERE id = $1`,
        [id],
      );
      return updated.rows[0];
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── POST /api/purchase-orders/:id/receive ────────────────────────────────
  static async receive(
    poId: number,
    data: {
      received_by: number;
      items: Array<{
        po_line_id: number;
        item_id: number;
        quantity_expected: number;
        quantity_received: number;
      }>;
    },
  ): Promise<any> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // Validate PO is in 'shipped' status
      const poResult = await client.query(
        `SELECT status, warehouse_id FROM purchase_order WHERE id = $1 FOR UPDATE`,
        [poId],
      );
      if (!poResult.rows[0]) {
        const err: any = new Error("Purchase order not found");
        err.statusCode = 404;
        throw err;
      }
      if (poResult.rows[0].status !== "shipped") {
        const err: any = new Error("PO must be in 'shipped' status to receive");
        err.statusCode = 400;
        throw err;
      }
      const warehouseId: number = poResult.rows[0].warehouse_id;

      // Determine receipt status
      const fullyReceived = data.items.every(
        (i) => i.quantity_received === i.quantity_expected,
      );
      const receiptStatus = fullyReceived ? "completed" : "partial";

      // 1. Update PO status to received
      await client.query(
        `UPDATE purchase_order SET status = 'received', updated_by = $1, updated_at = NOW() WHERE id = $2`,
        [data.received_by, poId],
      );

      // 2. Log status change
      await client.query(
        `INSERT INTO po_status_logs (po_id, from_status, to_status, changed_by, remarks)
         VALUES ($1, 'shipped', 'received', $2, 'Items received at warehouse')`,
        [poId, data.received_by],
      );

      // 3. Create receipt header
      const receiptResult = await client.query(
        `INSERT INTO po_receipts (po_id, warehouse_id, received_by, status)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [poId, warehouseId, data.received_by, receiptStatus],
      );
      const receiptId: number = receiptResult.rows[0].id;

      // 4. Get next transaction sequence
      const seqResult = await client.query(
        `SELECT COALESCE(MAX(id), 0) + 1 AS next_seq FROM inventory_transactions`,
      );
      let txnSeq: number = seqResult.rows[0].next_seq;

      // 5. Per item
      for (const item of data.items) {
        if (
          item.quantity_received <= 0 ||
          item.quantity_received > item.quantity_expected
        ) {
          const err: any = new Error(
            `quantity_received must be > 0 and <= quantity_expected for item ${item.item_id}`,
          );
          err.statusCode = 400;
          throw err;
        }

        const lineCheck = await client.query(
          `SELECT id FROM po_line_orders WHERE id = $1 AND item_id = $2 AND po_id = $3`,
          [item.po_line_id, item.item_id, poId],
        );
        if (!lineCheck.rows[0]) {
          const err: any = new Error(
            `Line item validation failed: po_line_id ${item.po_line_id} with item_id ${item.item_id} does not belong to PO ${poId}`,
          );
          err.statusCode = 400;
          throw err;
        }

        const receiptLineResult = await client.query(
          `INSERT INTO po_receipt_lines (receipt_id, po_line_id, item_id, quantity_expected, quantity_received)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id`,
          [
            receiptId,
            item.po_line_id,
            item.item_id,
            item.quantity_expected,
            item.quantity_received,
          ],
        );
        const receiptLineId: number = receiptLineResult.rows[0].id;

        await client.query(
          `INSERT INTO item_locations (item_id, bin_id, quantity, allocation_status, receipt_line_id, created_by)
           VALUES ($1, NULL, $2, 'unallocated', $3, $4)`,
          [
            item.item_id,
            item.quantity_received,
            receiptLineId,
            data.received_by,
          ],
        );

        await client.query(
          `UPDATE po_line_orders SET quantity_received = $1, updated_at = NOW() WHERE id = $2`,
          [item.quantity_received, item.po_line_id],
        );

        const txnNumber = `TXN-${String(txnSeq).padStart(6, "0")}`;
        await client.query(
          `INSERT INTO inventory_transactions (transaction_number, item_id, type, quantity, reason, reference_id, employee_id)
           VALUES ($1, $2, 'in', $3, 'PO Receipt', $4, $5)`,
          [
            txnNumber,
            item.item_id,
            item.quantity_received,
            receiptLineId,
            data.received_by,
          ],
        );
        txnSeq++;
      }

      await client.query("COMMIT");
      return { receipt_id: receiptId, status: receiptStatus };
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  // ── POST /api/purchase-orders/:id/allocate ────────────────────────────────
  static async allocate(
    poId: number,
    data: {
      allocated_by: number;
      allocations: Array<{
        receipt_line_id: number;
        bin_id: number;
        item_id: number;
        quantity: number;
      }>;
    },
  ): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const alloc of data.allocations) {
        // Confirm unallocated row exists for this PO, receipt line, and item
        const existing = await client.query(
          `SELECT il.id, il.quantity
           FROM item_locations il
           JOIN po_receipt_lines prl ON prl.id = il.receipt_line_id
           JOIN po_receipts pr ON pr.id = prl.receipt_id
           WHERE il.receipt_line_id = $1
             AND il.item_id = $2
             AND pr.po_id = $3
             AND il.allocation_status = 'unallocated'`,
          [alloc.receipt_line_id, alloc.item_id, poId],
        );
        if (!existing.rows[0]) {
          const err: any = new Error(
            `No unallocated item_locations row found for receipt_line_id ${alloc.receipt_line_id} and item_id ${alloc.item_id} on PO ${poId}`,
          );
          err.statusCode = 400;
          throw err;
        }

        const unallocatedQty: number = Number(existing.rows[0].quantity);

        // Validate allocation quantity against available unallocated quantity
        if (alloc.quantity <= 0 || alloc.quantity > unallocatedQty) {
          const err: any = new Error(
            `Invalid allocation quantity (${alloc.quantity}). Available unallocated: ${unallocatedQty}`,
          );
          err.statusCode = 400;
          throw err;
        }

        // Confirm bin has space
        const binResult = await client.query(
          `SELECT capacity, current_occupancy FROM bins WHERE id = $1 AND is_active = true`,
          [alloc.bin_id],
        );
        if (!binResult.rows[0]) {
          const err: any = new Error(
            `Bin ${alloc.bin_id} not found or inactive`,
          );
          err.statusCode = 400;
          throw err;
        }
        const available =
          binResult.rows[0].capacity - binResult.rows[0].current_occupancy;
        if (available < alloc.quantity) {
          const err: any = new Error(
            `Bin ${alloc.bin_id} has insufficient space (available: ${available})`,
          );
          err.statusCode = 400;
          throw err;
        }

        if (alloc.quantity === unallocatedQty) {
          // Full allocation — delete the unallocated row, then upsert below
          await client.query(`DELETE FROM item_locations WHERE id = $1`, [
            existing.rows[0].id,
          ]);
        } else {
          // Partial allocation — decrement the unallocated row's quantity
          await client.query(
            `UPDATE item_locations
             SET quantity = quantity - $1, updated_at = NOW()
             WHERE id = $2`,
            [alloc.quantity, existing.rows[0].id],
          );
        }

        // Upsert the allocated row — handles first-time allocation and
        // re-allocation to a bin that already holds qty for this item.
        await client.query(
          `INSERT INTO item_locations
             (item_id, bin_id, quantity, allocation_status, receipt_line_id, allocated_by, allocated_at, created_by)
           VALUES ($1, $2, $3, 'allocated', $4, $5, NOW(), $5)
           ON CONFLICT (item_id, bin_id)
           DO UPDATE SET
             quantity      = item_locations.quantity + EXCLUDED.quantity,
             allocated_by  = EXCLUDED.allocated_by,
             allocated_at  = EXCLUDED.allocated_at,
             updated_at    = NOW()`,
          [
            alloc.item_id,
            alloc.bin_id,
            alloc.quantity,
            alloc.receipt_line_id,
            data.allocated_by,
          ],
        );

        await client.query(
          `UPDATE bins SET current_occupancy = current_occupancy + $1, updated_at = NOW()
           WHERE id = $2`,
          [alloc.quantity, alloc.bin_id],
        );

        await client.query(
          `INSERT INTO inventory_stock (item_id, warehouse_location_id, quantity)
           SELECT $1, b.location_id, $2 FROM bins b WHERE b.id = $3
           ON CONFLICT (item_id, warehouse_location_id)
           DO UPDATE SET quantity = inventory_stock.quantity + $2, updated_at = NOW()`,
          [alloc.item_id, alloc.quantity, alloc.bin_id],
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }
}
