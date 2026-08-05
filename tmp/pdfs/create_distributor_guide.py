from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.pdfbase.pdfmetrics import stringWidth

OUT = r"D:\CODEX PROJECTS\AITSERP_30072025-main\AITSERP_30072025-main\output\pdf\distributor-app-erpnext-workflow-guide.pdf"

navy = colors.HexColor('#105B92')
blue = colors.HexColor('#EAF4FB')
slate = colors.HexColor('#334155')
muted = colors.HexColor('#64748B')
line = colors.HexColor('#CBD5E1')
amber = colors.HexColor('#FFF7E6')
green = colors.HexColor('#ECFDF5')

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name='TitleCustom', parent=styles['Title'], fontName='Helvetica-Bold', fontSize=22, leading=27, textColor=navy, spaceAfter=8))
styles.add(ParagraphStyle(name='SubTitle', parent=styles['Normal'], fontName='Helvetica', fontSize=10.5, leading=15, textColor=muted, spaceAfter=13))
styles.add(ParagraphStyle(name='H1c', parent=styles['Heading1'], fontName='Helvetica-Bold', fontSize=15, leading=20, textColor=navy, spaceBefore=7, spaceAfter=8))
styles.add(ParagraphStyle(name='H2c', parent=styles['Heading2'], fontName='Helvetica-Bold', fontSize=11.2, leading=14, textColor=slate, spaceBefore=7, spaceAfter=5))
styles.add(ParagraphStyle(name='Bodyc', parent=styles['BodyText'], fontName='Helvetica', fontSize=9.2, leading=13, textColor=slate, spaceAfter=5))
styles.add(ParagraphStyle(name='Small', parent=styles['BodyText'], fontName='Helvetica', fontSize=8.1, leading=10.5, textColor=slate))
styles.add(ParagraphStyle(name='Callout', parent=styles['BodyText'], fontName='Helvetica-Bold', fontSize=9.2, leading=13, textColor=slate))
styles.add(ParagraphStyle(name='Foot', parent=styles['Normal'], fontName='Helvetica', fontSize=7.5, textColor=muted, alignment=TA_CENTER))

def P(text, style='Bodyc'):
    return Paragraph(text, styles[style])

def bullets(items):
    return [P('&bull; ' + item) for item in items]

def info_box(title, text, color=blue):
    table = Table([[P(title, 'Callout')], [P(text, 'Bodyc')]], colWidths=[170*mm])
    table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), color), ('BOX', (0,0), (-1,-1), .5, line),
        ('LEFTPADDING', (0,0), (-1,-1), 10), ('RIGHTPADDING', (0,0), (-1,-1), 10),
        ('TOPPADDING', (0,0), (-1,-1), 6), ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    return table

def grid(headers, rows, widths):
    data = [[P(h, 'Small') for h in headers]] + [[P(x, 'Small') for x in r] for r in rows]
    t = Table(data, colWidths=widths, repeatRows=1, hAlign='LEFT')
    t.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), navy), ('TEXTCOLOR', (0,0), (-1,0), colors.white),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'), ('GRID', (0,0), (-1,-1), .35, line),
        ('VALIGN', (0,0), (-1,-1), 'TOP'), ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6), ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5), ('BACKGROUND', (0,1), (-1,-1), colors.white),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#F8FAFC')]),
    ]))
    return t

def flow_row(n, title, body):
    return Table([[P(str(n), 'Callout'), P('<b>%s</b><br/>%s' % (title, body), 'Bodyc')]], colWidths=[12*mm, 158*mm], style=TableStyle([
        ('BACKGROUND',(0,0),(0,0),navy), ('TEXTCOLOR',(0,0),(0,0),colors.white), ('ALIGN',(0,0),(0,0),'CENTER'),
        ('VALIGN',(0,0),(-1,-1),'MIDDLE'), ('BOX',(0,0),(-1,-1),.4,line), ('LEFTPADDING',(0,0),(-1,-1),6),
        ('RIGHTPADDING',(0,0),(-1,-1),6), ('TOPPADDING',(0,0),(-1,-1),6), ('BOTTOMPADDING',(0,0),(-1,-1),6),
    ]))

