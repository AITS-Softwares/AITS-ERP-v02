# Distributor Sales Order approval workflow

The distributor app creates an ERPNext Sales Order. ERPNext must remain the approval authority, audit trail, and notification engine.

## Role

Create one ERPNext role:

`Distributor Sales Order Approver`

Assign it to every ERPNext user allowed to approve or reject distributor orders. Do not hard-code an approver in the web app.

## Workflow

Create an ERPNext Workflow for the `Sales Order` doctype with these states:

| State | Docstatus | Who acts | Allowed transition |
| --- | --- | --- | --- |
| Pending Approval | Draft | Distributor app creates this state | Approve / Reject |
| Approved | Draft or Submitted, according to the client's existing Sales Order process | Distributor Sales Order Approver | Cancel |
| Rejected | Cancelled or Draft, according to the client's audit policy | Distributor Sales Order Approver | — |
| Cancelled | Cancelled | ERPNext authorised user | — |

Set `Pending Approval` as the workflow's initial state. ERPNext therefore assigns this state when the distributor app creates a Sales Order; the app does not forge approval state or transitions.

## Notifications

Configure ERPNext Notification / Assignment Rule for a new `Pending Approval` Sales Order. Initially, notify every user with `Distributor Sales Order Approver`. Territory and Item Group routing will replace this broad recipient group once the client confirms the mapping source.

Create a second ERPNext notification for changes to `delivery_date` after initial creation. It should notify the same approver group and include order number, customer, previous date, new date, and editor.

## App enforcement

- Requested delivery date is mandatory and cannot be earlier than the order date.
- The app never defaults a missing date to today.
- The app displays the ERPNext workflow state returned after creation.
- Approval, rejection, cancellation, and stock reservation are handled by ERPNext workflow actions in later phases.
