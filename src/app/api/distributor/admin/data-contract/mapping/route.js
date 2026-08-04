export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorErpFieldMapping from "@/models/DistributorErpFieldMapping";

const allowed = new Set(["customerCategory", "creditLimit", "creditDays", "itemEligibility", "pricingRuleCondition", "salesOrderWorkflow"]);

function safeMappings(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).flatMap(([key, field]) => {
    if (!allowed.has(key) || !field?.doctype || !field?.fieldname) return [];
    return [[key, { doctype: String(field.doctype), fieldname: String(field.fieldname), label: String(field.label || "") }]];
  }));
}

export async function GET(req) {
  const user = getDistributorAdminSession(req);
  if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  await dbConnect();
  const document = await DistributorErpFieldMapping.findOne({ companyId: user.companyId }).lean();
  return NextResponse.json({ success: true, mappings: document?.mappings || {} });
}

export async function PUT(req) {
  try {
    const user = getDistributorAdminSession(req);
    if (!user) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    const { mappings } = await req.json();
    await dbConnect();
    const saved = await DistributorErpFieldMapping.findOneAndUpdate(
      { companyId: user.companyId },
      { $set: { mappings: safeMappings(mappings) } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return NextResponse.json({ success: true, mappings: saved.mappings || {} });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || "Could not save mappings" }, { status: 500 });
  }
}
