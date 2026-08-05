# WMS ERPNext Field-Mapping Contract

## Rule

ERPNext is the only source of truth for warehouse data. WMS screens must use
the ERPNext doctype and field names below. They must not write stock, purchase
orders, warehouses, UOMs, batches, serial numbers, or barcodes to MongoDB.

## Phase 1 coverage (read-only)

| WMS screen | ERPNext doctype | Required ERPNext fields |
| --- | --- | --- |
| Items | Item | `item_code`, `item_name`, `item_group`, `stock_uom`, `disabled`, `uoms`, `barcodes` |
| Warehouses | Warehouse | `warehouse_name`, `parent_warehouse`, `company`, `is_group`, `disabled` |
| Units of Measure | UOM | `name`, `must_be_whole_number` |
| Purchase Orders (list) | Purchase Order | `supplier`, `schedule_date`, `set_warehouse`, `items.item_code`, `items.uom`, `items.qty`, `items.rate` |
| Suppliers | Supplier | `supplier_name`, `supplier_group`, `country`, `disabled` |

## Phase 2 coverage (create / submit)

| WMS screen | ERPNext doctype | Required ERPNext fields | Write behaviour |
| --- | --- | --- | --- |
| Purchase Order create | Purchase Order | `supplier`, `company`, `transaction_date`, `schedule_date`, `set_warehouse`, `items.item_code`, `items.uom`, `items.qty`, `items.rate`, `items.warehouse` | Insert as draft (`docstatus 0`); "Submit Purchase Order" separately calls `frappe.client.submit`. A draft can also be submitted later from its detail screen. |
| Purchase Order detail | Purchase Order | full document, incl. `items.name` (child row id) and `items.received_qty` | Read-only view + submit action. |
| GRN (create) | Purchase Receipt | `supplier`, `company`, `set_warehouse`, `posting_date`, `items.item_code`, `items.uom`, `items.qty`, `items.rejected_qty`, `items.batch_no`, `items.warehouse`, `items.purchase_order`, `items.purchase_order_item`, `items.rate` | Insert **and submit** in one action ("Confirm GRN") — this is the real stock-in event; ERPNext's ledger updates immediately. Item code, UOM, and rate are always taken from the linked Purchase Order row, never trusted from the browser. |
| GRN detail / print | Purchase Receipt | full document | Read-only view with a browser print action (label/receipt stub). |

## Implementation rule for later phases

1. Read the current document from ERPNext before editing it.
2. Send the ERPNext doctype field names back through `/api/wms/*`.
3. Let ERPNext validate, save, and submit the document.
4. Never calculate or store a second stock balance in AITSERP.
5. Insert and submit are two separate ERPNext calls (`POST /api/resource/{doctype}` then `POST /api/method/frappe.client.submit`) — never fabricate a submitted state locally.

## Known Phase 2 simplifications (carried forward, not silently dropped)

- Line UOM on both Purchase Order and GRN is chosen from the general UOM master, not validated against the Item's own conversion-factor UOM table (`Item.uoms`) — that validation is deferred to Phase 3 alongside Master Carton UOM setup, since Frappe's list API cannot return child-table data and a single-item detail fetch per line was judged out of scope for Phase 2.
- Purchase Order "edit" (changing a saved draft's lines) is not implemented — only create, submit, and read. Editing a draft has to go through ERPNext directly for now.
- GRN batch number is a free-text field sent through as `items.batch_no` regardless of the item's `has_batch_no` flag; ERPNext validates/rejects it server-side. The screen does not yet hide the field for non-batch items.
- The GRN screen does not cap "Received qty" at the PO's pending quantity — ERPNext's own validation is the backstop, matching the "ERPNext is the only source of truth" rule above.
