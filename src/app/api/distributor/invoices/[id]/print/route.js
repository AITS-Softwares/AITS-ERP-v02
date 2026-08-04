export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getDistributorSession, unauthorizedDistributorResponse } from "@/lib/distributorSession";
import { resolveERPNextDistributorContext } from "@/services/integrations/erpnext/distributorIdentityService";
import { erpnextRequestWithConfig } from "@/services/integrations/erpnext/erpnextClient";

const text = (value) => String(value || "").trim();

async function inlinePrintImages(html, config) {
  const sources = [...html.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map((match) => match[1]).filter((source) => source && !source.startsWith("data:"));
  const replacements = new Map();
  for (const source of [...new Set(sources)].slice(0, 20)) {
    try {
      const url = new URL(source, `${config.baseUrl}/`);
      if (url.origin !== new URL(config.baseUrl).origin) continue;
      const response = await fetch(url, { headers: { Authorization: `token ${config.apiKey}:${config.apiSecret}` } });
      const type = response.headers.get("content-type") || "image/png";
      if (!response.ok || !type.startsWith("image/")) continue;
      const base64 = Buffer.from(await response.arrayBuffer()).toString("base64");
      replacements.set(source, `data:${type};base64,${base64}`);
    } catch {
      // Keep the original URL if ERPNext does not expose this image to the API user.
    }
  }
  return replacements.size ? html.replace(/(<img\b[^>]*\bsrc=["'])([^"']+)(["'])/gi, (whole, before, source, after) => replacements.has(source) ? `${before}${replacements.get(source)}${after}` : whole) : html;
}

export async function GET(req, { params }) {
  try {
    const session = await getDistributorSession(req);
    if (!session) return unauthorizedDistributorResponse();
    const { id } = await params;
    const invoiceId = text(id);
    const context = await resolveERPNextDistributorContext(session);
    if (!invoiceId || !context?.config || !context.customer?.name) return NextResponse.json({ success: false, message: "Invoice and ERPNext customer mapping are required" }, { status: 400 });

    const invoiceResponse = await erpnextRequestWithConfig(context.config, `/api/resource/Sales%20Invoice/${encodeURIComponent(invoiceId)}`, { method: "GET" });
    const invoice = invoiceResponse?.data;
    if (!invoice || ![text(context.customer.name), text(context.customer.customer_name)].includes(text(invoice.customer))) return NextResponse.json({ success: false, message: "Invoice not found for this distributor" }, { status: 404 });

    // Do not send `format`: the ERPNext Print view resolves the configured
    // default Print Format for Sales Invoice, including a custom default.
    const query = new URLSearchParams({ doctype: "Sales Invoice", name: invoiceId, no_letterhead: "0" });
    const response = await fetch(`${context.config.baseUrl}/printview?${query}`, { headers: { Authorization: `token ${context.config.apiKey}:${context.config.apiSecret}` } });
    const html = await response.text();
    if (!response.ok || !html.trim()) return NextResponse.json({ success: false, message: "ERPNext could not render the invoice Print view" }, { status: response.status || 502 });
    const hydratedHtml = await inlinePrintImages(html, context.config);
    const printRules = "<style>@page{size:A4;margin:0} @media print{html,body{margin:0!important;padding:0!important}.print-format{margin:0 auto!important}}</style>";
    const printHtml = /<head[^>]*>/i.test(hydratedHtml)
      ? hydratedHtml.replace(/<head([^>]*)>/i, `<head$1><base href="${context.config.baseUrl}/">${printRules}`)
      : `<!doctype html><html><head><base href="${context.config.baseUrl}/">${printRules}</head><body>${hydratedHtml}</body></html>`;
    return new NextResponse(printHtml, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "private, no-store" } });
  } catch (error) { return NextResponse.json({ success: false, message: error.message || "Failed to prepare ERPNext print view" }, { status: 500 }); }
}
