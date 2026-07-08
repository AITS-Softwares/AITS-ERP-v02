# Distributor ERPNext-First Plan

## Short source map

| Screen / module | Final source |
| --- | --- |
| Dashboard stats | ERPNext live + local app notifications |
| Products | ERPNext Item + Item Price |
| Stock | ERPNext Bin |
| Orders list/detail | ERPNext Sales Order |
| New order | Create in ERPNext Sales Order |
| Invoices | ERPNext Sales Invoice |
| Credit notes | ERPNext Sales Invoice returns / Credit Note equivalent |
| Finance summary / ledger | ERPNext Sales Invoice + Payment Entry |
| Dispatch | ERPNext Delivery Note |
| Profile basics | ERPNext Customer + local app account meta |
| Team access | Local app users |
| Offers | Local app offers for now |
| Complaints | Local app workflow + ERPNext sync |
| Stock requests | Local app workflow + ERPNext sync |
| Payment updates | Local app workflow + ERPNext sync |
| Dispatch reviews | Local app workflow + ERPNext sync |

## What must be removed

- Local business master reads from:
  - `ItemModels`
  - `SalesOrder`
  - `SalesInvoice`
  - `Payment`
  - `deliveryModels`
  - `CreditMemo`
- Local `Customer` must stop being the business source for distributor data.

## Phase order

1. Main distributor app API becomes ERPNext-first.
2. Finance export becomes ERPNext-first.
3. Session/auth stops depending on local `Customer` for business identity.
4. OTP lookup adds ERPNext customer/contact lookup path.
5. Distributor account model reduces to app mapping/meta only.
6. Remaining admin screens remove local-customer dependency where not needed.