def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(line); canvas.line(20*mm, 12*mm, 190*mm, 12*mm)
    canvas.setFont('Helvetica', 7.5); canvas.setFillColor(muted)
    canvas.drawString(20*mm, 7*mm, 'Distributor App - ERPNext workflow guide | Current implementation')
    canvas.drawRightString(190*mm, 7*mm, 'Page %d' % doc.page)
    canvas.restoreState()

doc = SimpleDocTemplate(OUT, pagesize=A4, leftMargin=20*mm, rightMargin=20*mm, topMargin=17*mm, bottomMargin=18*mm)
story = []
story += [P('Distributor App and ERPNext', 'TitleCustom'), P('Client meeting guide: current functionality, data sources, limitations, and end-to-end flow', 'SubTitle')]
story.append(info_box('Purpose of this guide', 'Use this as the speaking note for the current distributor portal. It describes what the application does today in the codebase, and clearly separates live ERPNext records from distributor-submitted follow-up records.', green))
story += [Spacer(1, 8), P('Executive summary', 'H1c')]
story += bullets([
    '<b>Products and stock are read from ERPNext.</b> The distributor portal does not maintain a separate item or stock master for this view.',
    '<b>Sales Orders are created in ERPNext.</b> A distributor selects the preloaded items, adjusts quantities, and submits an ERPNext Sales Order.',
    '<b>Credit Notes are currently a read-only tracker.</b> It lists ERPNext Sales Invoice return documents for the mapped distributor customer.',
    '<b>Payment follow-up is not a payment posting.</b> It saves a portal follow-up record and creates an ERPNext Issue for accounts; ERPNext Payment Entry remains the accounts action that actually records/settles payment.'
])
story += [P('Before demonstrating', 'H2c'), P('Login must resolve the distributor to an ERPNext Customer. The matching priority is configured ERP customer name, then distributor/login identifiers, then matching Contact. Without a mapped Customer, live products, stock, orders, invoices, dispatches, and credit notes return empty, and Sales Order creation is blocked.', 'Bodyc')]

story += [P('1. End-to-end current flow', 'H1c')]
for row in [
    (1, 'Login and customer mapping', 'Distributor signs in by OTP. The portal identifies the account and resolves the linked ERPNext Customer.'),
    (2, 'Read master and live data', 'Portal calls ERPNext for Item, Item Price, Bin, Sales Order, Sales Invoice, Delivery Note, Payment Entry, and invoice-return records scoped to that customer.'),
    (3, 'Browse products and stock', 'User sees item master information, selling price if available, and warehouse quantities. The list is deliberately capped at 60 Items.'),
    (4, 'Create Sales Order', 'User chooses from the preloaded order lines, changes quantity, enters delivery/address/reference/remarks, and submits. The portal posts an ERPNext Sales Order.'),
    (5, 'ERPNext fulfilment', 'Sales/warehouse users process the Sales Order in ERPNext: submit, deliver, invoice, collect payment, and if needed create a Sales Invoice Return / Credit Note.'),
    (6, 'Distributor monitoring and follow-up', 'Portal reflects customer-scoped order, invoice, dispatch, payment, and return data. Distributor can request stock, report delivery issues, and submit payment updates for accounts review.'),
]:
    story += [flow_row(*row), Spacer(1, 4)]

