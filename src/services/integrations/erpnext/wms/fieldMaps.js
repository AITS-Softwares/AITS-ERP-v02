// These maps are the WMS contract with ERPNext. Future forms must send the
// ERPNext field names below instead of creating a parallel warehouse model.
export const WMS_FIELD_MAPS = {
  Item: [
    { erpnext: "item_code", screen: "Item Code", type: "Data", required: true },
    { erpnext: "item_name", screen: "Item Name", type: "Data", required: true },
    { erpnext: "item_group", screen: "Item Group", type: "Link (Item Group)", required: true },
    { erpnext: "stock_uom", screen: "Stock UOM", type: "Link (UOM)", required: true },
    { erpnext: "disabled", screen: "Disabled", type: "Check", required: false },
    { erpnext: "barcodes[]", screen: "Barcodes", type: "Table", required: false },
    { erpnext: "uoms[]", screen: "Alternate UOMs", type: "Table", required: false },
  ],
  UOM: [
    { erpnext: "name", screen: "UOM", type: "Data", required: true },
    { erpnext: "must_be_whole_number", screen: "Whole Number Only", type: "Check", required: false },
  ],
  Warehouse: [
    { erpnext: "warehouse_name", screen: "Warehouse Name", type: "Data", required: true },
    { erpnext: "parent_warehouse", screen: "Parent Warehouse", type: "Link (Warehouse)", required: false },
    { erpnext: "company", screen: "Company", type: "Link (Company)", required: true },
    { erpnext: "is_group", screen: "Is Group", type: "Check", required: false },
    { erpnext: "disabled", screen: "Disabled", type: "Check", required: false },
  ],
  Supplier: [
    { erpnext: "name", screen: "Supplier Code", type: "Data", required: true },
    { erpnext: "supplier_name", screen: "Supplier Name", type: "Data", required: true },
    { erpnext: "supplier_group", screen: "Supplier Group", type: "Link (Supplier Group)", required: false },
    { erpnext: "disabled", screen: "Disabled", type: "Check", required: false },
  ],
  "Purchase Order": [
    { erpnext: "supplier", screen: "Supplier", type: "Link (Supplier)", required: true },
    { erpnext: "company", screen: "Company", type: "Link (Company)", required: true },
    { erpnext: "schedule_date", screen: "Required By", type: "Date", required: true },
    { erpnext: "set_warehouse", screen: "Target Warehouse", type: "Link (Warehouse)", required: false },
    { erpnext: "items[].item_code", screen: "Item", type: "Link (Item)", required: true },
    { erpnext: "items[].uom", screen: "UOM", type: "Link (UOM)", required: true },
    { erpnext: "items[].qty", screen: "Quantity", type: "Float", required: true },
    { erpnext: "items[].rate", screen: "Rate", type: "Currency", required: true },
    { erpnext: "items[].warehouse", screen: "Line Warehouse", type: "Link (Warehouse)", required: false },
  ],
  "Purchase Receipt": [
    { erpnext: "supplier", screen: "Supplier", type: "Link (Supplier)", required: true },
    { erpnext: "company", screen: "Company", type: "Link (Company)", required: true },
    { erpnext: "set_warehouse", screen: "Receiving Warehouse", type: "Link (Warehouse)", required: false },
    { erpnext: "items[].item_code", screen: "Item", type: "Link (Item)", required: true },
    { erpnext: "items[].uom", screen: "UOM", type: "Link (UOM)", required: true },
    { erpnext: "items[].qty", screen: "Received Quantity", type: "Float", required: true },
    { erpnext: "items[].rejected_qty", screen: "Rejected Quantity", type: "Float", required: false },
    { erpnext: "items[].batch_no", screen: "Batch Number", type: "Link (Batch)", required: false },
    { erpnext: "items[].purchase_order", screen: "Against Purchase Order", type: "Link (Purchase Order)", required: false },
    { erpnext: "items[].purchase_order_item", screen: "Against PO Row", type: "Data", required: false },
  ],
};

