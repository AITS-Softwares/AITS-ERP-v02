export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { getDistributorAdminSession } from "@/lib/distributorAdminAuth";
import DistributorAccount from "@/models/DistributorAccount";
import DistributorOffer from "@/models/DistributorOffer";

function unauthorized() {
  return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
}

async function getCompanyUser(req) {
  return getDistributorAdminSession(req);
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

export async function GET(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    await dbConnect();

    const [offers, accounts] = await Promise.all([
      DistributorOffer.find({ companyId: user.companyId })
        .populate("distributorAccountId", "displayName distributorCode")
        .sort({ createdAt: -1 })
        .lean(),
      DistributorAccount.find({ companyId: user.companyId, isActive: true })
        .select("displayName distributorCode")
        .sort({ displayName: 1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      offers: offers.map((offer) => ({
        id: String(offer._id),
        title: offer.title,
        description: offer.description,
        schemeTag: offer.schemeTag || "",
        itemCode: offer.itemCode || "",
        minQty: offer.minQty || 0,
        rateNote: offer.rateNote || "",
        bannerUrl: offer.bannerUrl || "",
        validityLabel: offer.validityLabel || "",
        startDate: formatDate(offer.startDate),
        endDate: formatDate(offer.endDate),
        isActive: offer.isActive !== false,
        targetType: offer.distributorAccountId ? "specific" : "all",
        distributorAccountId: offer.distributorAccountId?._id ? String(offer.distributorAccountId._id) : "",
        targetLabel: offer.distributorAccountId
          ? `${offer.distributorAccountId.displayName || ""} (${offer.distributorAccountId.distributorCode || ""})`.trim()
          : "All distributors",
      })),
      distributorAccounts: accounts.map((account) => ({
        id: String(account._id),
        label: `${account.displayName || "Distributor"} (${account.distributorCode || ""})`.trim(),
      })),
    });
  } catch (error) {
    console.error("Admin distributor offers GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch distributor offers" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const title = String(body.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, message: "Offer title is required" }, { status: 400 });
    }

    await dbConnect();

    const targetType = String(body.targetType || "all").trim();
    const distributorAccountId = targetType === "specific" ? String(body.distributorAccountId || "").trim() : "";

    const offer = await DistributorOffer.create({
      companyId: user.companyId,
      distributorAccountId: distributorAccountId || null,
      title,
      description: String(body.description || "").trim(),
      schemeTag: String(body.schemeTag || "").trim(),
      itemCode: String(body.itemCode || "").trim(),
      minQty: Number(body.minQty || 0),
      rateNote: String(body.rateNote || "").trim(),
      bannerUrl: String(body.bannerUrl || "").trim(),
      validityLabel: String(body.validityLabel || "").trim(),
      startDate: body.startDate ? new Date(body.startDate) : null,
      endDate: body.endDate ? new Date(body.endDate) : null,
      isActive: body.isActive !== false,
    });

    return NextResponse.json({
      success: true,
      message: `Offer ${offer.title} created successfully`,
    });
  } catch (error) {
    console.error("Admin distributor offers POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to create distributor offer" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const user = await getCompanyUser(req);
    if (!user) return unauthorized();

    const body = await req.json().catch(() => ({}));
    const offerId = String(body.offerId || "").trim();
    if (!offerId) {
      return NextResponse.json({ success: false, message: "Offer id is required" }, { status: 400 });
    }

    await dbConnect();

    const offer = await DistributorOffer.findOneAndUpdate(
      { _id: offerId, companyId: user.companyId },
      { $set: { isActive: body.isActive === true } },
      { new: true }
    );

    if (!offer) {
      return NextResponse.json({ success: false, message: "Offer not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: `Offer ${offer.isActive ? "activated" : "deactivated"} successfully`,
    });
  } catch (error) {
    console.error("Admin distributor offers PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update distributor offer" }, { status: 500 });
  }
}