story += [P('2. Sales Order: rate, items, and submission', 'H1c')]
story += [P('Where does the item rate come from?', 'H2c'), P('The Products screen reads ERPNext <b>Item Price</b> rows where <b>selling = 1</b>, for the displayed item codes. The portal uses the first returned price row for an item; the Item Price query is ordered by <b>modified descending</b>. It displays that row&apos;s <b>price_list_rate</b> as the standard rate and shows the price list name as a pricing note.', 'Bodyc')]
story.append(info_box('Important commercial note', 'The current implementation does not apply ERPNext pricing rules, customer-specific price lists, schemes, discounts, taxes, or price-list selection in the portal. It sends the displayed rate with the Sales Order item. ERPNext may validate or calculate additional fields depending on its configuration.', amber))
story += [P('Why does some item show Rs 0 in the order?', 'H2c'), P('When no selling Item Price is returned for an Item, the product card shows <b>Price on request</b>. The Sales Order form converts that non-numeric display value to numeric zero, so that item line appears at Rs 0. This is a data/configuration gap in ERPNext Item Price, not an intended free-item rule.', 'Bodyc')]
story += [P('Why can I see only 60 products?', 'H2c'), P('This is an intentional current portal limit: the ERPNext Item API request uses <b>limit_page_length = 60</b>, sorted by item name. It is not proof that ERPNext has only 60 Items. There is no pagination or live search request wired to the Products screen yet; the visible search field is currently visual only.', 'Bodyc')]
story += [P('How a Sales Order is made today', 'H2c')]
story.append(grid(['Step', 'What user does', 'What portal sends to ERPNext'], [
    ('1', 'Open Orders > New order. The form starts with the first 3 items from the available product list.', 'No ERPNext write yet. The form keeps a device-local draft if Save draft is used.'),
    ('2', 'Adjust quantity with +/- buttons; enter requested delivery date, address, buyer PO/reference, remarks, and payment mode/reference.', 'Only quantity can be altered in the visible item rows; there is no item-picker to add arbitrary items in this form today.'),
    ('3', 'Click Place order.', 'Creates Sales Order with mapped Customer, current transaction date, requested delivery date, PO no., preferred warehouse (if set), remarks, and item code/qty/rate/UOM/schedule date.'),
    ('4', 'Review Orders and then ERPNext.', 'ERPNext returns the Sales Order number. Subsequent fulfillment stays in ERPNext and later appears in portal order/invoice/dispatch views.'),
], [15*mm, 70*mm, 85*mm]))

story += [PageBreak(), P('3. Stock: source and quantity definitions', 'H1c')]
story += [P('Where does current stock come from?', 'H2c'), P('The Stock page is fed from ERPNext <b>Bin</b> records. Each row is an Item plus Warehouse combination. If the distributor account has a preferred warehouse, the portal filters Bin records to that warehouse; otherwise it retrieves the available Bin rows for the displayed item codes. The Products card&apos;s stock value is the summed <b>projected quantity</b> across returned Bin rows.', 'Bodyc')]
story.append(grid(['Portal field', 'ERPNext Bin field', 'Meaning in this portal'], [
    ('Actual Qty', 'actual_qty', 'Current physical/book quantity reported by ERPNext for that Item-Warehouse.'),
    ('Reserved Qty', 'reserved_qty', 'Quantity already committed/reserved by ERPNext for demand. The portal shows the value as returned; it does not calculate it.'),
    ('Projected Qty', 'projected_qty', 'ERPNext projected quantity for that Item-Warehouse. The portal shows the returned value and uses it for product stock display/status.'),
    ('Status', 'Portal calculation', 'Low if projected <= 0; Watch if projected <= 25% of actual; otherwise Healthy.'),
], [35*mm, 38*mm, 97*mm]))
story += [Spacer(1, 7), info_box('Demo language to use', '“These numbers are live visibility from ERPNext Bin records. The portal is displaying ERPNext&apos;s quantities, not calculating a new inventory balance.”', blue)]
story += [Spacer(1, 8), P('Stock request action', 'H2c'), P('From Stock > Request stock, the distributor can submit a Material Request with item, quantity, schedule date, warehouse, purpose, and remarks. The system tries to create an ERPNext <b>Material Request</b> (Material Transfer). If that fails, it creates an ERPNext Issue as a fallback so the request is still visible to the team.', 'Bodyc')]

story += [P('4. Credit Notes: what it means and what can be done', 'H1c')]
story += [P('Why is the Credit Notes list blank?', 'H2c'), P('The distributor Credit Notes page looks for ERPNext <b>Sales Invoice</b> documents with <b>is_return = 1</b>, not cancelled, and belonging to the mapped distributor Customer. A blank list means no qualifying submitted/non-cancelled Sales Invoice return was found for that customer, or the customer mapping/integration is not available. It does not mean that the UI failed to load a separate local credit-note module.', 'Bodyc')]
story += [P('What is the purpose of this section?', 'H2c'), P('It is a finance visibility screen. It shows the credit-note number, original invoice (return_against), posting date, amount, and status. The same return records also contribute to the portal finance summary and ledger as Credit Note movements.', 'Bodyc')]
story += [P('What can be done after a list is displayed?', 'H2c'), P('<b>Current distributor portal behavior: read only.</b> Users can review/filter visually the list information, then use Finance to review the related ledger/outstanding. The current screen has no action to open a detail page, create a credit note, edit it, submit/cancel it, download it, or apply it against an invoice.', 'Bodyc')]
story.append(info_box('ERPNext operating flow', 'An authorised ERP/accounts user creates the Sales Invoice Return / Credit Note in ERPNext, links it to the original invoice, and submits it. Once it meets the portal query filters, it appears automatically on the distributor Credit Notes screen on refresh. Creating a distributor-side credit-note workflow is a future enhancement, not a current portal action.', amber))

