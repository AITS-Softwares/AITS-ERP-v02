# Distributor authoritative pricing endpoint

The distributor web app deliberately does **not** recreate ERPNext Pricing Rule logic. The ERPNext site must expose one whitelisted method that builds an unsaved Sales Order, lets ERPNext calculate its normal pricing/taxes, and returns the calculated values.

The app calls this method by default:

`aitserp_distributor.api.pricing.preview_sales_order`

Set `ERP_NEXT_DISTRIBUTOR_PRICING_METHOD` in the web app environment only if your deployed custom-app method uses a different dotted path.

## ERPNext custom app implementation

Create `aitserp_distributor/api/pricing.py` on the ERPNext site (inside the customer custom app), then adapt the exact controller calls to the installed ERPNext version:

```python
import frappe
from frappe import _


@frappe.whitelist()
def preview_sales_order(customer, company=None, selling_price_list=None, currency=None,
                        transaction_date=None, delivery_date=None, warehouse=None, items=None):
    if isinstance(items, str):
        items = frappe.parse_json(items)
    items = items or []
    if not customer or not items:
        frappe.throw(_("Customer and at least one item are required"))

    sales_order = frappe.get_doc({
        "doctype": "Sales Order",
        "customer": customer,
        "company": company or frappe.defaults.get_user_default("Company"),
        "selling_price_list": selling_price_list,
        "currency": currency,
        "transaction_date": transaction_date or frappe.utils.today(),
        "delivery_date": delivery_date or frappe.utils.today(),
        "set_warehouse": warehouse,
        "items": [{
            "item_code": row.get("item_code"),
            "qty": row.get("qty") or 1,
            "uom": row.get("uom"),
            "warehouse": warehouse,
            "schedule_date": delivery_date or frappe.utils.today(),
        } for row in items],
    })

    # These are the normal Sales Order calculations. Keep any site-specific
    # hooks/customisations enabled; do not insert or submit this preview document.
    sales_order.set_missing_values()
    sales_order.run_method("apply_pricing_rule")
    sales_order.calculate_taxes_and_totals()

    return {
        "items": [{
            "item_code": row.item_code,
            "item_name": row.item_name,
            "uom": row.uom,
            "qty": row.qty,
            "price_list_rate": row.price_list_rate,
            "rate": row.rate,
            "amount": row.amount,
            "discount_percentage": row.discount_percentage,
            "discount_amount": row.discount_amount,
            "pricing_rules": row.pricing_rules or [],
        } for row in sales_order.items],
        "net_total": sales_order.net_total,
        "total_taxes_and_charges": sales_order.total_taxes_and_charges,
        "grand_total": sales_order.grand_total,
        "currency": sales_order.currency,
        "selling_price_list": sales_order.selling_price_list,
    }
```

## Security and operations

- Require the same API user used by the integration to have only the needed Customer, Item, Item Price, Pricing Rule, and Sales Order read permissions.
- Validate the mapped customer server-side. The web app already derives it from the authenticated distributor mapping and never accepts a customer from the browser.
- Do not insert or submit the preview Sales Order.
- The app caches an exact cart/context preview for 60 seconds only. Its key includes customer, dates, warehouse, price list, currency, item, UOM, and quantity.
- The submitted Sales Order continues to omit client-supplied rates, so ERPNext recalculates pricing again at creation time. This prevents tampering and keeps the saved order authoritative.
- For immediate invalidation after Item Price, Pricing Rule, Customer, or Price List updates, add ERPNext document-event webhooks in the next subphase. The 60-second cache is the safe fallback until then.
