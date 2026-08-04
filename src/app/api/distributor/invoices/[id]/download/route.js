export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { resolveERPNextDistributorContext } from "@/services/integrations/erpnext/distributorIdentityService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

function text(value) { return String(value || "").trim(); }

export async function GET(req, { params }) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    const { id } = await params;
    const invoiceId = text(id);
    if (!invoiceId) return NextResponse.json({ success: false, message: "Invoice number is required" }, { status: 400 });

    const context = await resolveERPNextDistributorContext(session);
    if (!context?.config || !context.customer?.name) return NextResponse.json({ success: false, message: "ERPNext customer mapping is required to download this invoice" }, { status: 400 });

    const invoiceResponse = await erpnextRequestWithConfig(context.config, `/api/resource/Sales%20Invoice/${encodeURIComponent(invoiceId)}`, { method: "GET" });
    const invoice = invoiceResponse?.data;
    if (!invoice || ![text(context.customer.name), text(context.customer.customer_name)].includes(text(invoice.customer))) {
      return NextResponse.json({ success: false, message: "Invoice not found for this distributor" }, { status: 404 });
    }

    // Ask ERPNext which format is configured as the DocType default, then pass
    // it explicitly. Omitting `format` can produce an empty response on some
    // ERPNext/Frappe versions.
    const doctypeResponse = await erpnextRequestWithConfig(context.config, "/api/resource/DocType/Sales%20Invoice", { method: "GET" }).catch(() => null);
    const printFormat = text(doctypeResponse?.data?.default_print_format) || "Standard";
    const query = new URLSearchParams({ doctype: "Sales Invoice", name: invoiceId, format: printFormat, no_letterhead: "0" });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), context.config.timeoutMs || 15000);
    let response;
    try {
      response = await fetch(`${context.config.baseUrl}/api/method/frappe.utils.print_format.download_pdf?${query}`, {
        method: "GET",
        signal: controller.signal,
        headers: { Authorization: `token ${context.config.apiKey}:${context.config.apiSecret}` },
      });
    } finally { clearTimeout(timeout); }
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      return NextResponse.json({ success: false, message: `ERPNext could not generate the invoice PDF${detail ? `: ${detail.replace(/<[^>]+>/g, "").slice(0, 160)}` : ""}` }, { status: response.status || 502 });
    }
    const pdf = await response.arrayBuffer();
    const bytes = new Uint8Array(pdf);
    const isPdf = bytes.length > 4 && String.fromCharCode(...bytes.slice(0, 4)) === "%PDF";
    if (!isPdf) {
      const body = new TextDecoder().decode(bytes.slice(0, 240)).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
      return NextResponse.json({ success: false, message: body ? `ERPNext did not return a PDF: ${body}` : "ERPNext returned an empty print response." }, { status: 502 });
    }
    return new NextResponse(pdf, { headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename=${invoiceId}.pdf`, "Cache-Control": "private, no-store" } });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.name === "AbortError" ? "ERPNext PDF generation timed out" : error.message || "Failed to download ERPNext invoice PDF" }, { status: 500 });
  }
}
