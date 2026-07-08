export const runtime = "nodejs";

import { jsPDF } from "jspdf";
import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import SalesInvoice from "@/models/SalesInvoice";
import { buildDistributorAppData } from "@/services/distributor/buildDistributorAppData";
import { buildDistributorConnectedAppData } from "@/services/integrations/erpnext/distributorAppService";

function cleanText(value) {
  return String(value || "").trim();
}

export async function GET(req, { params }) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();

    const invoiceId = cleanText(params?.id);
    if (!invoiceId) {
      return NextResponse.json({ success: false, message: "Invoice number is required" }, { status: 400 });
    }

    const baseData = await buildDistributorAppData(session);
    const data = await buildDistributorConnectedAppData(session, { baseData }).catch(() => baseData);
    const invoice = (data.invoices || []).find((item) => cleanText(item.invoiceNumber || item.id) === invoiceId);

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Invoice not found for this distributor" }, { status: 404 });
    }

    const customerId = session.customer?._id || null;
    const customerCode = cleanText(session.customer?.customerCode);
    const localInvoice = await SalesInvoice.findOne({
      companyId: session.companyId,
      invoiceNumber: invoiceId,
      ...(customerId || customerCode
        ? {
            $or: [
              ...(customerId ? [{ customer: customerId }] : []),
              ...(customerCode ? [{ customerCode }] : []),
            ],
          }
        : {}),
    }).lean();

    const doc = new jsPDF();
    let y = 18;
    const move = (gap = 8) => {
      y += gap;
      return y;
    };

    doc.setFontSize(18);
    doc.text("Distributor Invoice Summary", 14, y);
    doc.setFontSize(11);
    doc.text(`Invoice: ${invoice.invoiceNumber || invoice.id}`, 14, move());
    doc.text(`Customer: ${session.customer?.customerName || session.account?.displayName || "-"}`, 14, move(7));
    doc.text(`Posting Date: ${invoice.postingDate || "-"}`, 14, move(7));
    doc.text(`Due Date: ${invoice.dueDate || "-"}`, 14, move(7));
    doc.text(`Status: ${invoice.paymentStatus || invoice.status || "-"}`, 14, move(7));
    doc.text(`Grand Total: ${invoice.grandTotal || invoice.amount || "-"}`, 14, move(7));
    doc.text(`Outstanding: ${invoice.remainingAmount || invoice.balance || "-"}`, 14, move(7));
    doc.text(`Reference: ${invoice.salesOrder || invoice.orderId || "-"}`, 14, move(7));

    if (cleanText(invoice.remarks || localInvoice?.remarks)) {
      doc.text(`Remarks: ${cleanText(invoice.remarks || localInvoice?.remarks)}`, 14, move(10));
    }

    const items = Array.isArray(localInvoice?.items) ? localInvoice.items : [];
    if (items.length) {
      move(12);
      doc.setFontSize(13);
      doc.text("Items", 14, y);
      doc.setFontSize(10);

      items.slice(0, 12).forEach((item) => {
        move(7);
        doc.text(
          `${cleanText(item.itemCode)} | ${cleanText(item.itemName)} | Qty ${item.quantity || 0} | ${Number(item.totalAmount || 0).toLocaleString("en-IN")}`,
          14,
          y
        );
      });
    }

    const pdf = doc.output("arraybuffer");
    return new NextResponse(Buffer.from(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename=${invoiceId}.pdf`,
      },
    });
  } catch (error) {
    console.error("Distributor invoice download error:", error);
    return NextResponse.json({ success: false, message: "Failed to download invoice document" }, { status: 500 });
  }
}