story += [P('5. Finance and payment follow-up', 'H1c')]
story += [P('What Payment follow-up does', 'H2c'), P('The distributor selects an existing ERPNext Sales Invoice, enters mode, amount, UTR/cheque/reference, optionally uploads proof, and can request notification to accounts. The portal saves a local Distributor Payment Update with its own update number and workflow/audit records. The attached proof is uploaded to the portal workflow attachment store.', 'Bodyc')]
story += [P('ERPNext connection for payment follow-up', 'H2c'), P('The current sync creates an ERPNext <b>Issue</b> titled “Distributor payment update ...” containing the invoice number, payment mode, amount, reference, and notify-accounts flag. It does <b>not</b> create an ERPNext Payment Entry, reconcile the invoice, or change its outstanding amount. Accounts must verify the proof and create/submit the proper Payment Entry in ERPNext.', 'Bodyc')]
story.append(grid(['Action', 'System of record today', 'Result'], [
    ('Submit follow-up', 'Portal local workflow record', 'Update is saved and appears in Recent payment updates with ERP sync status.'),
    ('Notify/sync', 'ERPNext Issue', 'Accounts receives a traceable follow-up ticket when ERPNext connection works.'),
    ('Actual receipt / settlement', 'ERPNext Payment Entry', 'Must be done by accounts in ERPNext. It is not performed by the distributor portal form.'),
], [35*mm, 57*mm, 78*mm]))

story += [PageBreak(), P('6. Client-ready walkthrough', 'H1c')]
story += [P('Suggested 5-minute demo sequence', 'H2c')]
story += bullets([
    'Sign in, then point out that the dashboard is scoped to the linked ERPNext Customer.',
    'Open Products: explain item master, selling price, stock UOM, and the 60-item current limit. Call out any “Price on request” item as an ERPNext Item Price setup item.',
    'Open Stock: show ERPNext warehouse-level actual, reserved, and projected quantities, then show Request stock as the escalation route.',
    'Open New Order: adjust item quantities, add delivery/reference details, and submit. Explain that this creates an ERPNext Sales Order, not merely a local portal order.',
    'Open Orders / Dispatch / Invoices: explain that they reflect ERPNext operational and finance documents for the mapped customer.',
    'Open Credit Notes: explain this is a read-only return/adjustment tracker, filled only after ERPNext Sales Invoice returns exist.',
    'Open Finance: show invoice/ledger visibility and Payment follow-up. State clearly that payment follow-up notifies accounts; accounts posts the actual Payment Entry in ERPNext.'
])
story += [P('Current boundaries and next improvements', 'H2c')]
story.append(grid(['Area', 'Current setup', 'Recommended next step'], [
    ('Products', 'First 60 active Items; static visual search.', 'Add server-side search, pagination, and distributor-specific Item/Item Group filtering.'),
    ('Pricing', 'Latest returned selling Item Price used; missing price becomes Rs 0 in order form.', 'Block zero-price order submission and resolve ERPNext price list / pricing rules customer-specifically.'),
    ('Sales Order items', 'New Order starts with first 3 product lines; quantity control only.', 'Add item search/add/remove and real-time price/stock validation before submission.'),
    ('Credit Notes', 'Read-only ERPNext return tracker.', 'Add detail/download and, if approved, a controlled return/credit request workflow.'),
    ('Payment follow-up', 'Creates local update and ERPNext Issue.', 'Optionally create a draft Payment Entry or clear accounts action, with approval controls, if business policy permits.'),
], [33*mm, 65*mm, 72*mm]))
story += [Spacer(1, 8), info_box('One sentence for the client', '“The distributor app is a customer-scoped operating portal over ERPNext: it reads catalog, inventory, documents and balances from ERPNext, creates Sales Orders there, and routes operational follow-ups to the responsible team with an audit trail.”', green)]
story += [Spacer(1, 9), P('Prepared from the current application implementation. Field availability and totals depend on the ERPNext data and permissions configured for the distributor customer.', 'Small')]

doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUT)
